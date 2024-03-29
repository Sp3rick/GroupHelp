var LGHelpTemplate = require("../GHbot.js");
const { bold, punishmentToText, isAdminOfChat, secondsToHumanTime } = require("../api/utils.js");
const SN = require("../api/setNum.js");
const ST = require("../api/setTime.js");

function main(args)
{

    var {GHbot, TGbot, db, config} = new LGHelpTemplate(args);

    l = global.LGHLangs; //importing langs object

    GHbot.on( "private", (msg, chat, user) => {

        if( msg.text == "/test999" )
            TGbot.sendMessage( chat.id, "Hello, i send this because im a plugin\n"+l[user.lang].flag );

    } )

    GHbot.on( "callback_query", (cb, chat, user) => {

        var msg = cb.message;
        var lang = user.lang;

        var settingsChatId = {};"{number}"
        var settingsChat = {};
        if( cb.data.startsWith("S_FLOOD") )
        {
            settingsChatId = cb.data.split(":")[1]
            settingsChat = db.chats.get(settingsChatId)
        }

        //main menu based settings
        var toSetPunishment = -1;
        if( cb.data.startsWith("S_FLOOD_M_OFF:") )
            toSetPunishment = 0;
        if( cb.data.startsWith("S_FLOOD_M_WARN:") )
            toSetPunishment = 1;
        if( cb.data.startsWith("S_FLOOD_M_KICK:") )
            toSetPunishment = 2;
        if( cb.data.startsWith("S_FLOOD_M_MUTE:") )
            toSetPunishment = 3;
        if( cb.data.startsWith("S_FLOOD_M_BAN:") )
            toSetPunishment = 4;
        if( toSetPunishment != -1 )
        {
            if(settingsChat.flood.punishment == toSetPunishment)
            {
                TGbot.answerCallbackQuery(cb.id);
                return;
            }
            settingsChat.flood.punishment = toSetPunishment;
            db.chats.update(settingsChat)
        }
        if( cb.data.startsWith("S_FLOOD_M_DELETESWITCH:") )
        {
            settingsChat.flood.delete = !settingsChat.flood.delete;
            db.chats.update(settingsChat)
        }
        //main menu
        if( cb.data.startsWith("S_FLOOD_M_") )
        {

            var punishment = settingsChat.flood.punishment;
            var punishmentText = punishmentToText(lang, punishment)
            var text = l[lang].ANTIFLOOD+"\n"+
            l[lang].ANTIFLOOD_DESCRIPTION.replace("{messages}",settingsChat.flood.messages).replace("{seconds}",settingsChat.flood.time)+"\n\n"+
            bold(l[lang].PUNISHMENT)+": "+punishmentText;
            if((punishment == 1 || punishment == 3 || punishment == 4) && settingsChat.flood.PTime != 0)
                 text+=" "+l[lang].FOR_HOW_MUCH+" "+secondsToHumanTime(lang, settingsChat.flood.PTime);
        
            var deleteSwitchButtonName = l[lang].DELETE_MESSAGES_BUTTON+(settingsChat.flood.delete?"✔️":"✖️");
            var options = 
            {
                message_id : msg.message_id,
                chat_id : chat.id,
                parse_mode : "HTML",
                reply_markup : 
                {
                    inline_keyboard :
                    [
                        [{text: l[lang].MESSAGES_BUTTON, callback_data: "S_FLOOD_MESSAGES#SNUM_MENU:"+settingsChatId}, {text: l[lang].TIME_BUTTON, callback_data: "S_FLOOD_TIME#SNUM_MENU:"+settingsChatId}],
                        [{text: l[lang].OFF2, callback_data: "S_FLOOD_M_OFF:"+settingsChatId}, {text: l[lang].WARN_BUTTON, callback_data: "S_FLOOD_M_WARN:"+settingsChatId}],
                        [{text: l[lang].KICK_BUTTON, callback_data: "S_FLOOD_M_KICK:"+settingsChatId}, {text: l[lang].MUTE_BUTTON, callback_data: "S_FLOOD_M_MUTE:"+settingsChatId}, {text: l[lang].BAN_BUTTON, callback_data: "S_FLOOD_M_BAN:"+settingsChatId}],
                        [{text: deleteSwitchButtonName, callback_data: "S_FLOOD_M_DELETESWITCH:"+settingsChatId}],
                    ] 
                } 
            }
            switch(settingsChat.flood.punishment)
            {
                case 1: options.reply_markup.inline_keyboard.push([{text: "❕"+l[lang].SET_PUNISHMENT_TIME.replace("{punishment}",punishmentText), callback_data: "S_FLOOD_PTIME_WARN#STIME:"+settingsChatId}]); break;
                case 3: options.reply_markup.inline_keyboard.push([{text: "🔇"+l[lang].SET_PUNISHMENT_TIME.replace("{punishment}",punishmentText), callback_data: "S_FLOOD_PTIME_MUTE#STIME:"+settingsChatId}]); break;
                case 4: options.reply_markup.inline_keyboard.push([{text: "🚷"+l[lang].SET_PUNISHMENT_TIME.replace("{punishment}",punishmentText), callback_data: "S_FLOOD_PTIME_BAN#STIME:"+settingsChatId}]); break;
            }
            options.reply_markup.inline_keyboard.push([{text: l[lang].BACK_BUTTON, callback_data: "SETTINGS_HERE:"+settingsChatId}])

            TGbot.editMessageText(text, options)
            TGbot.answerCallbackQuery(cb.id);

        }

        //Setnum variables
        var returnButtons = [[{text: l[lang].BACK_BUTTON, callback_data: "S_FLOOD_M_:"+settingsChatId}]]
        var setNumReturn = {};
        var cb_prefix = "";
        if( cb.data.startsWith("S_FLOOD_MESSAGES#SNUM_MENU") )
        {
            var title = l[lang].ANTIFLOOD_DESCRIPTION.replaceAll("{messages}",bold("{number}")).replaceAll("{seconds}",settingsChat.flood.time);
            setNumReturn = SN.callbackEvent(TGbot, settingsChat.flood.messages, cb, chat, user, "S_FLOOD_MESSAGES", returnButtons, title);
            cb_prefix = "S_FLOOD_MESSAGES";
        }
        if( cb.data.startsWith("S_FLOOD_TIME#SNUM_MENU") )
        {
            var title = l[lang].ANTIFLOOD_DESCRIPTION.replaceAll("{seconds}",bold("{number}")).replaceAll("{messages}",settingsChat.flood.messages);
            setNumReturn = SN.callbackEvent(TGbot, settingsChat.flood.time, cb, chat, user, "S_FLOOD_TIME", returnButtons, title);
            cb_prefix = "S_FLOOD_TIME";
        }

        //Set punishment duration
        var returnButtons = [[{text: l[lang].CANCEL_BUTTON, callback_data: "S_FLOOD_M_:"+settingsChatId}]]
        var setTimeReturn =  {};
        if(cb.data.startsWith("S_FLOOD_PTIME_") ) //example S_FLOOD_PTIME_WARN
        {
            var PString = cb.data.split("S_FLOOD_PTIME_")[1].split("#")[0];
            cb_prefix = "S_FLOOD_PTIME_"+PString;
            var oldPTime = settingsChat.flood.PTime;
            var title = l[lang].SEND_PUNISHMENT_DURATION.replace("{punishment}",punishmentToText(lang, settingsChat.flood.punishment));
            var setTimeReturn = ST.callbackEvent(TGbot, oldPTime, cb, chat, user, cb_prefix, returnButtons, title)

            if(oldPTime != setTimeReturn.time)
            {
                settingsChat.flood.PTime = setTimeReturn.time;
                db.chats.update(settingsChat);
            }
        }

        if(setNumReturn.updateUser)
        {
            user = setNumReturn.user;
            db.users.update(user);
        };
        if(setTimeReturn.updateUser)
        {
            user = setTimeReturn.user;
            db.users.update(user);
        };

        var newValue = setNumReturn.number;
        if(cb.data.includes("#SNUM"))
        {
            if(cb.data.startsWith("S_FLOOD_MESSAGES#SNUM_MENU") && settingsChat.flood.messages != newValue)
                settingsChat.flood.messages = newValue;
            else if(cb.data.startsWith("S_FLOOD_TIME#SNUM_MENU") && settingsChat.flood.time != newValue)
                settingsChat.flood.time = newValue;
            else return;

            db.chats.update(settingsChat);

            TGbot.answerCallbackQuery(cb.id);
        }

    })

    GHbot.on( "message", async (msg, chat, user) => {


        if( !user.waitingReply ) return;
        if( !user.waitingReplyType.startsWith("S_FLOOD") ) return;


        var settingsChatId = user.waitingReplyType.split(":")[1];
        if( chat.isGroup && settingsChatId != chat.id ) return;//additional security guard
        var settingsChat = db.chats.get(settingsChatId)

        if( !isAdminOfChat(settingsChat, user.id) ) return;

        var returnButtons = [[{text: l[user.lang].CANCEL_BUTTON, callback_data: "S_FLOOD_M_:"+settingsChatId}]]
        var newTime = -1;
        var cb_prefix = "";
        if( user.waitingReplyType.startsWith("S_FLOOD_PTIME_") )
        {
            var PString = user.waitingReplyType.split("S_FLOOD_PTIME_")[1].split("#")[0];
            cb_prefix = "S_FLOOD_PTIME_"+PString
            var oldPTime = settingsChat.flood.PTime;
            var title = l[user.lang].SEND_PUNISHMENT_DURATION.replace("{punishment}",punishmentToText(user.lang, settingsChat.flood.punishment));
            newTime = ST.messageEvent(TGbot, oldPTime, msg, chat, user, cb_prefix, returnButtons, title);
        }

        if(newTime != -1 && settingsChat.flood.PTime != newTime)
        {
            settingsChat.flood.PTime = newTime;
            db.chats.update(settingsChat);
        }

    } )


}

module.exports = main;
