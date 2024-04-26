const TelegramBot = require("node-telegram-bot-api");
const {isNumber, genSetNumKeyboard} = require("./utils.js");

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
 * @return {Number}
 */
function callbackEvent(GHbot, db, currentNumber, cb, chat, user, cb_prefix, returnButtons, title, min, max)
{

    var l = global.LGHLangs;
    var number = currentNumber;

    title=title||"Number selector {number}";
    returnButtons=returnButtons||[];
    min = min || 1;
    max = max || 100;

    var msg = cb.message;

    var settingsChatId = cb.data.split(":")[1];

    if(!user.waitingReplyType.startsWith(cb_prefix+"#SNUM") || user.waitingReply != true)
    {
        user.waitingReply = true;
        user.waitingReplyType = cb_prefix+"#SNUM:"+settingsChatId;
        db.users.update(user);
    }

    if( cb.data.startsWith(cb_prefix+"#SNUM_MENU_N_") )
    {
        var newNumber = Number(cb.data.split(cb_prefix+"#SNUM_MENU_N_")[1].split(":")[0]);
        if(newNumber == number)
        {
            GHbot.answerCallbackQuery(user.id, cb.id);
            return -1;
        }
        number = newNumber;
    }
    if( cb.data.startsWith(cb_prefix+"#SNUM_MENU_INC") )
        ++number;
    if( cb.data.startsWith(cb_prefix+"#SNUM_MENU_DEC") )
        --number;

    if( cb.data.startsWith(cb_prefix+"#SNUM_MENU_WRITE") )
    {
        GHbot.answerCallbackQuery(user.id, cb.id, {text: l[user.lang].ASK_WRITE, show_alert:true});
        return -1;
    }
        
    title = title.replaceAll("{number}", number)

    if( cb.data.startsWith(cb_prefix+"#SNUM_MENU") )
    {

        var options = {
            message_id : msg.message_id,
            chat_id : chat.id,
            parse_mode : "HTML",
            reply_markup : {} 
        }

        var errorCb = {show_alert:true}

        options.reply_markup.inline_keyboard = genSetNumKeyboard(cb_prefix, settingsChatId);

        returnButtons.forEach(button => {
            options.reply_markup.inline_keyboard.push( button );
        })

        if(number > max && number != currentNumber)
        {
            number = currentNumber;
            errorCb.text = l[user.lang].SNUM_CB_TOOBIG.replace("{number}",max)
            GHbot.answerCallbackQuery(user.id, cb.id, errorCb);
        }
        else if(number < min && number != currentNumber)
        {
            number = currentNumber;
            errorCb.text = l[user.lang].SNUM_CB_TOOSMALL.replace("{number}",min)
            GHbot.answerCallbackQuery(user.id, cb.id, errorCb);
        }
        else
        {
            GHbot.editMessageText(user.id, title, options);
            GHbot.answerCallbackQuery(user.id, cb.id);
        }

    }

    return number;

}

/** 
 * @param  {import("../GHbot.js")} GHbot
 * @param  {customMessage} customMessage
 * @param  {TelegramBot.Message} msg
 * @param  {TelegramBot.Chat} chat
 * @param  {TelegramBot.User} user
 * @param  {String} cb_prefix
 * @param  {TelegramBot.KeyboardButton} returnButtons
 * @param  {String} title - custom title avaiable editing the message
 * @param  {Number} min - minimum allowed time in seconds
 * @param  {Number} max - maximum allowed time in seconds
 * 
 * @return {Number}
 */
function messageEvent(GHbot, currentNumber, msg, chat, user, cb_prefix, returnButtons, title, min, max)
{

    var l = global.LGHLangs;

    var settingsChatId = user.waitingReplyType.split(":")[1];
    var text = msg.text;
    var number = currentNumber
    min = min || 1;
    max = max || 100;

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
            inline_keyboard : [[{text: l[user.lang].BACK_BUTTON, callback_data: cb_prefix+"#SNUM_MENU:"+settingsChatId}]] 
        } 
    }

    options.reply_markup.inline_keyboard = genSetNumKeyboard(cb_prefix, settingsChatId);
    returnButtons.forEach(button => {
        options.reply_markup.inline_keyboard.push( button );
    })

    if( user.waitingReplyType.startsWith(cb_prefix+"#SNUM:") )
    {
        if(isNumber(text))
            number = Math.trunc(Number(text));
        else
        {
            GHbot.sendMessage(user.id, chat.id, l[user.lang].SNUM_INVALID_NUMBER, errorOpts);
            return -1;
        }


        if(number > max && number != currentNumber)
        {
            number = currentNumber;
            var errorText = l[user.lang].SNUM_TOOBIG.replace("{number}",max)
            GHbot.sendMessage(user.id, chat.id, errorText, errorOpts);
        }
        else if(number < min && number != currentNumber)
        {
            number = currentNumber;
            var errorText = l[user.lang].SNUM_TOOSMALL.replace("{number}",min)
            GHbot.sendMessage(user.id, chat.id, errorText, errorOpts);
        }
        else
        {
            title = title.replaceAll("{number}", number);
            GHbot.sendMessage(user.id, chat.id, title, options);
        }

        
    }

    return number;

}

module.exports = {
    callbackEvent : callbackEvent,
    messageEvent : messageEvent
}
