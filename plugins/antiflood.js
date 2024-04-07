var LGHelpTemplate = require("../GHbot.js");
const { bold, punishmentToText, secondsToHumanTime, getUnixTime } = require("../api/utils.js");
const SN = require("../api/setNum.js");
const ST = require("../api/setTime.js");
const RM = require("../api/rolesManager.js");
const { punishUser } = require("../api/punishment.js");

//object structure: global.LGHFlood[chatId] = { lastUse, lastPunishment, messages: {[messageId] : messageTime} }
global.LGHFlood = {};

function checkMessages(flood, messages)
{
    
}


function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    GHbot.onCallback( (cb, chat, user) => {

        var msg = cb.message;
        var lang = user.lang;

        var settingsChatId = {};
        var settingsChat = {};
        if( cb.data.startsWith("S_FLOOD") )
        {
            settingsChatId = cb.data.split(":")[1]
            settingsChat = db.chats.get(settingsChatId)
        }

        //security guards
        if( !cb.data.startsWith("S_FLOOD") ) return;
        if( !(user.hasOwnProperty("perms") && user.perms.settings) ) return;
        if( chat.isGroup && settingsChatId != chat.id) return;

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

    GHbot.onMessage( async (msg, chat, user) => {


        if(chat.type != "private"){(()=>{
            if(chat.flood.punishment == 0 && chat.flood.delete == false) return;
            var userPerms = RM.sumUserPerms(chat, user.id);
            if(userPerms.flood == 1) return;

            if(!global.LGHFlood.hasOwnProperty(chat.id))
                global.LGHFlood[chat.id] = {lastUse: 0, lastPunishment : 0, messages: {}};

            var now = getUnixTime();
            global.LGHFlood[chat.id].lastUse = now;
            global.LGHFlood[chat.id].messages[msg.message_id] = now;

            //triggher detection
            var isFloodLimitFired = false;

            var mLevel = chat.flood.messages;
            var tLevel = chat.flood.time;

            var inRangeMessagesIds = [];
            var messageIds = Object.keys(global.LGHFlood[chat.id].messages)
            messageIds.forEach((messageId)=>{
                var time = global.LGHFlood[chat.id].messages[messageId];
                if( (now - time) <= tLevel )
                    inRangeMessagesIds.push(messageId);
                else
                    delete global.LGHFlood[chat.id].messages[messageId]
            })

            if(inRangeMessagesIds.length >= mLevel)
                isFloodLimitFired = true;


            if(chat.flood.delete && isFloodLimitFired)
                TGbot.deleteMessages(chat.id, inRangeMessagesIds)


            var lastPunishment = global.LGHFlood[chat.id].lastPunishment;
            if(isFloodLimitFired && (now - lastPunishment) > tLevel)
            {
                global.LGHFlood[chat.id].lastPunishment = now;
                var PTime = (chat.flood.PTime == 0) ? -1 : chat.flood.PTime;
                punishUser(TGbot, chat, user, chat.flood.punishment, PTime, l[chat.lang].S_ANTIFLOOD_BUTTON)
            }
            if(isFloodLimitFired) //update lastPunishment anyway, by this way user will be punished once for each flood round
                global.LGHFlood[chat.id].lastPunishment = now;

            //TODO: options in config.json to set maximum and minimum values that can be set for messages and seconds
            //TODO: interval that delete from global.LGHFlood expired messages (based on maximum of config.json) +repeat the interval using also this value??

        })()}

        //security guards
        if( !(user.waitingReply && user.waitingReplyType.startsWith("S_FLOOD")) ) return;
        var settingsChatId = user.waitingReplyType.split(":")[1];
        if( chat.isGroup && settingsChatId != chat.id ) return;//additional security guard
        if( !(user.perms && user.perms.settings) ) return;
        
        var settingsChat = db.chats.get(settingsChatId)
        
        //punishment time setting
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


        var newValue = -1;
        var returnButtons = [[{text: l[user.lang].BACK_BUTTON, callback_data: "S_FLOOD_M_:"+settingsChatId}]]
        var title = l[user.lang].SEND_PUNISHMENT_DURATION.replace("{punishment}",punishmentToText(user.lang, settingsChat.flood.punishment));
        if( user.waitingReplyType.startsWith("S_FLOOD_MESSAGES#SNUM")  )
        {
            var title = l[user.lang].ANTIFLOOD_DESCRIPTION.replaceAll("{messages}",bold("{number}")).replaceAll("{seconds}",settingsChat.flood.time);
            newValue = SN.messageEvent(TGbot, settingsChat.flood.messages, msg, chat, user, "S_FLOOD_MESSAGES", returnButtons, title);
        }
    
        if( user.waitingReplyType.startsWith("S_FLOOD_TIME#SNUM")  )
        {
            var title = l[user.lang].ANTIFLOOD_DESCRIPTION.replaceAll("{seconds}",bold("{number}")).replaceAll("{messages}",settingsChat.flood.messages);
            newValue = SN.messageEvent(TGbot, settingsChat.flood.time, msg, chat, user, "S_FLOOD_TIME", returnButtons, title);
        }

        if(newValue != -1)
        {
            if(user.waitingReplyType.startsWith("S_FLOOD_MESSAGES#SNUM") && newValue != settingsChat.flood.messages)
            {
                settingsChat.flood.messages = newValue;
                db.chats.update(settingsChat);
            }

            if( user.waitingReplyType.startsWith("S_FLOOD_TIME#SNUM") && newValue != settingsChat.flood.time )
            {
                settingsChat.flood.time = newValue;
                db.chats.update(settingsChat);
            }
        }

    } )


}

module.exports = main;
