const TelegramBot = require("node-telegram-bot-api");
const ST = require("./setTime.js");
const {handlePunishmentCallback, genPunishButtons, punishmentToFullText, punishmentToText} = require("../utils.js");
const GH = require("../../GHbot.js");

/** 
 * @param  {GH} GHbot
 * @param  {GH.LGHDatabase} db - database
 * @param  {GH.LGHChatBasedPunish} CBP
 * @param  {GH.LGHCallback} cb
 * @param  {GH.LGHChat} chat - selectedChat
 * @param  {GH.LGHUser} user
 * @param  {String} cb_prefix
 * @param  {TelegramBot.KeyboardButton} returnButtons
 * @param  {String} title - custom title avaiable editing the message
 * @return {LGHChatBasedPunish|false} - returns a modified version of passed CPB, false if shouldn't be updated
 */
function callbackEvent(GHbot, db, CBP, cb, chat, user, cb_prefix, returnButtons, title)
{

    title = title || "Set chat based punish"

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
        var STReturnButtons = [[{text: l[lang].BACK_BUTTON, callback_data: prefix+"_"+toEdit+":"+chat.id}]]
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

        var channelsCB = (toEdit == "CHANNELS") ? prefix+":"+chat.id : prefix+"_CHANNELS:"+chat.id
        var groupsCB = (toEdit == "GROUPS") ? prefix+":"+chat.id : prefix+"_GROUPS:"+chat.id
        var usersCB = (toEdit == "USERS" )? prefix+":"+chat.id : prefix+"_USERS:"+chat.id
        var botsCB = (toEdit == "BOTS") ? prefix+":"+chat.id : prefix+"_BOTS:"+chat.id

        var buttons = [
            [{text: channelsB, callback_data: channelsCB},
            {text: groupsB, callback_data: groupsCB}],

            [{text: usersB, callback_data: usersCB},
            {text: botsB, callback_data: botsCB}],
        ];

        if(toEdit)
        {
            buttons.push([{text: "➖➖➖➖➖➖➖➖➖➖", callback_data: "EMPTY"}]);
            genPunishButtons(lang, punishment, prefix+"_"+toEdit, chat.id, true, pData.delete).forEach((line)=>{buttons.push(line)});
        }

        returnButtons.forEach((line)=>{buttons.push(line)});

        var text = title+"\n"+l[lang].CHAT_BASED_PERMS
        .replace("{channels}", punishmentToFullText(lang, channels.punishment, channels.PTime, channels.delete))
        .replace("{groups}", punishmentToFullText(lang, groups.punishment, groups.PTime, groups.delete))
        .replace("{users}", punishmentToFullText(lang, users.punishment, users.PTime, users.delete))
        .replace("{bots}", punishmentToFullText(lang, bots.punishment, bots.PTime, bots.delete));
        GHbot.editMessageText( user.id, text, {
            message_id : msg.message_id,
            chat_id : msg.chat.id,
            parse_mode : "HTML",
            reply_markup : {inline_keyboard: buttons} 
        })
        GHbot.answerCallbackQuery(user.id, cb.id);
    }

    return update ? CBP : false;
}

/** 
 * @param  {GH} GHbot
 * @param  {GH.LGHChatBasedPunish} CBP
 * @param  {GH.LGHMessage} msg
 * @param  {GH.LGHChat} chat - selectedChat
 * @param  {GH.LGHUser} user
 * @param  {String} cb_prefix
 * 
 * @return {LGHChatBasedPunish|false} returns a modified version of passed CPB, false if shouldn't be updated
 */
function messageEvent(GHbot, CBP, msg, chat, user, cb_prefix)
{

    var l = global.LGHLangs;

    var lang = user.lang;

    var update = false;
    var prefix = cb_prefix+"#CBP";
   

    var toEdit = false; //set what we are going to edit
    var pData = false; //punishment data about what we are editing
    var PObjName = false;
    if (msg.waitingReply.startsWith(prefix+"_CHANNELS"))
        toEdit = "CHANNELS";
    if (msg.waitingReply.startsWith(prefix+"_GROUPS"))
        toEdit = "GROUPS";
    if (msg.waitingReply.startsWith(prefix+"_USERS"))
        toEdit = "USERS";
    if (msg.waitingReply.startsWith(prefix+"_BOTS"))
        toEdit = "BOTS";
    if (toEdit) {
        var PObjName = toEdit.toLowerCase();
        pData = CBP[PObjName];
    }
    if (msg.waitingReply.startsWith(prefix+"_"+toEdit+"_PTIME#STIME")) {
        var STReturnButtons = [[{ text: l[user.lang].BACK_BUTTON, callback_data: prefix+"_"+toEdit+":"+chat.id }]];
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
