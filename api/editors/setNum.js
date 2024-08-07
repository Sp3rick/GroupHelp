const TelegramBot = require("node-telegram-bot-api");
const {isNumber, genSetNumKeyboard, waitReplyForChat, isUserWaitingReply} = require("../utils/utils.js");
const GH = require("../../GHbot.js");

/** 
 * @param  {GH} GHbot
 * @param {GH.LGHDatabase} db - database
 * @param  {customMessage} currentNumber
 * @param  {GH.LGHCallback} cb
 * @param  {GH.LGHChat} chat - selectedChat
 * @param  {GH.LGHUser} user
 * @param  {String} cb_prefix
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

    if(isUserWaitingReply(user, chat, cb.chat.isGroup))
    {
        var callback = cb_prefix+"#SNUM";
        waitReplyForChat(db, callback, user, chat, msg.chat.isGroup);
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
            chat_id : msg.chat.id,
            parse_mode : "HTML",
            reply_markup : {} 
        }

        var errorCb = {show_alert:true}

        options.reply_markup.inline_keyboard = genSetNumKeyboard(cb_prefix, chat.id);

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
 * @param  {GH} GHbot
 * @param  {customMessage} customMessage
 * @param  {GH.LGHMessage} msg
 * @param  {GH.LGHChat} chat - selectedChat
 * @param  {GH.LGHUser} user
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
            inline_keyboard : [[{text: l[user.lang].BACK_BUTTON, callback_data: cb_prefix+"#SNUM_MENU:"+chat.id}]] 
        } 
    }

    options.reply_markup.inline_keyboard = genSetNumKeyboard(cb_prefix, chat.id);
    returnButtons.forEach(button => {
        options.reply_markup.inline_keyboard.push( button );
    })

    if( msg.waitingReply.startsWith(cb_prefix+"#SNUM") )
    {
        if(isNumber(text))
            number = Math.trunc(Number(text));
        else
        {
            GHbot.sendMessage(user.id, msg.chat.id, l[user.lang].SNUM_INVALID_NUMBER, errorOpts);
            return -1;
        }


        if(number > max && number != currentNumber)
        {
            number = currentNumber;
            var errorText = l[user.lang].SNUM_TOOBIG.replace("{number}",max)
            GHbot.sendMessage(user.id, msg.chat.id, errorText, errorOpts);
        }
        else if(number < min && number != currentNumber)
        {
            number = currentNumber;
            var errorText = l[user.lang].SNUM_TOOSMALL.replace("{number}",min)
            GHbot.sendMessage(user.id, msg.chat.id, errorText, errorOpts);
        }
        else
        {
            title = title.replaceAll("{number}", number);
            GHbot.sendMessage(user.id, msg.chat.id, title, options);
        }

        
    }

    return number;

}

module.exports = {
    callbackEvent : callbackEvent,
    messageEvent : messageEvent
}
