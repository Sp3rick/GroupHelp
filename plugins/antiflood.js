var LGHelpTemplate = require("../GHbot.js");
const { bold, punishmentToText, secondsToHumanTime, getUnixTime, punishmentToSetTimeButtonText, genPunishmentTimeSetButton, punishmentToTextAndTime } = require("../api/utils.js");
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

    var msgMin = config.ANTIFLOOD_msgMin;
    var msgMax = config.ANTIFLOOD_msgMax;
    var timeMin = config.ANTIFLOOD_timeMin;
    var timeMax = config.ANTIFLOOD_timeMax;

    //clear useless chats/messages on global.LGHFlood
    setInterval(()=>{

        var now = getUnixTime();
        var chatIds = Object.keys(global.LGHFlood);
        chatIds.forEach((chatId)=>{

            var chat = global.LGHFlood[chatId];
            
            //delete useless messages for the antiflood
            var msgIds = Object.keys(chat.messages)
            msgIds.forEach((msgId)=>{
                var time = chat.messages[msgId]
                if(now - time > config.ANTIFLOOD_timeMax)
                    delete global.LGHFlood[chatId].messages[msgId]
            })

            //if no messages clear chat object
            msgIds = Object.keys(chat.messages)
            if(msgIds.length == 0)
                delete global.LGHFlood[chatId] 

        }

    )},timeMax*1000)

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
                GHbot.answerCallbackQuery(user.id, cb.id);
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
            var punishmentText = punishmentToTextAndTime(lang, punishment, settingsChat.flood.PTime)
            var text = l[lang].ANTIFLOOD+"\n"+
            l[lang].ANTIFLOOD_DESCRIPTION.replace("{messages}",settingsChat.flood.messages).replace("{seconds}",settingsChat.flood.time)+"\n\n"+
            punishmentText;
        
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
            
            var punishmentTimeSetButton = genPunishmentTimeSetButton(lang, punishment, "S_FLOOD_PTIME", settingsChatId);
            if(punishmentTimeSetButton) options.reply_markup.inline_keyboard.push(punishmentTimeSetButton);
            
            options.reply_markup.inline_keyboard.push([{text: l[lang].BACK_BUTTON, callback_data: "SETTINGS_HERE:"+settingsChatId}])

            GHbot.editMessageText(user.id, text, options)
            GHbot.answerCallbackQuery(user.id, cb.id);

        }

        //Setnum variables
        var returnButtons = [[{text: l[lang].BACK_BUTTON, callback_data: "S_FLOOD_M_:"+settingsChatId}]]
        var setNumReturn = {};
        var cb_prefix = cb.data.split("#")[0];
        if( cb.data.startsWith("S_FLOOD_MESSAGES#SNUM_MENU") )
        {
            var title = l[lang].ANTIFLOOD_DESCRIPTION.replaceAll("{messages}",bold("{number}")).replaceAll("{seconds}",settingsChat.flood.time);
            setNumReturn = SN.callbackEvent(GHbot, settingsChat.flood.messages, cb, chat, user, cb_prefix, returnButtons, title, msgMin, msgMax);
        }
        if( cb.data.startsWith("S_FLOOD_TIME#SNUM_MENU") )
        {
            var title = l[lang].ANTIFLOOD_DESCRIPTION.replaceAll("{seconds}",bold("{number}")).replaceAll("{messages}",settingsChat.flood.messages);
            setNumReturn = SN.callbackEvent(GHbot, settingsChat.flood.time, cb, chat, user, cb_prefix, returnButtons, title, timeMin, timeMax);
        }

        //Set punishment duration
        var returnButtons = [[{text: l[lang].CANCEL_BUTTON, callback_data: "S_FLOOD_M_:"+settingsChatId}]]
        var setTimeReturn =  {};
        if(cb.data.startsWith("S_FLOOD_PTIME#STIME") ) //example S_FLOOD_PTIME_WARN
        {
            var oldPTime = settingsChat.flood.PTime;
            var title = l[lang].SEND_PUNISHMENT_DURATION.replace("{punishment}",punishmentToText(lang, settingsChat.flood.punishment));
            var setTimeReturn = ST.callbackEvent(GHbot, oldPTime, cb, chat, user, cb_prefix, returnButtons, title)

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

            GHbot.answerCallbackQuery(user.id, cb.id);
        }

    })

    GHbot.onMessage( async (msg, chat, user) => {


        if(chat.type != "private"){(()=>{
            if(chat.flood.punishment == 0 && chat.flood.delete == false) return;
            if(user.perms.flood == 1) return;

            if(!global.LGHFlood.hasOwnProperty(chat.id))
                global.LGHFlood[chat.id] = {lastUse: 0, lastPunishment : 0, messages: {}};
            
            var now = msg.date;
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
                var reason = l[chat.lang].ANTIFLOOD_PUNISHMENT.replaceAll("{number}",chat.flood.messages).replaceAll("{time}",chat.flood.time);
                punishUser(GHbot, user.id,  chat, RM.userToTarget(chat, user), chat.flood.punishment, PTime, reason)
            }
            if(isFloodLimitFired) //update lastPunishment anyway, by this way user will be punished once for each flood round
                global.LGHFlood[chat.id].lastPunishment = now;

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
        var cb_prefix = user.waitingReplyType.split("#")[0];
        if( user.waitingReplyType.startsWith("S_FLOOD_PTIME#STIME") )
        {
            var oldPTime = settingsChat.flood.PTime;
            var title = l[user.lang].SEND_PUNISHMENT_DURATION.replace("{punishment}",punishmentToText(user.lang, settingsChat.flood.punishment));
            newTime = ST.messageEvent(GHbot, oldPTime, msg, chat, user, cb_prefix, returnButtons, title);
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
            newValue = SN.messageEvent(GHbot, settingsChat.flood.messages, msg, chat, user, "S_FLOOD_MESSAGES", returnButtons, title, msgMin, msgMax);
        }
    
        if( user.waitingReplyType.startsWith("S_FLOOD_TIME#SNUM")  )
        {
            var title = l[user.lang].ANTIFLOOD_DESCRIPTION.replaceAll("{seconds}",bold("{number}")).replaceAll("{messages}",settingsChat.flood.messages);
            newValue = SN.messageEvent(GHbot, settingsChat.flood.time, msg, chat, user, "S_FLOOD_TIME", returnButtons, title, timeMin, timeMax);
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
