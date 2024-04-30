const TelegramBot = require("node-telegram-bot-api");
const ST = require("../api/setTime.js");
const {handlePunishmentCallback, genPunishButtons, punishmentToTextAndTime, punishmentToText} = require("./utils.js");

/** 
 * @param  {import("../GHbot.js")} GHbot
 * @param  {import("../GHbot.js").LGHDatabase} db - database
 * @param  {import("../GHbot.js").LGHChatBasedPunish} CBP
 * @param  {TelegramBot.CallbackQuery} cb
 * @param  {TelegramBot.Chat} chat
 * @param  {TelegramBot.User} user
 * @param  {String} cb_prefix
 * @param  {TelegramBot.KeyboardButton} returnButtons
 * @param  {String} title - custom title avaiable editing the message
 * @return {LGHChatBasedPunish|false} - returns a modified version of passed CPB, false if shouldn't be updated
 */
function callbackEvent(GHbot, db, CBP, cb, chat, user, cb_prefix, returnButtons, title)
{

    title = title || "Set chat based punish"

    var settingsChatId = cb.data.split(":")[1].split("?")[0];
    var lang = user.lang;
    var msg = cb.message;

    var update = false;
    var prefix = cb_prefix+"#CBP";

    var toEdit = false; //set what we are going to edit
    var pData = false; //punishment data about what we are editing
    var PObjName = false;
    if( cb.data.startsWith(prefix+"_CHANNELS") )
        toEdit = "CHANNELS";
    if( cb.data.startsWith(prefix+"_GROUPS") )
        toEdit = "GROUPS";
    if( cb.data.startsWith(prefix+"_USERS") )
        toEdit = "USERS";
    if( cb.data.startsWith(prefix+"_BOTS") )
        toEdit = "BOTS";
    if(toEdit)
    {
        var PObjName = toEdit.toLowerCase();
        pData = CBP[PObjName];
    }

    if( toEdit && cb.data.startsWith(prefix+"_"+toEdit+"_P_") )
    {
        var toSetPunishment = handlePunishmentCallback(GHbot, cb, user.id, pData.punishment);
        if(toSetPunishment == pData.punishment) return false;
        else {CBP[PObjName].punishment = toSetPunishment; update = true};
    }
    if( toEdit && cb.data.startsWith(prefix+"_"+toEdit+"_PTIME#STIME") )
    {
        var currentTime = pData.PTime;
        var STReturnButtons = [[{text: l[lang].BACK_BUTTON, callback_data: prefix+"_"+toEdit+":"+settingsChatId}]]
        var STCbPrefix = prefix+"_"+toEdit+"_PTIME";
        var STTitle = l[lang].SEND_PUNISHMENT_DURATION.replace("{punishment}",punishmentToText(lang, pData.punishment));
        var time = ST.callbackEvent(GHbot, db, currentTime, cb, chat, user, STCbPrefix, STReturnButtons, STTitle)

        if(time != -1 && time != currentTime)
        {
            CBP[PObjName].PTime = time;
            update = true;
        }
        return update ? CBP : false;
    }
    if( toEdit && cb.data.startsWith(prefix+"_"+toEdit+"_DELETION") )
    {
        CBP[PObjName].delete = !pData.delete;
        update = true;
    }
    if( cb.data.startsWith(prefix) )
    {
        var punishment = pData.punishment;
        var channels = CBP.channels;
        var groups = CBP.groups;
        var users = CBP.users;
        var bots = CBP.bots;

        var channelsB = (toEdit == "CHANNELS") ? "» "+l[lang].CHANNELS_BUTTON+" «" : l[lang].CHANNELS_BUTTON;
        var groupsB = (toEdit == "GROUPS") ? "» "+l[lang].GROUPS_BUTTON+" «" : l[lang].GROUPS_BUTTON;
        var usersB = (toEdit == "USERS" )? "» "+l[lang].USERS_BUTTON+" «" : l[lang].USERS_BUTTON;
        var botsB = (toEdit == "BOTS") ? "» "+l[lang].BOTS_BUTTON+" «" : l[lang].BOTS_BUTTON;

        var channelsCB = (toEdit == "CHANNELS") ? prefix+":"+settingsChatId : prefix+"_CHANNELS:"+settingsChatId
        var groupsCB = (toEdit == "GROUPS") ? prefix+":"+settingsChatId : prefix+"_GROUPS:"+settingsChatId
        var usersCB = (toEdit == "USERS" )? prefix+":"+settingsChatId : prefix+"_USERS:"+settingsChatId
        var botsCB = (toEdit == "BOTS") ? prefix+":"+settingsChatId : prefix+"_BOTS:"+settingsChatId

        var buttons = [
            [{text: channelsB, callback_data: channelsCB},
            {text: groupsB, callback_data: groupsCB}],

            [{text: usersB, callback_data: usersCB},
            {text: botsB, callback_data: botsCB}],
        ];

        if(toEdit)
        {
            buttons.push([{text: "➖➖➖➖➖➖➖➖➖➖", callback_data: "EMPTY"}]);
            genPunishButtons(lang, punishment, prefix+"_"+toEdit, settingsChatId, true, pData.delete).forEach((line)=>{buttons.push(line)});
        }

        returnButtons.forEach((line)=>{buttons.push(line)});

        var text = title+"\n"+l[lang].CHAT_BASED_PERMS
        .replace("{channels}", punishmentToTextAndTime(lang, channels.punishment, channels.PTime))
        .replace("{groups}", punishmentToTextAndTime(lang, groups.punishment, groups.PTime))
        .replace("{users}", punishmentToTextAndTime(lang, users.punishment, users.PTime))
        .replace("{bots}", punishmentToTextAndTime(lang, bots.punishment, bots.PTime));
        GHbot.editMessageText( user.id, text, {
            message_id : msg.message_id,
            chat_id : chat.id,
            parse_mode : "HTML",
            reply_markup : {inline_keyboard: buttons} 
        })
        GHbot.answerCallbackQuery(user.id, cb.id);
    }

    return update ? CBP : false;
}

/** 
 * @param  {import("../GHbot.js")} GHbot
 * @param  {import("../GHbot.js").LGHChatBasedPunish} CBP
 * @param  {TelegramBot.Message} msg
 * @param  {TelegramBot.Chat} chat
 * @param  {TelegramBot.User} user
 * @param  {String} cb_prefix
 * 
 * @return {LGHChatBasedPunish|false} returns a modified version of passed CPB, false if shouldn't be updated
 */
function messageEvent(GHbot, CBP, msg, chat, user, cb_prefix)
{

    var l = global.LGHLangs;

    var settingsChatId = user.waitingReplyType.split(":")[1].split("?")[0];
    var lang = user.lang;

    var update = false;
    var prefix = cb_prefix+"#CBP";
   

    var toEdit = false; //set what we are going to edit
    var pData = false; //punishment data about what we are editing
    var PObjName = false;
    if (user.waitingReplyType.startsWith(prefix+"_CHANNELS"))
        toEdit = "CHANNELS";
    if (user.waitingReplyType.startsWith(prefix+"_GROUPS"))
        toEdit = "GROUPS";
    if (user.waitingReplyType.startsWith(prefix+"_USERS"))
        toEdit = "USERS";
    if (user.waitingReplyType.startsWith(prefix+"_BOTS"))
        toEdit = "BOTS";
    if (toEdit) {
        var PObjName = toEdit.toLowerCase();
        pData = CBP[PObjName];
    }
    if (user.waitingReplyType.startsWith(prefix+"_"+toEdit+"_PTIME#STIME")) {
        var STReturnButtons = [[{ text: l[user.lang].BACK_BUTTON, callback_data: prefix+"_"+toEdit+":"+settingsChatId }]];
        var STCbPrefix = prefix+"_"+toEdit+"_PTIME";
        var STTitle = l[user.lang].SEND_PUNISHMENT_DURATION.replace("{punishment}", punishmentToText(user.lang, pData.punishment));
        var time = ST.messageEvent(GHbot, pData.PTime, msg, chat, user, STCbPrefix, STReturnButtons, STTitle);

        if (time != -1 && time != pData.PTime) {
            CBP[PObjName].PTime = time;
            update = true;
        }
    }

    return update ? CBP : false;

}

module.exports = {
    callbackEvent : callbackEvent,
    messageEvent : messageEvent
}
