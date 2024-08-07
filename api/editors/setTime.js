const TelegramBot = require("node-telegram-bot-api");
const {parseHumanTime, secondsToHumanTime, waitReplyForChat} = require("../utils/utils.js");
const GH = require("../../GHbot.js");

/** 
 * @param  {GH} GHbot
 * @param {GH.LGHDatabase} db - database
 * @param  {customMessage} currentNumber
 * @param  {GH.LGHCallback} cb
 * @param  {GH.LGHChat} chat - selectedChat
 * @param  {GH.LGHUser} user
 * @param  {String} cb_prefix
 * @param  {String} title
 * @param  {TelegramBot.KeyboardButton} returnButtons
 * @param  {String} title - custom title avaiable editing the message
 * @param  {Number} min - minimum allowed time in seconds
 * @param  {Number} max - maximum allowed time in seconds
 * 
 * @return {Number|-1} returns new set time
 */
function callbackEvent(GHbot, db, currentTime, cb, chat, user, cb_prefix, returnButtons, title, min, max)
{
    var l = global.LGHLangs;
    var time = currentTime;

    title=title||false;
    if(title == false)
        title = "Time selector {time}"
    else
        title = title+"\n\n";
    returnButtons=returnButtons||[];

    min=min||30;
    max=max||31536000; //1 year

    var msg = cb.message;
    var lang = user.lang;

    if( cb.data.startsWith(cb_prefix+"#STIME_ZERO:") ) time = 0;
    if( cb.data.startsWith(cb_prefix+"#STIME") )
    {
        var callback = cb_prefix+"#STIME";
        waitReplyForChat(db, callback, user, chat, msg.chat.isGroup);

        var options = {
            message_id : msg.message_id,
            chat_id : msg.chat.id,
            parse_mode : "HTML",
            reply_markup : {
                inline_keyboard : []
            } 
        }
        if(time != 0)
            options.reply_markup.inline_keyboard.push([{text: l[user.lang].DISABLE_DURATION_BUTTON, callback_data: cb_prefix+"#STIME_ZERO:"+chat.id}])

        text = (title+l[lang].STIME_DESCRIPTION)
        .replaceAll("{time}", secondsToHumanTime(lang, time) + " ("+time+" seconds)") 
        .replaceAll("{minimum}",secondsToHumanTime(lang, min))
        .replaceAll("{maximum}",secondsToHumanTime(lang, max)); //TODO : translate to human readable time

        returnButtons.forEach(button => {
            options.reply_markup.inline_keyboard.push( button );
        })
        GHbot.editMessageText(user.id, text, options)
        GHbot.answerCallbackQuery(user.id, cb.id);
    }

    return time;

}

/** 
 * @param  {GH} GHbot
 * @param  {TelegramBot.Message} currentTime
 * @param  {GH.LGHMessage} msg
 * @param  {GH.LGHChat} chat - selectedChat
 * @param  {GH.LGHUser} user
 * @param  {String} cb_prefix
 * @param  {TelegramBot.KeyboardButton} returnButtons
 * @param  {String} title - custom title avaiable editing the message
 * @param  {Number} min - minimum allowed time in seconds
 * @param  {Number} max - maximum allowed time in seconds
 * 
 * @return {Number|-1} - returns new set time, -1 if error
 */
function messageEvent(GHbot, currentTime, msg, chat, user, cb_prefix, returnButtons, title, min, max)
{

    var l = global.LGHLangs;
    var time = currentTime;

    var text = msg.text;

    title=title||false;
    if(title == false)
        title = "Time selector {time}"
    else
        title = title+"\n\n";

    min=min||30;
    max=max||31536000; //1 year

    var options = {
        parse_mode : "HTML",
        reply_markup : 
        {
            inline_keyboard : [] 
        } 
    }
    var errorOpts = {
        parse_mode : "HTML",
        reply_markup : 
        {
            inline_keyboard : [[{text: l[user.lang].BACK_BUTTON, callback_data: cb_prefix+"#STIME:"+chat.id}]] 
        } 
    }

    if( msg.waitingReply.startsWith(cb_prefix+"#STIME") )
    {
        var time = parseHumanTime(text)
        var minTimeHuman = secondsToHumanTime(user.lang, min);
        var maxTimeHuman = secondsToHumanTime(user.lang, max);

        if(time != 0)
            options.reply_markup.inline_keyboard.push([{text: l[user.lang].DISABLE_DURATION_BUTTON, callback_data: cb_prefix+"#STIME_ZERO:"+chat.id}])
        returnButtons.forEach(button => {
            options.reply_markup.inline_keyboard.push( button );
        })

        var errorMessage = -1;
        if(time === 0 || time === 1)
            errorMessage = l[user.lang].STIME_INVALID_INPUT;
        if(time > max)
            errorMessage = l[user.lang].SNUM_TOOBIG.replace("{number}",maxTimeHuman)
        if(time < min)
            errorMessage = l[user.lang].SNUM_TOOSMALL.replace("{number}",minTimeHuman)
        if(errorMessage != -1)
        {
            GHbot.sendMessage(user.id, msg.chat.id, errorMessage, errorOpts);
            return -1;
        }

        text = (title+l[user.lang].STIME_DESCRIPTION).replaceAll("{time}", secondsToHumanTime(user.lang, time) + " ("+time+" seconds)")
        .replaceAll("{minimum}",minTimeHuman).replaceAll("{maximum}",maxTimeHuman);

        GHbot.sendMessage(user.id, msg.chat.id, text, options);
    }

    return time;

}

module.exports = {

    callbackEvent : callbackEvent,
    messageEvent : messageEvent

}
