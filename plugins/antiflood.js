var LGHelpTemplate = require("../GHbot.js");
const { bold, punishmentToText, getUnixTime, genPunishmentTimeSetButton, punishmentToTextAndTime, chunkArray, textToPunishment, genPunishButtons, handlePunishmentCallback } = require("../api/utils.js");
const SN = require("../api/setNum.js");
const ST = require("../api/setTime.js");
const RM = require("../api/rolesManager.js");
const { punishUser } = require("../api/punishment.js");

//object structure: global.LGHFlood[chatId+userId] = { lastPunishment, grouped: { [groupId] : {ids: [messageIds], time} }, single: { [messageId] : time } }
global.LGHFlood = {};

function clearOutOfRangeMessages(key, now, maxTime)
{
    var grouped = global.LGHFlood[key].grouped;
    Object.keys(grouped).forEach((groupId)=>{
        var time = grouped[groupId].time;
        if( (now-time) > maxTime) delete global.LGHFlood[key].grouped[groupId];
    })
    Object.keys(global.LGHFlood[key].single).forEach((id)=>{
        var time  = global.LGHFlood[key].single[id];
        if( (now-time) > maxTime) delete global.LGHFlood[key].single[id];
    })
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
        var keys = Object.keys(global.LGHFlood);
        keys.forEach((key)=>{
            clearOutOfRangeMessages(key, now, timeMax);

            var groupedNum = Object.keys(global.LGHFlood[key].grouped).length;
            var singleNum = Object.keys(global.LGHFlood[key].single).length;
            if( groupedNum == 0 && singleNum == 0)
                delete global.LGHFlood[key];   
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

        var returnButtons = [[{text: l[lang].BACK_BUTTON, callback_data: "S_FLOOD_M_:"+settingsChatId}]];
        var cb_prefix = cb.data.split("#")[0];

        //main menu based settings
        if( cb.data.startsWith("S_FLOOD_M_P_") )
        {
            var toSetPunishment = handlePunishmentCallback(GHbot, cb, user.id, settingsChat.flood.punishment);
            if(toSetPunishment == settingsChat.flood.punishment) return;
            else {settingsChat.flood.punishment = toSetPunishment; db.chats.update(settingsChat)};
        }
        //Set punishment duration
        if(cb.data.startsWith("S_FLOOD_M_PTIME#STIME") )
        {
            var currentTime = settingsChat.flood.PTime;
            var title = l[lang].SEND_PUNISHMENT_DURATION.replace("{punishment}",punishmentToText(lang, settingsChat.flood.punishment));
            var time = ST.callbackEvent(GHbot, db, currentTime, cb, chat, user, cb_prefix, returnButtons, title)

            if(time != -1 && time != currentTime)
            {
                settingsChat.flood.PTime = time;
                db.chats.update(settingsChat);
            }
            return;
        }
        if( cb.data.startsWith("S_FLOOD_M_DELETION:") )
        {
            settingsChat.flood.delete = !settingsChat.flood.delete;
            db.chats.update(settingsChat)
        }
        if( cb.data.startsWith("S_FLOOD_M_") )
        {

            var punishment = settingsChat.flood.punishment;
            var punishmentText = punishmentToTextAndTime(lang, punishment, settingsChat.flood.PTime)
            var text = l[lang].ANTIFLOOD+"\n"+
            l[lang].ANTIFLOOD_DESCRIPTION.replace("{messages}",settingsChat.flood.messages).replace("{seconds}",settingsChat.flood.time)+"\n\n"+
            bold(l[lang].PUNISHMENT+": ")+punishmentText;
            
            var buttons = [[{text: l[lang].MESSAGES_BUTTON, callback_data: "S_FLOOD_MESSAGES#SNUM_MENU:"+settingsChatId},{text: l[lang].TIME_BUTTON, callback_data: "S_FLOOD_TIME#SNUM_MENU:"+settingsChatId}]]
            genPunishButtons(lang, punishment, "S_FLOOD_M", settingsChatId, true, settingsChat.flood.delete).forEach((line)=>buttons.push(line));
            buttons.push([{text: l[lang].BACK_BUTTON, callback_data: "SETTINGS_HERE:"+settingsChatId}]);

            var options = {
                message_id : msg.message_id,
                chat_id : chat.id,
                parse_mode : "HTML",
                reply_markup : {inline_keyboard: buttons} 
            }
            GHbot.editMessageText(user.id, text, options)
            GHbot.answerCallbackQuery(user.id, cb.id);

        }

        //Setnum variables
        if( cb.data.startsWith("S_FLOOD_MESSAGES#SNUM_MENU") )
        {
            var title = l[lang].ANTIFLOOD_DESCRIPTION.replaceAll("{messages}",bold("{number}")).replaceAll("{seconds}",settingsChat.flood.time);
            var num = SN.callbackEvent(GHbot, db, settingsChat.flood.messages, cb, chat, user, cb_prefix, returnButtons, title, msgMin, msgMax);

            if(num != -1 && num != settingsChat.flood.messages)
            {
                settingsChat.flood.messages = num;
                db.chats.update(settingsChat);
            }
            else GHbot.answerCallbackQuery(user.id, cb.id);
        }
        if( cb.data.startsWith("S_FLOOD_TIME#SNUM_MENU") )
        {
            var title = l[lang].ANTIFLOOD_DESCRIPTION.replaceAll("{seconds}",bold("{number}")).replaceAll("{messages}",settingsChat.flood.messages);
            var num = SN.callbackEvent(GHbot, db, settingsChat.flood.time, cb, chat, user, cb_prefix, returnButtons, title, timeMin, timeMax);

            if(num != -1 && num != settingsChat.flood.time)
            {
                settingsChat.flood.time = num;
                db.chats.update(settingsChat);
            }
            else GHbot.answerCallbackQuery(user.id, cb.id);
        }

    })

    GHbot.onMessage( async (msg, chat, user) => {


        if(chat.type != "private"){(()=>{
            if(chat.flood.punishment == 0 && chat.flood.delete == false) return;
            if(user.perms.flood == 1) return;

            var key = chat.id+"_"+user.id;

            if(!global.LGHFlood.hasOwnProperty(key))
                global.LGHFlood[key] = {lastPunishment : 0, grouped: {}, single: {}};
            
            var now = msg.date;
            var mLevel = chat.flood.messages;
            var tLevel = chat.flood.time;
            var grouped = global.LGHFlood[key].grouped;
            clearOutOfRangeMessages(key, now, tLevel);

            //count this message
            if(msg.hasOwnProperty("media_group_id") && !grouped.hasOwnProperty(msg.media_group_id))
            {
                global.LGHFlood[key].grouped[msg.media_group_id] = {ids:[msg.message_id], time: now}
            }
            else if(msg.hasOwnProperty("media_group_id") && grouped.hasOwnProperty(msg.media_group_id))
            {
                global.LGHFlood[key].grouped[msg.media_group_id].ids.push(msg.message_id);
                global.LGHFlood[key].grouped[msg.media_group_id].time = now;
            }
            else if(!msg.hasOwnProperty("media_group_id"))
            {
                global.LGHFlood[key].single[msg.message_id] = now;
            }

            //check if antiflood fired
            var fire = false;
            var messageCount = Object.keys(global.LGHFlood[key].grouped).length + Object.keys(global.LGHFlood[key].single).length;
            if(messageCount > mLevel) fire = true;
    

            //flood reaction//
            if(fire && chat.flood.delete)
            {
                var messagesIds = [];

                Object.keys(grouped).forEach((groupId)=>{
                    grouped[groupId].ids.forEach((id)=>{messagesIds.push(id)});
                    delete global.LGHFlood[key].grouped[groupId];
                })
                Object.keys(global.LGHFlood[key].single).forEach((id)=>{
                    messagesIds.push(id);
                    delete global.LGHFlood[key].single[id];
                })

                //keep inside 100 messages telegram limit
                chunkArray(messagesIds, 100).forEach((ids)=>{
                    TGbot.deleteMessages(chat.id, ids)
                })
                
            }

            //punish
            var lastPunishment = global.LGHFlood[key].lastPunishment;
            var recentlyPunished = (now - lastPunishment) < tLevel;
            if(fire && !recentlyPunished)
            {
                var PTime = (chat.flood.PTime == 0) ? -1 : chat.flood.PTime;
                var reason = l[chat.lang].ANTIFLOOD_PUNISHMENT.replaceAll("{number}",chat.flood.messages).replaceAll("{time}",chat.flood.time);
                punishUser(GHbot, user.id,  chat, RM.userToTarget(chat, user), chat.flood.punishment, PTime, reason)
            }
            if(fire) global.LGHFlood[key].lastPunishment = now;

        })()}

        //security guards
        if( !(user.waitingReply && user.waitingReplyType.startsWith("S_FLOOD")) ) return;
        var settingsChatId = user.waitingReplyType.split(":")[1];
        if( chat.isGroup && settingsChatId != chat.id ) return;//additional security guard
        if( !(user.perms && user.perms.settings) ) return;
        
        var settingsChat = db.chats.get(settingsChatId)
        //punishment time setting
        var returnButtons = [[{text: l[user.lang].BACK_BUTTON, callback_data: "S_FLOOD_M_:"+settingsChatId}]]
        var cb_prefix = user.waitingReplyType.split("#")[0];
        if( user.waitingReplyType.startsWith("S_FLOOD_M_PTIME#STIME") )
        {
            var title = l[user.lang].SEND_PUNISHMENT_DURATION.replace("{punishment}",punishmentToText(user.lang, settingsChat.flood.punishment));
            var time = ST.messageEvent(GHbot, settingsChat.flood.PTime, msg, chat, user, cb_prefix, returnButtons, title);

            if(time != -1 && time != settingsChat.flood.PTime)
            {
                settingsChat.flood.PTime = time;
                db.chats.update(settingsChat);
            }
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
