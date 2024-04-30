const TelegramBot = require("node-telegram-bot-api");
const {parseHumanTime, secondsToHumanTime} = require("./utils.js");

/** 
 * @param  {import("../GHbot.js")} GHbot
 * @param {import("../GHbot.js").LGHDatabase} db - database
 * @param  {customMessage} currentNumber
 * @param  {TelegramBot.CallbackQuery} cb
 * @param  {TelegramBot.Chat} chat
 * @param  {TelegramBot.User} user
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

    var settingsChatId = cb.data.split(":")[1];

    if( cb.data.startsWith(cb_prefix+"#STIME_ZERO:") ) time = 0;
    if( cb.data.startsWith(cb_prefix+"#STIME") )
    {
        user.waitingReply = chat.id;
        user.waitingReplyType = cb_prefix+"#STIME:"+settingsChatId;
        db.users.update(user);

        var options = {
            message_id : msg.message_id,
            chat_id : chat.id,
            parse_mode : "HTML",
            reply_markup : {
                inline_keyboard : []
            } 
        }
        if(time != 0)
            options.reply_markup.inline_keyboard.push([{text: l[user.lang].DISABLE_DURATION_BUTTON, callback_data: cb_prefix+"#STIME_ZERO:"+settingsChatId}])

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
 * @param  {import("../GHbot.js")} GHbot
 * @param  {TelegramBot.Message} currentTime
 * @param  {TelegramBot.Message} msg
 * @param  {TelegramBot.Chat} chat
 * @param  {TelegramBot.User} user
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

    var settingsChatId = user.waitingReplyType.split(":")[1];
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
            inline_keyboard : [[{text: l[user.lang].BACK_BUTTON, callback_data: cb_prefix+"#STIME:"+settingsChatId}]] 
        } 
    }

    if(time != 0)
            options.reply_markup.inline_keyboard.push([{text: l[user.lang].DISABLE_DURATION_BUTTON, callback_data: cb_prefix+"#STIME_ZERO:"+settingsChatId}])
    returnButtons.forEach(button => {
        options.reply_markup.inline_keyboard.push( button );
    })

    if( user.waitingReplyType.startsWith(cb_prefix+"#STIME:") )
    {
        var time = parseHumanTime(text)
        var minTimeHuman = secondsToHumanTime(user.lang, min);
        var maxTimeHuman = secondsToHumanTime(user.lang, max);

        var errorMessage = -1;
        if(time === 0 || time === 1)
            errorMessage = l[user.lang].STIME_INVALID_INPUT;
        if(time > max)
            errorMessage = l[user.lang].SNUM_TOOBIG.replace("{number}",maxTimeHuman)
        if(time < min)
            errorMessage = l[user.lang].SNUM_TOOSMALL.replace("{number}",minTimeHuman)
        if(errorMessage != -1)
        {
            GHbot.sendMessage(user.id, chat.id, errorMessage, errorOpts);
            return -1;
        }

        text = (title+l[user.lang].STIME_DESCRIPTION).replaceAll("{time}", secondsToHumanTime(user.lang, time) + " ("+time+" seconds)")
        .replaceAll("{minimum}",minTimeHuman).replaceAll("{maximum}",maxTimeHuman); //TODO : translate to human readable time

        GHbot.sendMessage(user.id, chat.id, text, options);
    }

    return time;

}

module.exports = {

    callbackEvent : callbackEvent,
    messageEvent : messageEvent

}
