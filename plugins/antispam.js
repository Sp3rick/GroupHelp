var LGHelpTemplate = require("../GHbot.js")
const {bold, punishmentToText, punishmentToFullText, handlePunishmentCallback, genPunishButtons, originIsSpam, entitiesLinks } = require("../api/utils/utils.js");
const ST = require("../api/editors/setTime.js");
const SE = require("../api/editors/setExceptions.js");
const CBP = require("../api/editors/setChatbasedPunish.js");
const RM = require("../api/utils/rolesManager.js");
const { applyChatBasedPunish, punishUser } = require("../api/utils/punishment.js");
const {tgLinkValidator, isTelegramLink, linksValidator, isLinkWhitelisted} = require("../api/utils/antispam.js");

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
                var punishType = originIsSpam(msg.forward_origin, TGExceptions);
                if(punishType)
                {
                    var reason = l[chat.lang].FORWARD_PUNISHMENT;
                    applyChatBasedPunish(GHbot, user.id, chat, RM.userToTarget(chat, user), chat.spam.forward, punishType, reason, msg.message_id);
                    return;
                }
            }

            //unallowed quote detection
            var isQuotedChat = msg.hasOwnProperty("external_reply") && msg.external_reply.chat && msg.external_reply.chat.id == chat.id;
            if(!user.perms.quote && msg.hasOwnProperty("external_reply") && !isQuotedChat)
            {
                var punishType = originIsSpam(msg.external_reply.origin, TGExceptions);
                if(punishType)
                {
                    var reason = l[chat.lang].QUOTE_PUNISHMENT;
                    applyChatBasedPunish(GHbot, user.id, chat, RM.userToTarget(chat, user), chat.spam.quote, punishType, reason, msg.message_id);
                    return;
                }
            }

            var text = msg.text || msg.caption || false;
            if(!text) return;
            var words = text.split(" ");
            if(msg.entities) words = words.concat(entitiesLinks(msg.entities));
            if(msg.caption_entities) words = words.concat(entitiesLinks(msg.caption_entities));

            //search for unwanted links on text
            for(var i = 0; i < words.length; i++)
            {
                var word = words[i];

                //unallowed tgLink detection
                var tgLink = isTelegramLink(word);
                if(user.perms.tgLink && tgLink)
                    return;
                if(!user.perms.tgLink && tgLink)
                {
                    var punish = true;
                    if(!chat.spam.tgLinks.bots && tgLink && tgLink.startsWith("@") && tgLink.endsWith("bot"))
                        punish = false;
                    if(!chat.spam.tgLinks.usernames && tgLink && tgLink.startsWith("@") && !tgLink.endsWith("bot"))
                        punish = false;

                    if(!punish) return;
                    if(tgLink && chat.spam.tgLinks.exceptions.includes(tgLink)) return;

                    if(chat.spam.tgLinks.delete)
                        TGbot.deleteMessages(chat.id, [msg.message_id]);

                    var reason = l[chat.lang].TGLINK_PUNISHMENT;
                    punishUser(GHbot, user.id, chat, RM.userToTarget(chat, user), chat.spam.tgLinks.punishment, chat.spam.tgLinks.PTime, reason);
                    return;
                }

                //unallowed link detection
                var link = linksValidator(word);
                if(!user.perms.link && link && !isLinkWhitelisted(link, chat.spam.links.exceptions))
                {
                    if(chat.spam.links.delete)
                        TGbot.deleteMessages(chat.id, [msg.message_id]);
                    
                    var reason = l[chat.lang].LINK_PUNISHMENT;
                    punishUser(GHbot, user.id, chat, RM.userToTarget(chat, user), chat.spam.links.punishment, chat.spam.links.PTime, reason);
                    return;
                }
                
            }
            
        })()}

        //security guards
        if (!msg.waitingReply) return;
        var myCallback = msg.waitingReply.startsWith("S_ANTISPAM") || msg.waitingReply.startsWith("S_TGLINKS") || msg.waitingReply.startsWith("S_FORWARD") || msg.waitingReply.startsWith("S_QUOTES") || msg.waitingReply.startsWith("S_LINKS");
        if (!myCallback) return;
        if (msg.chat.isGroup && chat.id != msg.chat.id) return;//additional security guard
        if (!(user.perms && user.perms.settings)) return;

        var lang = user.lang;

        //tglink
        if (msg.waitingReply.startsWith("S_TGLINKS_PTIME#STIME")) {
            var returnButtons = [[{ text: l[user.lang].BACK_BUTTON, callback_data: "S_TGLINKS:" + chat.id }]]
            var cb_prefix = msg.waitingReply.split("#")[0];
            var title = l[user.lang].SEND_PUNISHMENT_DURATION.replace("{punishment}", punishmentToText(user.lang, chat.spam.tgLinks.punishment));
            var time = ST.messageEvent(GHbot, chat.spam.tgLinks.PTime, msg, msg.chat, user, cb_prefix, returnButtons, title);

            if (time != -1 && time != chat.spam.tgLinks.PTime) {
                chat.spam.tgLinks.PTime = time;
                db.chats.update(chat);
            }
        }

        //links
        if (msg.waitingReply.startsWith("S_LINKS_PTIME#STIME")) {
            var returnButtons = [[{ text: l[user.lang].BACK_BUTTON, callback_data: "S_LINKS:" + chat.id }]]
            var cb_prefix = msg.waitingReply.split("#")[0];
            var title = l[user.lang].SEND_PUNISHMENT_DURATION.replace("{punishment}", punishmentToText(user.lang, chat.spam.links.punishment));
            var time = ST.messageEvent(GHbot, chat.spam.links.PTime, msg, chat, user, cb_prefix, returnButtons, title);

            if (time != -1 && time != chat.spam.links.PTime) {
                chat.spam.links.PTime = time;
                db.chats.update(chat);
            }
        }
        if (msg.waitingReply.startsWith("S_LINKS#EXC")) {
            var returnButtons = [[{ text: l[user.lang].BACK_BUTTON, callback_data: "S_LINKS#EXC_MENU:" + chat.id }]]
            var cb_prefix = msg.waitingReply.split("#")[0];
            var title = l[lang].ANTISPAM_LINKS_EXC;
            var newExc = SE.messageEvent(GHbot, db, chat.spam.links.exceptions, linksValidator, msg, chat, user, cb_prefix, returnButtons);
            if (newExc) {
                chat.spam.links.exceptions = newExc;
                db.chats.update(chat);
            }
        }

        //forward punishment of any msg.chat type setting
        if (msg.waitingReply.startsWith("S_FORWARD#CBP"))
        {
            var newCbp = CBP.messageEvent(GHbot, chat.spam.forward, msg, chat, user, "S_FORWARD");
            if(newCbp)
            {
                chat.spam.forward = newCbp;
                db.chats.update(chat);
            }
        }

        //quote punishment of any msg.chat type setting
        if (msg.waitingReply.startsWith("S_QUOTES#CBP"))
        {
            var newCbp = CBP.messageEvent(GHbot, chat.spam.quote, msg, chat, user, "S_QUOTES");
            if(newCbp)
            {
                chat.spam.quote = newCbp;
                db.chats.update(chat);
            }
        }

        //telegram exceptions
        var editTelegramExceptions = msg.waitingReply.startsWith("S_TGLINKS#EXC") ||
        msg.waitingReply.startsWith("S_FORWARD#EXC") || msg.waitingReply.startsWith("S_QUOTES#EXC");
        if (editTelegramExceptions) {
            var returnLocation = msg.waitingReply.split("#EXC")[0].split("_").at(-1);
            var returnButtons = [[{ text: l[user.lang].BACK_BUTTON, callback_data: "S_"+returnLocation+"#EXC_MENU:" + chat.id }]]
            var cb_prefix = msg.waitingReply.split("#")[0];
            var title = l[lang].ANTISPAM_EXC;
            var newExc = SE.messageEvent(GHbot, db, chat.spam.tgLinks.exceptions, tgLinkValidator, msg, chat, user, cb_prefix, returnButtons);
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
            var newExc = SE.callbackEvent(GHbot, db, chat.spam.tgLinks.exceptions, cb, chat, user, cb_prefix, returnButtons, title, addTitle, delTitle);
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
            var time = ST.callbackEvent(GHbot, db, currentTime, cb, chat, user, cb_prefix, tgLinksReturnB, title)

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

            var punishmentText = punishmentToFullText(lang, punishment, pTime, deletion);
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
            var time = ST.callbackEvent(GHbot, db, currentTime, cb, chat, user, cb_prefix, returnButtons, title)

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
            var newExc = SE.callbackEvent(GHbot, db, chat.spam.links.exceptions, cb, chat, user, cb_prefix, linksReturnB, title, addTitle, delTitle);
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

            var punishmentText = punishmentToFullText(lang, punishment, pTime, deletion);
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

            var newCbp = CBP.callbackEvent(GHbot, db, chat.spam.forward, cb, chat, user, "S_FORWARD", returnButtons, title);
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

            var newCbp = CBP.callbackEvent(GHbot, db, chat.spam.quote, cb, chat, user, "S_QUOTES", returnButtons, title);
            if (newCbp) {
                chat.spam.quote = newCbp;
                db.chats.update(chat);
            }
        }

    })



}

module.exports = main;
