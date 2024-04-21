const TelegramBot = require("node-telegram-bot-api");
const {parseTextToInlineKeyboard, isObject, extractMedia, isNumber, genSetNumKeyboard, parseHumanTime, secondsToHumanTime} = require("./utils.js");


/** 
 * @typedef {Object} setNumberReturn
 * @property {customMessage} customMessage
 * @property {TelegramBot.User} user
 * @property {Boolean} updateNum - true if number has changed
 */

/** 
 * @param  {import("../GHbot.js")} GHbot
 * @param  {customMessage} currentNumber
 * @param  {TelegramBot.CallbackQuery} cb
 * @param  {TelegramBot.Chat} chat
 * @param  {TelegramBot.User} user
 * @param  {String} cb_prefix
 * @param  {String} title
 * @param  {TelegramBot.KeyboardButton} returnButtons
 * 
 * 
 * @return {Number}
 */
function callbackEvent(GHbot, currentTime, cb, chat, user, cb_prefix, returnButtons, title, min, max)
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
    var updateUser = false;

    var settingsChatId = cb.data.split(":")[1];

    if( cb.data.startsWith(cb_prefix+"#STIME_ZERO:") ) time = 0;
    if( cb.data.startsWith(cb_prefix+"#STIME") )
    {

        user.waitingReply = true;
        user.waitingReplyType = cb_prefix+"#STIME:"+settingsChatId;
        updateUser = true;

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
        returnButtons.forEach(button => {
            options.reply_markup.inline_keyboard.push( button );
        })

        text = (title+l[lang].STIME_DESCRIPTION).replaceAll("{time}", secondsToHumanTime(lang, time) + " ("+time+" seconds)") 
        .replaceAll("{minimum}",secondsToHumanTime(lang, min)).replaceAll("{maximum}",secondsToHumanTime(lang, max)); //TODO : translate to human readable time

        GHbot.editMessageText(user.id, text, options)
        GHbot.answerCallbackQuery(user.id, cb.id);

    }

    return {time, user, updateUser};

}

/** 
 * @param  {import("../GHbot.js")} GHbot
 * @param  {customMessage} customMessage
 * @param  {TelegramBot.Message} msg
 * @param  {TelegramBot.Chat} chat
 * @param  {TelegramBot.User} user
 * @param  {String} cb_prefix
 * 
 * 
 * @return {Number}
 */
function messageEvent(GHbot, oldTime, msg, chat, user, cb_prefix, returnButtons, title, min, max)
{

    var l = global.LGHLangs;

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
            return oldTime;
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
