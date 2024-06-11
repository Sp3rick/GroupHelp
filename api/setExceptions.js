const TelegramBot = require("node-telegram-bot-api");
const { isNumber, genSetNumKeyboard, bold, usernameOrFullName, fullName } = require("./utils.js");
const GH = require("../GHbot.js");

/**
 * @callback ValidatorFunction
 * @param {string} exception
 * @returns {String|false} - returns fixed exception string if the entered one is valid, otherwise return false
 */


/** 
 * @param  {GH} GHbot
 * @param {GH.LGHDatabase} db - database
 * @param  {Array<String>} exceptions
 * @param  {TelegramBot.CallbackQuery} cb
 * @param  {TelegramBot.Chat} chat
 * @param  {TelegramBot.User} user
 * @param  {String} cb_prefix
 * @param  {TelegramBot.KeyboardButton} returnButtons
 * @param  {String} title - custom title avaiable on menu to set the exceptions
 * @param  {String} addTitle - title avaiable on menu to add an exception
 * @param  {String} delTitle - title avaiable on menu to remove an exception
 * 
 * @return {Array<String>|false} - Array of exceptions string if has been updated, else return false
 */
function callbackEvent(GHbot, db, exceptions, cb, chat, user, cb_prefix, returnButtons, title, addTitle, delTitle) {

    title = title || "Set exceptions";
    addTitle = addTitle || "Send the exception username or link, or forward a message from a target channel";
    delTitle = delTitle || "Send the exception username or link, or forward a message from a target channel";
    returnButtons = returnButtons || [];

    var l = global.LGHLangs;
    var msg = cb.message;
    var update = false;
    var prefix = cb_prefix + "#EXC";
    var lang = user.lang;

    var settingsChatId = cb.data.split(":")[1];

    if (cb.data.startsWith(prefix+"_MENU")) {

        buttons = [
            [{ text: l[lang].SHOW_WHITELIST_BUTTON, callback_data: prefix + "_SHOW:" + settingsChatId }],

            [{ text: l[lang].ADD_BUTTON, callback_data: prefix + "_ADD:" + settingsChatId },
            { text: l[lang].REMOVE_BUTTON, callback_data: prefix + "_REMOVE:" + settingsChatId }],
        ]

        returnButtons.forEach((line)=>{buttons.push(line)});

        GHbot.editMessageText(user.id, title, {
            message_id: msg.message_id,
            chat_id: chat.id,
            parse_mode: "HTML",
            reply_markup: { inline_keyboard: buttons }
        });

    }
    if (cb.data.startsWith(prefix+"_SHOW")) {
        var text = bold(l[lang].EXC_LIST)+"\n"

        exceptions.forEach((exc)=>{text+="\n"+exc});
        if(exceptions.length == 0) text+="\n"+l[lang].EMPTY

        buttons = [[{ text: l[lang].BACK_BUTTON, callback_data: prefix + "_MENU:" + settingsChatId }]]

        GHbot.editMessageText(user.id, text, {
            message_id: msg.message_id,
            chat_id: chat.id,
            parse_mode: "HTML",
            link_preview_options : JSON.stringify({is_disabled : true}),
            reply_markup: { inline_keyboard: buttons }
        });
    }
    if (cb.data.startsWith(prefix+"_ADD")) {
        user.waitingReply = chat.id;
        user.waitingReplyType = prefix+"_ADD:"+settingsChatId;
        db.users.update(user);
        buttons = [[{ text: l[lang].BACK_BUTTON, callback_data: prefix + "_MENU:" + settingsChatId }]]
        GHbot.editMessageText(user.id, addTitle, {
            message_id: msg.message_id,
            chat_id: chat.id,
            parse_mode: "HTML",
            link_preview_options : JSON.stringify({is_disabled : true}),
            reply_markup: { inline_keyboard: buttons }
        });
    }
    if (cb.data.startsWith(prefix+"_REMOVE")) {
        user.waitingReply = chat.id;
        user.waitingReplyType = prefix+"_REMOVE:"+settingsChatId;
        db.users.update(user);
        buttons = [[{ text: l[lang].BACK_BUTTON, callback_data: prefix + "_MENU:" + settingsChatId }]]
        GHbot.editMessageText(user.id, delTitle, {
            message_id: msg.message_id,
            chat_id: chat.id,
            parse_mode: "HTML",
            link_preview_options : JSON.stringify({is_disabled : true}),
            reply_markup: { inline_keyboard: buttons }
        });
    }


    return update ? exceptions : false;

}

/** 
 * @param  {GH} GHbot
 * @param {GH.LGHDatabase} db - database
 * @param  {Array<String>} exceptions
 * @param  {ValidatorFunction} validator
 * @param  {TelegramBot.Message} msg
 * @param  {TelegramBot.Chat} chat
 * @param  {TelegramBot.User} user
 * @param  {String} cb_prefix
 * @param  {TelegramBot.KeyboardButton} returnButtons
 * @param  {String} title - custom title avaiable editing the message
 * @param  {Number} max - maximum allowed exceptions
 * 
 * @return {Number}
 */
function messageEvent(GHbot, db, exceptions, validator, msg, chat, user, cb_prefix, returnButtons, max) {

    var l = global.LGHLangs;

    var settingsChatId = user.waitingReplyType.split(":")[1].split("?")[0];
    var prefix = cb_prefix+"#EXC";
    var lang = user.lang;
    max = max || 100;


    //gather wanted data passed by user
    var foundStrings = false;
    var channelForward = msg.forward_origin && msg.forward_origin.type == "channel";
    var hUserForward = msg.forward_origin && msg.forward_origin.type == "hidden_user";
    var userForward = msg.forward_origin && msg.forward_origin.type == "user";
    var groupForward = msg.forward_origin && msg.forward_origin.type == "chat";
    if(channelForward)
    {
        var originChat = msg.forward_origin.chat;

        //prevent adding channel by id if it's already added by username
        /*var excIndex = exceptions.indexOf("@"+originChat.username);
        if(excIndex == -1)
        {
           var chatIdExcList = exceptions.filter((exc)=>{ return exc.includes(":") && exc.split(":")[1] == String(originChat.id) });
           if(chatIdExcList.length > 0)excIndex = exceptions.indexOf(chatIdExcList[0]);
        }

        if(user.waitingReplyType.startsWith(prefix+"_ADD") && excIndex == -1)
            foundStrings = originChat.username ? [originChat.username] : [originChat.title+":"+originChat.id];

        if(user.waitingReplyType.startsWith(prefix+"_REMOVE") && excIndex == -1)
        {
            GHbot.sendMessage(user.id, chat.id, l[lang].MISSING_EXCEPTION, {reply_markup:{inline_keyboard:returnButtons}});
            return false;
        }
        
        if(user.waitingReplyType.startsWith(prefix+"_REMOVE"))
            foundStrings = [exceptions[excIndex]];
        */ //currently disabled, i think that if user forward want to store exactly the chatId, and never the username

        foundStrings = [originChat.title+":"+originChat.id];
        
    }
    else if(hUserForward)
        foundStrings = [msg.forward_origin.sender_user_name+":|hidden"];
    else if(userForward)
        foundStrings = [fullName(msg.forward_origin.sender_user)+":"+msg.forward_origin.sender_user.id]
    else if(groupForward)
        foundStrings = [msg.forward_origin.sender_chat.title+":"+msg.forward_origin.sender_chat.id]
    else if (msg.text)
        foundStrings = msg.text.split(/\r?\n/);

    if(foundStrings === false)
    {
        GHbot.sendMessage(user.id, chat.id, l[lang].INVALID_EXCEPTIONS, {reply_markup:{inline_keyboard:returnButtons}});
        return false;
    }

    //understand selected strings
    var isAnyStringValid = false;
    var alreadyExhistAll = true;
    var stringList = []; //list of validated strings
    foundStrings.forEach((froundString) => {
        var validString = validator(froundString);
        if(validString) isAnyStringValid = true;
        if(validString) stringList.push(validString);
        if(!exceptions.includes(validString)) alreadyExhistAll = false;
    })

    if(user.waitingReplyType.startsWith(prefix+"_ADD") && isAnyStringValid && !alreadyExhistAll)
    {
        var toPushExc = [];
        stringList.forEach((string)=>{if(!exceptions.includes(string)) toPushExc.push(string)});

        if(toPushExc.length+exceptions.length > max)
        {
            GHbot.sendMessage(user.id, chat.id, l[lang].TOO_MANY_EXCEPTIONS, {reply_markup:{inline_keyboard:returnButtons}});
            return false;
        }
        else
            toPushExc.forEach((exc)=>{exceptions.push(exc)});

        GHbot.sendMessage(user.id, chat.id, l[lang].EXCEPTIONS_ADDED, {reply_markup:{inline_keyboard:returnButtons}});
        return exceptions;
    }
    else if(user.waitingReplyType.startsWith(prefix+"_ADD") && alreadyExhistAll)
    {
        GHbot.sendMessage(user.id, chat.id, l[lang].EXCEPTIONS_EXHIST, {reply_markup:{inline_keyboard:returnButtons}});
        return false;
    }
    
    if(user.waitingReplyType.startsWith(prefix+"_REMOVE"))
    {
        foundStrings.forEach((string) => {
            var excIndex = exceptions.indexOf(string);
            if(excIndex == -1)
                excIndex = exceptions.indexOf(validator(string));
            
            if(excIndex != -1) exceptions.splice(excIndex, 1);
        })
        GHbot.sendMessage(user.id, chat.id, l[lang].EXCEPTIONS_REMOVED, {reply_markup:{inline_keyboard:returnButtons}});
        return exceptions;
    }

    GHbot.sendMessage(user.id, chat.id, l[lang].INVALID_EXCEPTIONS, {reply_markup:{inline_keyboard:returnButtons}});
    return false;
}

module.exports = {
    callbackEvent: callbackEvent,
    messageEvent: messageEvent
}
