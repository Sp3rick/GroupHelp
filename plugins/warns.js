var LGHelpTemplate = require("../GHbot.js");
const { genPunishmentTimeSetButton, punishmentToText, punishmentToTextAndTime, bold, secondsToHumanTime, LGHUserName, getUserWarns, clearWarns } = require("../api/utils.js");
const SN = require("../api/setNum.js");
const ST = require("../api/setTime.js");

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    GHbot.onMessage( (msg, chat, user) => {

        //security guards
        if( !(user.waitingReply && user.waitingReplyType.startsWith("S_WARN_")) ) return;
        var settingsChatId = user.waitingReplyType.split(":")[1];
        if( chat.isGroup && settingsChatId != chat.id ) return;//additional security guard
        if( !(user.perms && user.perms.settings) ) return;

        var settingsChat = db.chats.get(settingsChatId)

        //punishment time setting
        var returnButtons = [[{text: l[user.lang].BACK_BUTTON, callback_data: "S_WARN_BUTTON:"+settingsChatId}]]
        var cb_prefix = user.waitingReplyType.split("#")[0];
        if( user.waitingReplyType.startsWith("S_WARN_PTIME#STIME") )
        {
            var title = l[user.lang].SEND_PUNISHMENT_DURATION.replace("{punishment}",punishmentToText(user.lang, settingsChat.warns.punishment));
            var time = ST.messageEvent(GHbot, settingsChat.warns.PTime, msg, chat, user, cb_prefix, returnButtons, title);

            if(time != -1 && time != settingsChat.warns.PTime)
            {
                settingsChat.warns.PTime = time;
                db.chats.update(settingsChat);
            } 
        }

        if( user.waitingReplyType.startsWith("S_WARN_LIMIT#SNUM")  )
        {
            var punishmentText = punishmentToTextAndTime(user.lang, settingsChat.warns.punishment, settingsChat.warns.PTime);
            var title = l[user.lang].WARNS_DESCRIPTION.replaceAll("{punishmentText}",punishmentText).replaceAll("{limit}",bold("{number}"));
            var num = SN.messageEvent(GHbot, settingsChat.flood.messages, msg, chat, user, "S_WARN_LIMIT", returnButtons, title, config.minWarns, config.maxWarns);
            if(num != -1 && num != settingsChat.flood.messages)
            {
                settingsChat.warns.limit = num;
                db.chats.update(settingsChat);
            }
        }

    } )

    GHbot.onCallback( (cb, chat, user) => {

        var msg = cb.message;
        var lang = user.lang;

        var settingsChatId = {};
        var settingsChat = {};

        if( cb.data.startsWith("S_WARN") )
        {
            settingsChatId = cb.data.split(":")[1]
            settingsChat = db.chats.get(settingsChatId)
        }

        //security guards
        if( !cb.data.startsWith("S_WARN") ) return;
        if( !(user.perms && user.perms.settings) ) return;
        if( chat.isGroup && settingsChatId != chat.id) return;

        var punishmentText = punishmentToTextAndTime(lang, settingsChat.warns.punishment, settingsChat.warns.PTime);

        //main menu based settings
        var toSetPunishment = -1;
        if( cb.data.startsWith("S_WARN_BUTTON_P_OFF:") )
            toSetPunishment = 0;
        if( cb.data.startsWith("S_WARN_BUTTON_P_KICK:") )
            toSetPunishment = 2;
        if( cb.data.startsWith("S_WARN_BUTTON_P_MUTE:") )
            toSetPunishment = 3;
        if( cb.data.startsWith("S_WARN_BUTTON_P_BAN:") )
            toSetPunishment = 4;
        if( toSetPunishment != -1 )
        {
            if(settingsChat.warns.punishment == toSetPunishment)
            {
                GHbot.answerCallbackQuery(user.id, cb.id);
                return;
            }
            settingsChat.warns.punishment = toSetPunishment;
            db.chats.update(settingsChat)
        }
        if(cb.data.startsWith("S_WARN_BUTTON"))
        {
            var punishment = settingsChat.warns.punishment;
            var buttons = [
                [{text: l[lang].WARNED_LIST_BUTTON, callback_data: "S_WARN_LIST:"+settingsChatId}],
                [{text: l[lang].OFF_BUTTON, callback_data: "S_WARN_BUTTON_P_OFF:"+settingsChatId}, {text: l[lang].KICK_BUTTON, callback_data: "S_WARN_BUTTON_P_KICK:"+settingsChatId}],
                [{text: l[lang].MUTE_BUTTON, callback_data: "S_WARN_BUTTON_P_MUTE:"+settingsChatId}, {text: l[lang].BAN_BUTTON, callback_data: "S_WARN_BUTTON_P_BAN:"+settingsChatId}],
            ]

            var punishmentTimeSetButton = genPunishmentTimeSetButton(lang, punishment, "S_WARN_PTIME", settingsChatId);
            if(punishmentTimeSetButton) buttons.push(punishmentTimeSetButton);

            buttons.push([{text: l[lang].SET_MAX_WARNS_BUTTON, callback_data: "S_WARN_LIMIT#SNUM_MENU:"+settingsChatId}])

            buttons.push([{text: l[lang].BACK_BUTTON, callback_data: "SETTINGS_HERE:"+settingsChatId}])

            var options = {
                message_id : msg.message_id,
                chat_id : chat.id,
                parse_mode : "HTML",
                reply_markup : {inline_keyboard:buttons}
            };

            var text = l[lang].WARNS_DESCRIPTION.replaceAll("{punishmentText}",punishmentText).replaceAll("{limit}",settingsChat.warns.limit);
            GHbot.editMessageText(user.id, text, options);
            GHbot.answerCallbackQuery(user.id, cb.id);
        }

        if(cb.data.startsWith("S_WARN_LIST_FREEALL"))
        {
            var warnedIds = Object.keys(settingsChat.warns.count);
            var toFree = [];
            warnedIds.forEach((id)=>{ if(getUserWarns(settingsChat,id) != 0) toFree.push(id) });

            if(toFree.length > 0)
                toFree.forEach((id)=>{settingsChat = clearWarns(settingsChat,id)});
            else
            {
                GHbot.answerCallbackQuery(user.id, cb.id);
                return;
            }
        }
        if(cb.data.startsWith("S_WARN_LIST"))
        {
            var warnedIds = Object.keys(settingsChat.warns.count);
            var limit = settingsChat.warns.limit;
            var text = bold(l[lang].WARNED_USERS.replace("{limit}",limit))+"\n";
            warnedIds.forEach((id)=>{
                if(getUserWarns(settingsChat,id)  == 0) return;
                text+="\n["+getUserWarns(settingsChat,id)+"/"+limit+"] "+LGHUserName({id}, db);
            });

            var buttons = [];
            if(warnedIds.length > 0)
                buttons.push([{text: l[lang].FREEALL_BUTTON, callback_data: "S_WARN_LIST_FREEALL:"+settingsChatId}]);
            buttons.push([{text: l[lang].BACK_BUTTON, callback_data: "S_WARN_BUTTON:"+settingsChatId}]);

            var options = {
                message_id : msg.message_id,
                chat_id : chat.id,
                parse_mode : "HTML",
                reply_markup : {inline_keyboard:buttons}
            };

            GHbot.editMessageText(user.id, text, options);
        }

        var returnButtons = [[{text: l[user.lang].BACK_BUTTON, callback_data: "S_WARN_BUTTON:"+settingsChatId}]];
        var cb_prefix = cb.data.split("#")[0];
        //set punishment time
        if(cb.data.startsWith("S_WARN_PTIME#STIME"))
        {
            var title = l[lang].SEND_PUNISHMENT_DURATION.replace("{punishment}",punishmentToText(lang, settingsChat.warns.punishment));
            var time = ST.callbackEvent(GHbot, db, settingsChat.warns.PTime, cb, chat, user, cb_prefix, returnButtons, title);

            if(time != -1 && time != settingsChat.warns.PTime)
            {
                settingsChat.warns.PTime = time;
                db.chats.update(settingsChat);
            }
        }

        //set warn limit
        if(cb.data.startsWith("S_WARN_LIMIT#SNUM_MENU"))
        {
            var title = l[user.lang].WARNS_DESCRIPTION.replaceAll("{punishmentText}",punishmentText).replaceAll("{limit}",bold("{number}"))
            var num = SN.callbackEvent(GHbot, db, settingsChat.warns.limit, cb, chat, user, cb_prefix, returnButtons, title, config.minWarns, config.maxWarns);
            if(num != -1 && num != settingsChat.warns.limit)
            {
                settingsChat.warns.limit = num;
                db.chats.update(settingsChat);
            }
        }

    })

}

module.exports = main;
