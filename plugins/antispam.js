var LGHelpTemplate = require("../GHbot.js")
const {bold, punishmentToText, punishmentToTextAndTime, handlePunishmentCallback, genPunishButtons, isNumber, isValidUsername, isValidHost, isString, originToUsername, originIsSpam, isValidId } = require("../api/utils.js");
const ST = require("../api/setTime.js");
const SE = require("../api/setExceptions.js");
const CBP = require("../api/setChatbasedPunish.js");
const RM = require("../api/rolesManager.js");
const { applyChatBasedPunish } = require("../api/punishment.js");

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
    if(string.includes(":") && (isValidId(specialId) || specialId == "|hidden"))
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
        if(msg.chat.type != "private"){(()=>{

            var TGExceptions = chat.spam.tgLinks.exceptions
            
            //unallowed forward detection
            var isForwardedUser = msg.forward_origin && msg.forward_origin.type == "user" && msg.forward_origin.sender_user.id == user.id
            if(!user.perms.forward && msg.hasOwnProperty("forward_origin") && !isForwardedUser)
            {
                var punishType = originIsSpam(msg.forward_origin, chat.spam.forward, TGExceptions);

                if(punishType)
                {
                    var reason = l[chat.lang].FORWARD_PUNISHMENT;
                    applyChatBasedPunish(GHbot, user.id, chat, RM.userToTarget(chat, user), chat.spam.forward, punishType, reason);
                }
            }

            //unallowed quote detection
            var isQuotedChat = msg.hasOwnProperty("external_reply") && msg.external_reply.chat && msg.external_reply.chat.id == chat.id;
            if(!user.perms.quote && msg.hasOwnProperty("external_reply") && !isQuotedChat)
            {
                var punishType = originIsSpam(msg.external_reply.origin, chat.spam.quote, TGExceptions);

                if(punishType)
                {
                    var reason = l[chat.lang].QUOTE_PUNISHMENT;
                    applyChatBasedPunish(GHbot, user.id, chat, RM.userToTarget(chat, user), chat.spam.quote, punishType, reason);
                }
            }

        })()}

        //security guards
        if (!(user.waitingReply)) return;
        var myCallback = user.waitingReplyType.startsWith("S_ANTISPAM") || user.waitingReplyType.startsWith("S_TGLINKS") || user.waitingReplyType.startsWith("S_FORWARD") || user.waitingReplyType.startsWith("S_QUOTES") || user.waitingReplyType.startsWith("S_LINKS");
        if (!myCallback) return;
        if (msg.chat.isGroup && chat.id != msg.chat.id) return;//additional security guard
        if (!(user.perms && user.perms.settings)) return;

        var lang = user.lang;

        //tglink
        if (user.waitingReplyType.startsWith("S_TGLINKS_PTIME#STIME")) {
            var returnButtons = [[{ text: l[user.lang].BACK_BUTTON, callback_data: "S_TGLINKS:" + chat.id }]]
            var cb_prefix = user.waitingReplyType.split("#")[0];
            var title = l[user.lang].SEND_PUNISHMENT_DURATION.replace("{punishment}", punishmentToText(user.lang, chat.spam.tgLinks.punishment));
            var time = ST.messageEvent(GHbot, chat.spam.tgLinks.PTime, msg, msg.chat, user, cb_prefix, returnButtons, title);

            if (time != -1 && time != chat.spam.tgLinks.PTime) {
                chat.spam.tgLinks.PTime = time;
                db.chats.update(chat);
            }
        }

        //links
        if (user.waitingReplyType.startsWith("S_LINKS_PTIME#STIME")) {
            var returnButtons = [[{ text: l[user.lang].BACK_BUTTON, callback_data: "S_LINKS:" + chat.id }]]
            var cb_prefix = user.waitingReplyType.split("#")[0];
            var title = l[user.lang].SEND_PUNISHMENT_DURATION.replace("{punishment}", punishmentToText(user.lang, chat.spam.links.punishment));
            var time = ST.messageEvent(GHbot, chat.spam.links.PTime, msg, msg.chat, user, cb_prefix, returnButtons, title);

            if (time != -1 && time != chat.spam.links.PTime) {
                chat.spam.links.PTime = time;
                db.chats.update(chat);
            }
        }
        if (user.waitingReplyType.startsWith("S_LINKS#EXC")) {
            var returnButtons = [[{ text: l[user.lang].BACK_BUTTON, callback_data: "S_LINKS#EXC_MENU:" + chat.id }]]
            var cb_prefix = user.waitingReplyType.split("#")[0];
            var title = l[lang].ANTISPAM_LINKS_EXC;
            var newExc = SE.messageEvent(GHbot, db, chat.spam.links.exceptions, linksValidator, msg, msg.chat, user, cb_prefix, returnButtons);
            if (newExc) {
                chat.spam.links.exceptions = newExc;
                db.chats.update(chat);
            }
        }

        //forward punishment of any msg.chat type setting
        if (user.waitingReplyType.startsWith("S_FORWARD#CBP"))
        {
            var newCbp = CBP.messageEvent(GHbot, chat.spam.forward, msg, msg.chat, user, "S_FORWARD");
            if(newCbp)
            {
                chat.spam.forward = newCbp;
                db.chats.update(chat);
            }
        }

        //quote punishment of any msg.chat type setting
        if (user.waitingReplyType.startsWith("S_QUOTES#CBP"))
        {
            var newCbp = CBP.messageEvent(GHbot, chat.spam.quote, msg, msg.chat, user, "S_QUOTES");
            if(newCbp)
            {
                chat.spam.quote = newCbp;
                db.chats.update(chat);
            }
        }

        //telegram exceptions
        var editTelegramExceptions = user.waitingReplyType.startsWith("S_TGLINKS#EXC") ||
        user.waitingReplyType.startsWith("S_FORWARD#EXC") || user.waitingReplyType.startsWith("S_QUOTES#EXC");
        if (editTelegramExceptions) {
            var returnLocation = user.waitingReplyType.split("#EXC")[0].split("_").at(-1);
            var returnButtons = [[{ text: l[user.lang].BACK_BUTTON, callback_data: "S_"+returnLocation+"#EXC_MENU:" + chat.id }]]
            var cb_prefix = user.waitingReplyType.split("#")[0];
            var title = l[lang].ANTISPAM_EXC;
            var newExc = SE.messageEvent(GHbot, db, chat.spam.tgLinks.exceptions, tgLinkValidator, msg, msg.chat, user, cb_prefix, returnButtons);
            if (newExc) {
                chat.spam.tgLinks.exceptions = newExc;
                db.chats.update(chat);
            }
        }

    })


    GHbot.onCallback((cb, chat, user) => {

        var msg = cb.message;
        var lang = user.lang;

        var myCallback = cb.data.startsWith("S_ANTISPAM") || cb.data.startsWith("S_TGLINKS") || cb.data.startsWith("S_FORWARD") || cb.data.startsWith("S_QUOTES") || cb.data.startsWith("S_LINKS");

        //security guards for settings
        if(!chat.isGroup) return;
        if (!myCallback) return;
        if (!(user.perms && user.perms.settings)) return;
        if (cb.chat.isGroup && chat.id != cb.chat.id) return;

        //spam setting selector
        if (cb.data.startsWith("S_ANTISPAM_BUTTON:")) {

            GHbot.editMessageText(user.id, bold(l[lang].S_ANTISPAM_BUTTON), {
                message_id: msg.message_id,
                chat_id: cb.chat.id,
                parse_mode: "HTML",
                reply_markup:
                {
                    inline_keyboard:
                        [
                            [{ text: l[lang].TGLINKS_BUTTON, callback_data: "S_TGLINKS:" + chat.id }],
                            [{ text: l[lang].FORWARDING_BUTTON, callback_data: "S_FORWARD#CBP:" + chat.id }, { text: l[lang].QUOTE_BUTTON, callback_data: "S_QUOTES#CBP:" + chat.id }],
                            [{ text: l[lang].LINKS_BLOCK_BUTTON, callback_data: "S_LINKS:" + chat.id }],
                            [{ text: l[lang].BACK_BUTTON, callback_data: "SETTINGS_HERE:" + chat.id }]
                        ]
                }
            })
            GHbot.answerCallbackQuery(user.id, cb.id);

        }

        //telegram exceptions set
        if( cb.data.startsWith("S_TGLINKS#EXC") || cb.data.startsWith("S_FORWARD#EXC") || cb.data.startsWith("S_QUOTES#EXC") )
        {
            var returnLocation = cb.data.split("#EXC")[0].split("_").at(-1);
            var returnButtons = [[{ text: l[lang].BACK_BUTTON, callback_data: "S_"+returnLocation+":" + chat.id }]]
            var cb_prefix = cb.data.split("#")[0];
            var title = l[lang].ANTISPAM_EXC;
            var addTitle = l[lang].TELEGRAM_EXC_ADD;
            var delTitle = l[lang].TELEGRAM_EXC_DELETE;
            var newExc = SE.callbackEvent(GHbot, db, chat.spam.tgLinks.exceptions, cb, cb.chat, user, cb_prefix, returnButtons, title, addTitle, delTitle);
            if(newExc)
            {
                chat.spam.tgLinks.exceptions = newExc;
                db.chats.update(chat);
            }
            return;
        }

        //TGLINKS//
        var tgLinksReturnB = [[{ text: l[lang].BACK_BUTTON, callback_data: "S_TGLINKS:" + chat.id }]]
        //punishment
        if (cb.data.startsWith("S_TGLINKS_P_")) {
            var toSetPunishment = handlePunishmentCallback(GHbot, cb, user.id, chat.spam.tgLinks.punishment);
            if (toSetPunishment == chat.spam.tgLinks.punishment) return;
            else { chat.spam.tgLinks.punishment = toSetPunishment; db.chats.update(chat) };
        }
        if (cb.data.startsWith("S_TGLINKS_PTIME#STIME")) {
            
            var cb_prefix = cb.data.split("#")[0];
            var currentTime = chat.spam.tgLinks.PTime;
            var title = l[lang].SEND_PUNISHMENT_DURATION.replace("{punishment}", punishmentToText(lang, chat.spam.tgLinks.punishment));
            var time = ST.callbackEvent(GHbot, db, currentTime, cb, cb.chat, user, cb_prefix, tgLinksReturnB, title)

            if (time != -1 && time != currentTime) {
                chat.spam.tgLinks.PTime = time;
                db.chats.update(chat);
            }
            return;
        }
        //deletion switch
        if (cb.data.startsWith("S_TGLINKS_DELETION")) {
            chat.spam.tgLinks.delete = !chat.spam.tgLinks.delete;
            db.chats.update(chat);
        }
        //usernames switch
        if (cb.data.startsWith("S_TGLINKS_USERNAME")) {
            chat.spam.tgLinks.usernames = !chat.spam.tgLinks.usernames;
            db.chats.update(chat);
        }
        //bots switch
        if (cb.data.startsWith("S_TGLINKS_BOTS")) {
            chat.spam.tgLinks.bots = !chat.spam.tgLinks.bots;
            db.chats.update(chat);
        }
        if (cb.data.startsWith("S_TGLINKS")) {
            var punishment = chat.spam.tgLinks.punishment;
            var pTime = chat.spam.tgLinks.PTime;
            var deletion = chat.spam.tgLinks.delete;
            var usernames = chat.spam.tgLinks.usernames;
            var bots = chat.spam.tgLinks.bots;

            var usernameBText = l[lang].USERNAME_ANTISPAM + (usernames ? " ✔️" : " ✖️");
            var botsBText = l[lang].BOTS_ANTISPAM + (bots ? " ✔️" : " ✖️");

            var buttons = genPunishButtons(lang, punishment, "S_TGLINKS", chat.id, true, deletion);

            buttons.push([{ text: usernameBText, callback_data: "S_TGLINKS_USERNAME:" + chat.id }])
            buttons.push([{ text: botsBText, callback_data: "S_TGLINKS_BOTS:" + chat.id }])

            buttons.push([{ text: l[lang].BACK_BUTTON, callback_data: "S_ANTISPAM_BUTTON:" + chat.id },
            { text: l[lang].EXCEPTIONS_BUTTON, callback_data: "S_TGLINKS#EXC_MENU:" + chat.id }])

            var punishmentText = punishmentToTextAndTime(lang, punishment, pTime);
            var deletionText = chat.spam.tgLinks.delete ? l[lang].YES_EM : l[lang].NO_EM;
            var text = l[lang].ANTISPAM_TGLINKS_DESCRIPTION.replace("{punishment}", punishmentText).replace("{deletion}", deletionText);
            GHbot.editMessageText(user.id, text, {
                message_id: msg.message_id,
                chat_id: cb.chat.id,
                parse_mode: "HTML",
                reply_markup: { inline_keyboard: buttons }
            })
            GHbot.answerCallbackQuery(user.id, cb.id);
        }


        //LINKS//
        var linksReturnB = [[{ text: l[lang].BACK_BUTTON, callback_data: "S_LINKS:" + chat.id }]]
        //punishment
        if (cb.data.startsWith("S_LINKS_P_")) {
            var toSetPunishment = handlePunishmentCallback(GHbot, cb, user.id, chat.spam.links.punishment);
            if (toSetPunishment == chat.spam.links.punishment) return;
            else { chat.spam.links.punishment = toSetPunishment; db.chats.update(chat) };
        }
        if (cb.data.startsWith("S_LINKS_PTIME#STIME")) {
            var returnButtons = [[{ text: l[lang].BACK_BUTTON, callback_data: "S_LINKS:" + chat.id }]]
            var cb_prefix = cb.data.split("#")[0];
            var currentTime = chat.spam.links.PTime;
            var title = l[lang].SEND_PUNISHMENT_DURATION.replace("{punishment}", punishmentToText(lang, chat.spam.links.punishment));
            var time = ST.callbackEvent(GHbot, db, currentTime, cb, cb.chat, user, cb_prefix, returnButtons, title)

            if (time != -1 && time != currentTime) {
                chat.spam.links.PTime = time;
                db.chats.update(chat);
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
            var newExc = SE.callbackEvent(GHbot, db, chat.spam.links.exceptions, cb, cb.chat, user, cb_prefix, linksReturnB, title, addTitle, delTitle);
            if(newExc)
            {
                chat.spam.links.exceptions = newExc;
                db.chats.update(chat);
            }
            return;
        }
        //deletion switch
        if (cb.data.startsWith("S_LINKS_DELETION")) {
            chat.spam.links.delete = !chat.spam.links.delete;
            db.chats.update(chat);
        }
        if (cb.data.startsWith("S_LINKS")) {
            var punishment = chat.spam.links.punishment;
            var pTime = chat.spam.links.PTime;
            var deletion = chat.spam.links.delete;

            var buttons = genPunishButtons(lang, punishment, "S_LINKS", chat.id, true, deletion);

            buttons.push([{ text: l[lang].BACK_BUTTON, callback_data: "S_ANTISPAM_BUTTON:" + chat.id },
            { text: l[lang].EXCEPTIONS_BUTTON, callback_data: "S_LINKS#EXC_MENU:" + chat.id }])

            var punishmentText = punishmentToTextAndTime(lang, punishment, pTime);
            var deletionText = chat.spam.links.delete ? l[lang].YES_EM : l[lang].NO_EM;
            var text = l[lang].ANTISPAM_LINKS_DESCRIPTION.replace("{punishment}", punishmentText).replace("{deletion}", deletionText);
            GHbot.editMessageText(user.id, text, {
                message_id: msg.message_id,
                chat_id: cb.chat.id,
                parse_mode: "HTML",
                reply_markup: { inline_keyboard: buttons }
            })
            GHbot.answerCallbackQuery(user.id, cb.id);
        }

        //FORWARDING// //default on setChatBasedPunish
        if (cb.data.startsWith("S_FORWARD")) {
            if(!cb.data.includes("S_FORWARD#CBP")) cb.data = cb.data.replace("S_FORWARD", "S_FORWARD#CBP"); //this because forwarding hasn't its own menu
            var returnButtons = [[{ text: l[lang].BACK_BUTTON, callback_data: "S_ANTISPAM_BUTTON:" + chat.id },
            { text: l[lang].EXCEPTIONS_BUTTON, callback_data: "S_FORWARD#EXC_MENU:" + chat.id }]]
            var title = l[lang].ANTISPAM_FORWARD_DESCRITPION+"\n";

            var newCbp = CBP.callbackEvent(GHbot, db, chat.spam.forward, cb, cb.chat, user, "S_FORWARD", returnButtons, title);
            if (newCbp) {
                chat.spam.forward = newCbp;
                db.chats.update(chat);
            }
        }

        //QUOTING// //default on setChatBasedPunish
        if (cb.data.startsWith("S_QUOTES")) {
            if(!cb.data.includes("S_QUOTES#CBP")) cb.data = cb.data.replace("S_QUOTES", "S_QUOTES#CBP"); //this because quoties hasn't its own menu
            var returnButtons = [[{ text: l[lang].BACK_BUTTON, callback_data: "S_ANTISPAM_BUTTON:" + chat.id },
            { text: l[lang].EXCEPTIONS_BUTTON, callback_data: "S_QUOTES#EXC_MENU:" + chat.id }]]
            var title = l[lang].ANTISPAM_QUOTES_DESCRITPION+"\n";

            var newCbp = CBP.callbackEvent(GHbot, db, chat.spam.quote, cb, cb.chat, user, "S_QUOTES", returnButtons, title);
            if (newCbp) {
                chat.spam.quote = newCbp;
                db.chats.update(chat);
            }
        }

    })



}

module.exports = main;
