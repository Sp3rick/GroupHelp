var LGHelpTemplate = require("../GHbot.js")
const {bold, punishmentToText, punishmentToTextAndTime, handlePunishmentCallback, genPunishButtons, isNumber, isValidUsername, isValidHost, isString } = require("../api/utils.js");
const ST = require("../api/setTime.js");
const SE = require("../api/setExceptions.js");
const CBP = require("../api/setChatbasedPunish.js");

function is8BitNumber(num)
{
    if(isNumber(num) && num >= 0 && num <= 255)
        return true;
    return false;
}

//Be sure to store only t.me/path
function tgLinkValidator(string)
{
    
    if(!isString(string)) return false;

    var splitted = string.split(":");
    var specialId = splitted[splitted.length-1];
    if(string.includes(":") && (isNumber(specialId) || specialId == "|hidden"))
        return string;

    if(string.includes("telegram.me/"))
        string = string.replace("telegram.me/", "t.me/");
    if(string.includes("https://t.me/"))
        string = string.replace("https://t.me/", "t.me/");
    if(string.includes("http://t.me/"))
        string = string.replace("http://t.me/", "t.me/");

    if(string.startsWith("t.me/joinchat/") && string.length < 56 )
        return string;

    if(string.startsWith("t.me/+") && string.length < 56 )
        return string;

    var username = isValidUsername(string);
    if(username) return "@"+username;
 
    return false;
}

//Be sure to store hostname only (www.google.com) or a full link with path when given (https://www.youtube.com/watch?v=dQw4w9WgXcQ)
function linksValidator(string)
{
    if(string.includes("://"))
        string = string.split("://")[1];

    var host = string.split("/")[0].toLowerCase();
    if( !isValidHost(host) || !host.includes(".") )
        return false;

    if(string.includes("/"))
        return string;

    var doms = host.split(".");
    if(doms.length == 4 && is8BitNumber(doms[0]) && is8BitNumber(doms[1]) && is8BitNumber(doms[2]) && is8BitNumber(doms[3]))
        return doms.join(".");
    if(doms.length > 2)
        return doms[doms.length-3]+"."+doms[doms.length-2]+"."+doms[doms.length-1] //max to subdomain
    if(host.length < 256)
        return host;
    return false;
}

function main(args) {

    const GHbot = new LGHelpTemplate(args);
    const { TGbot, db, config } = GHbot;

    l = global.LGHLangs; //importing langs object

    GHbot.onMessage((msg, chat, user) => {

        //spam detection
        if(chat.type != "private"){(()=>{
            
            //unallowed forward detection
            /*
            if(!user.perms.forward && msg.hasOwnProperty("forward_origin"))
            {
                var forwardType = msg.forward_origin.type;
                if(forwardType == "user" && msg.forward_origin.sender_user.is_bot) forwardType = "bot";
                if(forwardType == "hidden_user") forwardType = "user";

            }*/

        })()}

        //security guards
        if (!(user.waitingReply)) return;
        var myCallback = user.waitingReplyType.startsWith("S_ANTISPAM") || user.waitingReplyType.startsWith("S_TGLINKS") || user.waitingReplyType.startsWith("S_FORWARD") || user.waitingReplyType.startsWith("S_QUOTES") || user.waitingReplyType.startsWith("S_LINKS");
        if (!myCallback) return;
        var settingsChatId = user.waitingReplyType.split(":")[1];
        if (chat.isGroup && settingsChatId != chat.id) return;//additional security guard
        if (!(user.perms && user.perms.settings)) return;

        var settingsChat = db.chats.get(settingsChatId)

        var lang = user.lang;

        //tglink
        if (user.waitingReplyType.startsWith("S_TGLINKS_PTIME#STIME")) {
            var returnButtons = [[{ text: l[user.lang].BACK_BUTTON, callback_data: "S_TGLINKS:" + settingsChatId }]]
            var cb_prefix = user.waitingReplyType.split("#")[0];
            var title = l[user.lang].SEND_PUNISHMENT_DURATION.replace("{punishment}", punishmentToText(user.lang, settingsChat.spam.tgLinks.punishment));
            var time = ST.messageEvent(GHbot, settingsChat.spam.tgLinks.PTime, msg, chat, user, cb_prefix, returnButtons, title);

            if (time != -1 && time != settingsChat.spam.tgLinks.PTime) {
                settingsChat.spam.tgLinks.PTime = time;
                db.chats.update(settingsChat);
            }
        }

        //links
        if (user.waitingReplyType.startsWith("S_LINKS_PTIME#STIME")) {
            var returnButtons = [[{ text: l[user.lang].BACK_BUTTON, callback_data: "S_LINKS:" + settingsChatId }]]
            var cb_prefix = user.waitingReplyType.split("#")[0];
            var title = l[user.lang].SEND_PUNISHMENT_DURATION.replace("{punishment}", punishmentToText(user.lang, settingsChat.spam.links.punishment));
            var time = ST.messageEvent(GHbot, settingsChat.spam.links.PTime, msg, chat, user, cb_prefix, returnButtons, title);

            if (time != -1 && time != settingsChat.spam.links.PTime) {
                settingsChat.spam.links.PTime = time;
                db.chats.update(settingsChat);
            }
        }
        if (user.waitingReplyType.startsWith("S_LINKS#EXC")) {
            var returnButtons = [[{ text: l[user.lang].BACK_BUTTON, callback_data: "S_LINKS#EXC_MENU:" + settingsChatId }]]
            var cb_prefix = user.waitingReplyType.split("#")[0];
            var title = l[lang].ANTISPAM_LINKS_EXC;
            var newExc = SE.messageEvent(GHbot, db, settingsChat.spam.links.exceptions, linksValidator, msg, chat, user, cb_prefix, returnButtons);
            if (newExc) {
                settingsChat.spam.links.exceptions = newExc;
                db.chats.update(settingsChat);
            }
        }

        //forward punishment of any chat type setting
        if (user.waitingReplyType.startsWith("S_FORWARD#CBP"))
        {
            var newCbp = CBP.messageEvent(GHbot, settingsChat.spam.forward, msg, chat, user, "S_FORWARD");
            if(newCbp)
            {
                settingsChat.spam.forward = newCbp;
                db.chats.update(settingsChat);
            }
        }

        //quote punishment of any chat type setting
        if (user.waitingReplyType.startsWith("S_QUOTES#CBP"))
        {
            var newCbp = CBP.messageEvent(GHbot, settingsChat.spam.quote, msg, chat, user, "S_QUOTES");
            if(newCbp)
            {
                settingsChat.spam.quote = newCbp;
                db.chats.update(settingsChat);
            }
        }

        //telegram exceptions
        var editTelegramExceptions = user.waitingReplyType.startsWith("S_TGLINKS#EXC") ||
        user.waitingReplyType.startsWith("S_FORWARD#EXC") || user.waitingReplyType.startsWith("S_QUOTES#CBP");
        if (editTelegramExceptions) {
            var returnLocation = user.waitingReplyType.split("#EXC")[0].split("_").at(-1);
            var returnButtons = [[{ text: l[user.lang].BACK_BUTTON, callback_data: "S_"+returnLocation+"#EXC_MENU:" + settingsChatId }]]
            var cb_prefix = user.waitingReplyType.split("#")[0];
            var title = l[lang].ANTISPAM_EXC;
            var newExc = SE.messageEvent(GHbot, db, settingsChat.spam.tgLinks.exceptions, tgLinkValidator, msg, chat, user, cb_prefix, returnButtons);
            if (newExc) {
                settingsChat.spam.tgLinks.exceptions = newExc;
                db.chats.update(settingsChat);
            }
        }

    })


    GHbot.onCallback((cb, chat, user) => {

        var msg = cb.message;
        var lang = user.lang;

        var settingsChatId = {};
        var settingsChat = {};

        var myCallback = cb.data.startsWith("S_ANTISPAM") || cb.data.startsWith("S_TGLINKS") || cb.data.startsWith("S_FORWARD") || cb.data.startsWith("S_QUOTES") || cb.data.startsWith("S_LINKS");
        if (myCallback) {

            settingsChatId = cb.data.split(":")[1]
            settingsChat = db.chats.get(settingsChatId)

        }


        //security guards
        if (!myCallback) return;
        if (!(user.perms && user.perms.settings)) return;
        if (chat.isGroup && settingsChatId != chat.id) return;

        //spam setting selector
        if (cb.data.startsWith("S_ANTISPAM_BUTTON:")) {

            GHbot.editMessageText(user.id, bold(l[lang].S_ANTISPAM_BUTTON), {
                message_id: msg.message_id,
                chat_id: chat.id,
                parse_mode: "HTML",
                reply_markup:
                {
                    inline_keyboard:
                        [
                            [{ text: l[lang].TGLINKS_BUTTON, callback_data: "S_TGLINKS:" + settingsChatId }],
                            [{ text: l[lang].FORWARDING_BUTTON, callback_data: "S_FORWARD#CBP:" + settingsChatId }, { text: l[lang].QUOTE_BUTTON, callback_data: "S_QUOTES#CBP:" + settingsChatId }],
                            [{ text: l[lang].LINKS_BLOCK_BUTTON, callback_data: "S_LINKS:" + settingsChatId }],
                            [{ text: l[lang].BACK_BUTTON, callback_data: "SETTINGS_HERE:" + settingsChatId }]
                        ]
                }
            })
            GHbot.answerCallbackQuery(user.id, cb.id);

        }

        //telegram exceptions set
        if( cb.data.startsWith("S_TGLINKS#EXC") || cb.data.startsWith("S_FORWARD#EXC") || cb.data.startsWith("S_QUOTES#EXC") )
        {
            var returnLocation = cb.data.split("#EXC")[0].split("_").at(-1);
            var returnButtons = [[{ text: l[lang].BACK_BUTTON, callback_data: "S_"+returnLocation+":" + settingsChatId }]]
            var cb_prefix = cb.data.split("#")[0];
            var title = l[lang].ANTISPAM_EXC;
            var addTitle = l[lang].TELEGRAM_EXC_ADD;
            var delTitle = l[lang].TELEGRAM_EXC_DELETE;
            var newExc = SE.callbackEvent(GHbot, db, settingsChat.spam.tgLinks.exceptions, cb, chat, user, cb_prefix, returnButtons, title, addTitle, delTitle);
            if(newExc)
            {
                settingsChat.spam.tgLinks.exceptions = newExc;
                db.chats.update(settingsChat);
            }
            return;
        }

        //TGLINKS//
        var tgLinksReturnB = [[{ text: l[lang].BACK_BUTTON, callback_data: "S_TGLINKS:" + settingsChatId }]]
        //punishment
        if (cb.data.startsWith("S_TGLINKS_P_")) {
            var toSetPunishment = handlePunishmentCallback(GHbot, cb, user.id, settingsChat.spam.tgLinks.punishment);
            if (toSetPunishment == settingsChat.spam.tgLinks.punishment) return;
            else { settingsChat.spam.tgLinks.punishment = toSetPunishment; db.chats.update(settingsChat) };
        }
        if (cb.data.startsWith("S_TGLINKS_PTIME#STIME")) {
            
            var cb_prefix = cb.data.split("#")[0];
            var currentTime = settingsChat.spam.tgLinks.PTime;
            var title = l[lang].SEND_PUNISHMENT_DURATION.replace("{punishment}", punishmentToText(lang, settingsChat.spam.tgLinks.punishment));
            var time = ST.callbackEvent(GHbot, db, currentTime, cb, chat, user, cb_prefix, tgLinksReturnB, title)

            if (time != -1 && time != currentTime) {
                settingsChat.spam.tgLinks.PTime = time;
                db.chats.update(settingsChat);
            }
            return;
        }
        //deletion switch
        if (cb.data.startsWith("S_TGLINKS_DELETION")) {
            settingsChat.spam.tgLinks.delete = !settingsChat.spam.tgLinks.delete;
            db.chats.update(settingsChat);
        }
        //usernames switch
        if (cb.data.startsWith("S_TGLINKS_USERNAME")) {
            settingsChat.spam.tgLinks.usernames = !settingsChat.spam.tgLinks.usernames;
            db.chats.update(settingsChat);
        }
        //bots switch
        if (cb.data.startsWith("S_TGLINKS_BOTS")) {
            settingsChat.spam.tgLinks.bots = !settingsChat.spam.tgLinks.bots;
            db.chats.update(settingsChat);
        }
        if (cb.data.startsWith("S_TGLINKS")) {
            var punishment = settingsChat.spam.tgLinks.punishment;
            var pTime = settingsChat.spam.tgLinks.PTime;
            var deletion = settingsChat.spam.tgLinks.delete;
            var usernames = settingsChat.spam.tgLinks.usernames;
            var bots = settingsChat.spam.tgLinks.bots;

            var usernameBText = l[lang].USERNAME_ANTISPAM + (usernames ? " ✔️" : " ✖️");
            var botsBText = l[lang].BOTS_ANTISPAM + (bots ? " ✔️" : " ✖️");

            var buttons = genPunishButtons(lang, punishment, "S_TGLINKS", settingsChatId, true, deletion);

            buttons.push([{ text: usernameBText, callback_data: "S_TGLINKS_USERNAME:" + settingsChatId }])
            buttons.push([{ text: botsBText, callback_data: "S_TGLINKS_BOTS:" + settingsChatId }])

            buttons.push([{ text: l[lang].BACK_BUTTON, callback_data: "S_ANTISPAM_BUTTON:" + settingsChatId },
            { text: l[lang].EXCEPTIONS_BUTTON, callback_data: "S_TGLINKS#EXC_MENU:" + settingsChatId }])

            var punishmentText = punishmentToTextAndTime(lang, punishment, pTime);
            var deletionText = settingsChat.spam.tgLinks.delete ? l[lang].YES_EM : l[lang].NO_EM;
            var text = l[lang].ANTISPAM_TGLINKS_DESCRIPTION.replace("{punishment}", punishmentText).replace("{deletion}", deletionText);
            GHbot.editMessageText(user.id, text, {
                message_id: msg.message_id,
                chat_id: chat.id,
                parse_mode: "HTML",
                reply_markup: { inline_keyboard: buttons }
            })
            GHbot.answerCallbackQuery(user.id, cb.id);
        }


        //LINKS//
        var linksReturnB = [[{ text: l[lang].BACK_BUTTON, callback_data: "S_LINKS:" + settingsChatId }]]
        //punishment
        if (cb.data.startsWith("S_LINKS_P_")) {
            var toSetPunishment = handlePunishmentCallback(GHbot, cb, user.id, settingsChat.spam.links.punishment);
            if (toSetPunishment == settingsChat.spam.links.punishment) return;
            else { settingsChat.spam.links.punishment = toSetPunishment; db.chats.update(settingsChat) };
        }
        if (cb.data.startsWith("S_LINKS_PTIME#STIME")) {
            var returnButtons = [[{ text: l[lang].BACK_BUTTON, callback_data: "S_LINKS:" + settingsChatId }]]
            var cb_prefix = cb.data.split("#")[0];
            var currentTime = settingsChat.spam.links.PTime;
            var title = l[lang].SEND_PUNISHMENT_DURATION.replace("{punishment}", punishmentToText(lang, settingsChat.spam.links.punishment));
            var time = ST.callbackEvent(GHbot, db, currentTime, cb, chat, user, cb_prefix, returnButtons, title)

            if (time != -1 && time != currentTime) {
                settingsChat.spam.links.PTime = time;
                db.chats.update(settingsChat);
            }
            return;
        }
        //links exceptions
        if ( cb.data.startsWith("S_LINKS#EXC") )
        {
            var cb_prefix = cb.data.split("#")[0];
            var title = l[lang].ANTISPAM_LINKS_EXC;
            var addTitle = l[lang].LINKS_EXC_ADD;
            var delTitle = l[lang].LINKS_EXC_DELETE;
            var newExc = SE.callbackEvent(GHbot, db, settingsChat.spam.links.exceptions, cb, chat, user, cb_prefix, linksReturnB, title, addTitle, delTitle);
            if(newExc)
            {
                settingsChat.spam.links.exceptions = newExc;
                db.chats.update(settingsChat);
            }
            return;
        }
        //deletion switch
        if (cb.data.startsWith("S_LINKS_DELETION")) {
            settingsChat.spam.links.delete = !settingsChat.spam.links.delete;
            db.chats.update(settingsChat);
        }
        if (cb.data.startsWith("S_LINKS")) {
            var punishment = settingsChat.spam.links.punishment;
            var pTime = settingsChat.spam.links.PTime;
            var deletion = settingsChat.spam.links.delete;

            var buttons = genPunishButtons(lang, punishment, "S_LINKS", settingsChatId, true, deletion);

            buttons.push([{ text: l[lang].BACK_BUTTON, callback_data: "S_ANTISPAM_BUTTON:" + settingsChatId },
            { text: l[lang].EXCEPTIONS_BUTTON, callback_data: "S_LINKS#EXC_MENU:" + settingsChatId }])

            var punishmentText = punishmentToTextAndTime(lang, punishment, pTime);
            var deletionText = settingsChat.spam.links.delete ? l[lang].YES_EM : l[lang].NO_EM;
            var text = l[lang].ANTISPAM_LINKS_DESCRIPTION.replace("{punishment}", punishmentText).replace("{deletion}", deletionText);
            GHbot.editMessageText(user.id, text, {
                message_id: msg.message_id,
                chat_id: chat.id,
                parse_mode: "HTML",
                reply_markup: { inline_keyboard: buttons }
            })
            GHbot.answerCallbackQuery(user.id, cb.id);
        }

        //FORWARDING// //default on setChatBasedPunish
        if (cb.data.startsWith("S_FORWARD")) {
            if(!cb.data.includes("S_FORWARD#CBP")) cb.data = cb.data.replace("S_FORWARD", "S_FORWARD#CBP"); //this because forwarding hasn't its own menu
            var returnButtons = [[{ text: l[lang].BACK_BUTTON, callback_data: "S_ANTISPAM_BUTTON:" + settingsChatId },
            { text: l[lang].EXCEPTIONS_BUTTON, callback_data: "S_FORWARD#EXC_MENU:" + settingsChatId }]]
            var title = l[lang].ANTISPAM_FORWARD_DESCRITPION+"\n";

            var newCbp = CBP.callbackEvent(GHbot, db, settingsChat.spam.forward, cb, chat, user, "S_FORWARD", returnButtons, title);
            if (newCbp) {
                settingsChat.spam.forward = newCbp;
                db.chats.update(settingsChat);
            }
        }

        //QUOTING// //default on setChatBasedPunish
        if (cb.data.startsWith("S_QUOTES")) {
            if(!cb.data.includes("S_QUOTES#CBP")) cb.data = cb.data.replace("S_QUOTES", "S_QUOTES#CBP"); //this because quoties hasn't its own menu
            var returnButtons = [[{ text: l[lang].BACK_BUTTON, callback_data: "S_ANTISPAM_BUTTON:" + settingsChatId },
            { text: l[lang].EXCEPTIONS_BUTTON, callback_data: "S_QUOTES#EXC_MENU:" + settingsChatId }]]
            var title = l[lang].ANTISPAM_QUOTES_DESCRITPION+"\n";

            var newCbp = CBP.callbackEvent(GHbot, db, settingsChat.spam.quote, cb, chat, user, "S_QUOTES", returnButtons, title);
            if (newCbp) {
                settingsChat.spam.quote = newCbp;
                db.chats.update(settingsChat);
            }
        }

    })



}

module.exports = main;
