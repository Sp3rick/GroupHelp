var LGHelpTemplate = require("../GHbot.js");
const { genPunishmentTimeSetButton, punishmentToText, punishmentToFullText, bold, secondsToHumanTime, LGHUserName, getUserWarns, clearWarns, textToPunishment } = require("../api/utils/utils.js");
const SN = require("../api/editors/setNum.js");
const ST = require("../api/editors/setTime.js");

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    GHbot.onMessage( (msg, chat, user) => {

        if(!chat.isGroup) return;

        //security guards
        if( !(msg.waitingReply && msg.waitingReply.startsWith("S_WARN_")) ) return;
        if( msg.chat.isGroup && chat.id != msg.chat.id ) return;//additional security guard
        if( !(user.perms && user.perms.settings) ) return;

        //punishment time setting
        var returnButtons = [[{text: l[user.lang].BACK_BUTTON, callback_data: "S_WARN_BUTTON:"+chat.id}]]
        var cb_prefix = msg.waitingReply.split("#")[0];
        if( msg.waitingReply.startsWith("S_WARN_PTIME#STIME") )
        {
            var title = l[user.lang].SEND_PUNISHMENT_DURATION.replace("{punishment}",punishmentToText(user.lang, chat.warns.punishment));
            var time = ST.messageEvent(GHbot, chat.warns.PTime, msg, chat, user, cb_prefix, returnButtons, title);

            if(time != -1 && time != chat.warns.PTime)
            {
                chat.warns.PTime = time;
                db.chats.update(chat);
            } 
        }

        if( msg.waitingReply.startsWith("S_WARN_LIMIT#SNUM")  )
        {
            var punishmentText = punishmentToFullText(user.lang, chat.warns.punishment, chat.warns.PTime);
            var title = l[user.lang].WARNS_DESCRIPTION.replaceAll("{punishmentText}",punishmentText).replaceAll("{limit}",bold("{number}"));
            var num = SN.messageEvent(GHbot, chat.flood.messages, msg, chat, user, "S_WARN_LIMIT", returnButtons, title, config.minWarns, config.maxWarns);
            if(num != -1 && num != chat.flood.messages)
            {
                chat.warns.limit = num;
                db.chats.update(chat);
            }
        }

    } )

    GHbot.onCallback( (cb, chat, user) => {

        var msg = cb.message;
        var lang = user.lang;

        //security guards for settings
        if(!chat.isGroup) return;
        if( !cb.data.startsWith("S_WARN") ) return;
        if( !(user.perms && user.perms.settings) ) return;
        if( cb.chat.isGroup && chat.id != cb.chat.id) return;

        //main menu based settings
        var toSetPunishment = -1
        if( cb.data.startsWith("S_WARN_BUTTON_P_") )
            toSetPunishment = textToPunishment(cb.data.split("S_WARN_BUTTON_P_")[1].split(":")[0]);
        if( toSetPunishment != -1 )
        {
            if(chat.warns.punishment == toSetPunishment)
            {
                GHbot.answerCallbackQuery(user.id, cb.id);
                return;
            }
            chat.warns.punishment = toSetPunishment;
            db.chats.update(chat)
        }
        var punishmentText = punishmentToFullText(lang, chat.warns.punishment, chat.warns.PTime);
        if(cb.data.startsWith("S_WARN_BUTTON"))
        {
            var punishment = chat.warns.punishment;
            var buttons = [
                [{text: l[lang].WARNED_LIST_BUTTON, callback_data: "S_WARN_LIST:"+chat.id}],
                [{text: l[lang].OFF_BUTTON, callback_data: "S_WARN_BUTTON_P_OFF:"+chat.id}, {text: l[lang].KICK_BUTTON, callback_data: "S_WARN_BUTTON_P_KICK:"+chat.id}],
                [{text: l[lang].MUTE_BUTTON, callback_data: "S_WARN_BUTTON_P_MUTE:"+chat.id}, {text: l[lang].BAN_BUTTON, callback_data: "S_WARN_BUTTON_P_BAN:"+chat.id}],
            ]

            var punishmentTimeSetButton = genPunishmentTimeSetButton(lang, punishment, "S_WARN_PTIME", chat.id);
            if(punishmentTimeSetButton) buttons.push(punishmentTimeSetButton);

            buttons.push([{text: l[lang].SET_MAX_WARNS_BUTTON, callback_data: "S_WARN_LIMIT#SNUM_MENU:"+chat.id}])

            buttons.push([{text: l[lang].BACK_BUTTON, callback_data: "SETTINGS_HERE:"+chat.id}])

            var options = {
                message_id : msg.message_id,
                chat_id : cb.chat.id,
                parse_mode : "HTML",
                reply_markup : {inline_keyboard:buttons}
            };

            var text = l[lang].WARNS_DESCRIPTION.replaceAll("{punishmentText}",punishmentText).replaceAll("{limit}",chat.warns.limit);
            GHbot.editMessageText(user.id, text, options);
            GHbot.answerCallbackQuery(user.id, cb.id);
        }

        if(cb.data.startsWith("S_WARN_LIST_FREEALL"))
        {
            var warnedIds = Object.keys(chat.warns.count);
            var toFree = [];
            warnedIds.forEach((id)=>{ if(getUserWarns(chat,id) != 0) toFree.push(id) });

            if(toFree.length > 0)
                toFree.forEach((id)=>{chat = clearWarns(chat,id)});
            else
            {
                GHbot.answerCallbackQuery(user.id, cb.id);
                return;
            }
        }
        if(cb.data.startsWith("S_WARN_LIST"))
        {
            var warnedIds = Object.keys(chat.warns.count);
            var limit = chat.warns.limit;
            var text = bold(l[lang].WARNED_USERS.replace("{limit}",limit))+"\n";
            warnedIds.forEach((id)=>{
                if(getUserWarns(chat,id)  == 0) return;
                text+="\n["+getUserWarns(chat,id)+"/"+limit+"] "+LGHUserName({id}, db);
            });

            var buttons = [];
            if(warnedIds.length > 0)
                buttons.push([{text: l[lang].FREEALL_BUTTON, callback_data: "S_WARN_LIST_FREEALL:"+chat.id}]);
            buttons.push([{text: l[lang].BACK_BUTTON, callback_data: "S_WARN_BUTTON:"+chat.id}]);

            var options = {
                message_id : msg.message_id,
                chat_id : cb.chat.id,
                parse_mode : "HTML",
                reply_markup : {inline_keyboard:buttons}
            };

            GHbot.editMessageText(user.id, text, options);
        }

        var returnButtons = [[{text: l[user.lang].BACK_BUTTON, callback_data: "S_WARN_BUTTON:"+chat.id}]];
        var cb_prefix = cb.data.split("#")[0];
        //set punishment time
        if(cb.data.startsWith("S_WARN_PTIME#STIME"))
        {
            var title = l[lang].SEND_PUNISHMENT_DURATION.replace("{punishment}",punishmentToText(lang, chat.warns.punishment));
            var time = ST.callbackEvent(GHbot, db, chat.warns.PTime, cb, chat, user, cb_prefix, returnButtons, title);

            if(time != -1 && time != chat.warns.PTime)
            {
                chat.warns.PTime = time;
                db.chats.update(chat);
            }
        }

        //set warn limit
        if(cb.data.startsWith("S_WARN_LIMIT#SNUM_MENU"))
        {
            var title = l[user.lang].WARNS_DESCRIPTION.replaceAll("{punishmentText}",punishmentText).replaceAll("{limit}",bold("{number}"))
            var num = SN.callbackEvent(GHbot, db, chat.warns.limit, cb, chat, user, cb_prefix, returnButtons, title, config.minWarns, config.maxWarns);
            if(num != -1 && num != chat.warns.limit)
            {
                chat.warns.limit = num;
                db.chats.update(chat);
            }
        }

    })

}

module.exports = main;
