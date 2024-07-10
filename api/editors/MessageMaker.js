const TelegramBot = require("node-telegram-bot-api");
const {parseTextToInlineKeyboard, isObject, extractMedia, mediaTypeToMethod, code, bold, validateTelegramHTML, waitReplyForChat, unsetWaitReply} = require("../utils/utils.js");
const { pushUserRequest } = require("../tg/SafeTelegram.js");
const { substitute } = require("../utils/substitutor.js");
const GH = require("../../GHbot.js");

/** 
 * @typedef {Object} simpleMedia
 * @property {String} type - Type of media (audio, photo, video, video_note, animation, sticker, document) or false
 * @property {TelegramBot.File} fileId - media fileId or false
 * @property {TelegramBot.FileOptions} options - additional options for TelegramBot
 */

/** 
 * @typedef {Object} customMessage
 * @property {String|undefined} text - Text of messsage
 * @property {TelegramBot.MessageEntity} entities - Telegram entities of text
 * @property {Boolean} format - True if message should be formatted (enabled by default), mean that entities will be passed on sendMessage function
 * @property {simpleMedia|undefined} media
 * @property {String|undefined} buttons - Can be transformed in inline_keyboard with parseTextToInlineKeyboard()
 * @property {TelegramBot.KeyboardButton} buttonsParsed - Ready to use buttons already parsed for telegram
 */

/** 
 * @param  {GH} GHbot
 * @param {GH.LGHDatabase} db - database
 * @param  {customMessage} customMessage - MessageMaker object
 * @param  {GH.LGHCallback} cb
 * @param  {GH.LGHChat} chat - selectedChat
 * @param  {GH.LGHUser} user
 * @param  {String} cb_prefix
 * @param  {TelegramBot.KeyboardButton} returnButtons
 * @param  {String} title - custom title avaiable editing the message
 * @param  {String} messageTitle - title for when message is sent as entire (here for test)
 * 
 * @return {customMessage|false} - returns new customMessage, false if unchanged
 */
function callbackEvent(GHbot, db, customMessage, cb, chat, user, cb_prefix, returnButtons, title, messageTitle)
{

    var l = global.LGHLangs;
    var TGbot = GHbot.TGbot;

    var updateMSGMK=false;

    title=title||"Message Maker";
    messageTitle=messageTitle||false;
    returnButtons=returnButtons||[];

    var msg = cb.message;
    var lang = user.lang;

    /// Deletions
    if( cb.data.startsWith(cb_prefix+"#MSGMK_TEXT_DEL:") &&  customMessage.hasOwnProperty("text") )
    {

        delete customMessage.text;
        delete customMessage.entities;
        updateMSGMK=true;

    }
    if( cb.data.startsWith(cb_prefix+"#MSGMK_BUTTONS_DEL:") &&  customMessage.hasOwnProperty("buttons") )
    {

        delete customMessage.buttons;
        delete customMessage.buttonsParsed;
        updateMSGMK=true;

    }
    if( cb.data.startsWith(cb_prefix+"#MSGMK_MEDIA_DEL:") &&  customMessage.hasOwnProperty("media") )
    {

        delete customMessage.media;
        updateMSGMK=true;

    }

    // Base panel OR deletion return
    if( cb.data.startsWith(cb_prefix+"#MSGMK:") || cb.data.startsWith(cb_prefix+"#MSGMK_RESET-RETURN:") ||
    cb.data.startsWith(cb_prefix+"#MSGMK_TEXT_DEL:") || cb.data.startsWith(cb_prefix+"#MSGMK_BUTTONS_DEL:") || cb.data.startsWith(cb_prefix+"#MSGMK_MEDIA_DEL:") )
    {

        if( msg.waitingReply ) unsetWaitReply(db, user, chat, msg.chat.isGroup);

        var hasText = customMessage.hasOwnProperty("text");
        var hasMedia = customMessage.hasOwnProperty("media");
        var hasButtons = customMessage.hasOwnProperty("buttons");

        var text = title+"\n\n"+
        l[lang].TEXT_BUTTON + (hasText ? " ✅" : " ❌") +"\n"+
        l[lang].S_MEDIA_BUTTON + (hasMedia ? " ✅" : " ❌") +"\n"+
        l[lang].URLBUTTONS_BUTTON + (hasButtons ? " ✅" : " ❌") +"\n\n"+ 
        l[lang].CHANGE_RULES_ADV;

        var options = {
            message_id : msg.message_id,
            chat_id : msg.chat.id,
            parse_mode : "HTML",
            reply_markup : 
            {
                inline_keyboard :
                [
                    [{text: l[lang].TEXT_BUTTON, callback_data: cb_prefix+"#MSGMK_TEXT:"+chat.id},
                    {text: l[lang].SEE_BUTTON, callback_data: cb_prefix+"#MSGMK_TEXT_SEE:"+chat.id}],

                    [{text: l[lang].S_MEDIA_BUTTON, callback_data: cb_prefix+"#MSGMK_MEDIA:"+chat.id},
                    {text: l[lang].SEE_BUTTON, callback_data: cb_prefix+"#MSGMK_MEDIA_SEE:"+chat.id}],

                    [{text: l[lang].URLBUTTONS_BUTTON, callback_data: cb_prefix+"#MSGMK_BUTTONS:"+chat.id},
                    {text: l[lang].SEE_BUTTON, callback_data: cb_prefix+"#MSGMK_BUTTONS_SEE:"+chat.id}],

                    [{text: l[lang].SEE_WHOLE_MESSAGE, callback_data: cb_prefix+"#MSGMK_SEE:"+chat.id}]
                ] 
            } 
        }

        returnButtons.forEach(button => {
            options.reply_markup.inline_keyboard.push( button );
        });

        //this is to move from media -> text only panel
        if( cb.data.startsWith(cb_prefix+"#MSGMK_RESET-RETURN:") )
        {
            GHbot.sendMessage(user.id, msg.chat.id, text, options);
            TGbot.deleteMessages(msg.chat.id, [cb.message.message_id]);

            return false;
        }
    
        GHbot.editMessageText(user.id, text, options)
        GHbot.answerCallbackQuery(user.id, cb.id);

    }

    ///TEXT related
    if( cb.data.startsWith(cb_prefix+"#MSGMK_TEXT:") )
    {


        var callback = cb_prefix+"#MSGMK_TEXT:"+chat.id;
        waitReplyForChat(db, callback, user, chat, msg.chat.isGroup);

        GHbot.editMessageText(user.id, l[lang].SET_MESSAGE_ADV, 
            {
                message_id : msg.message_id,
                chat_id : msg.chat.id,
                parse_mode : "HTML",
                reply_markup : 
                {
                    inline_keyboard :
                    [
                        [{text: l[lang].REMOVE_MESSAGE_BUTTON, callback_data: cb_prefix+"#MSGMK_TEXT_DEL:"+chat.id}],
                        [{text: l[lang].CANCEL_BUTTON, callback_data: cb_prefix+"#MSGMK:"+chat.id}],
                    ] 
                } 
            }
        )
        GHbot.answerCallbackQuery(user.id, cb.id);

    }
    if( cb.data.startsWith(cb_prefix+"#MSGMK_TEXT_SWITCH:") ){
        customMessage.format = !customMessage.format;
        updateMSGMK=true;
    }
    if( cb.data.startsWith(cb_prefix+"#MSGMK_TEXT_SEE:") || cb.data.startsWith(cb_prefix+"#MSGMK_TEXT_SWITCH:") )
    {

        if( !customMessage.hasOwnProperty("text") )
        {

            GHbot.answerCallbackQuery(user.id, cb.id, {text: l[lang].MISSING_MESSAGE_ERROR, show_alert: true})
            return false;

        }

        var options = {
            message_id : msg.message_id,
            chat_id : msg.chat.id,
            reply_markup : 
            {
                inline_keyboard :
                [
                    [{text: l[lang].BACK_BUTTON, callback_data: cb_prefix+"#MSGMK:"+chat.id}],
                ] 
            } 
        }

        if(customMessage.format)
        {
            if(customMessage.hasOwnProperty("entities"))
                options.entities = customMessage.entities;

            options.reply_markup.inline_keyboard.unshift([{text: l[lang].ENTITIES_FORMAT, callback_data: cb_prefix+"#MSGMK_TEXT_SWITCH:"+chat.id}])
        }
        else
        {
            options.parse_mode = "HTML"; 
            options.reply_markup.inline_keyboard.unshift([{text: l[lang].HTML_FORMAT, callback_data: cb_prefix+"#MSGMK_TEXT_SWITCH:"+chat.id}])
        }               

    

        GHbot.editMessageText(user.id, customMessage.text, options)
        GHbot.answerCallbackQuery(user.id, cb.id);


    }

    //MEDIA related
    if( cb.data.startsWith(cb_prefix+"#MSGMK_MEDIA:") )
    {

        var callback = cb_prefix+"#MSGMK_MEDIA:"+chat.id;
        waitReplyForChat(db, callback, user, chat, msg.chat.isGroup);

        GHbot.editMessageText(user.id, l[lang].SET_MEDIA_ADV, 
            {
                message_id : msg.message_id,
                chat_id : msg.chat.id,
                parse_mode : "HTML",
                reply_markup : 
                {
                    inline_keyboard :
                    [
                        [{text: l[lang].REMOVE_MEDIA_BUTTON, callback_data: cb_prefix+"#MSGMK_MEDIA_DEL:"+chat.id}],
                        [{text: l[lang].CANCEL_BUTTON, callback_data: cb_prefix+"#MSGMK:"+chat.id}],
                    ] 
                } 
            }
        )
        GHbot.answerCallbackQuery(user.id, cb.id);

    }
    if( cb.data.startsWith(cb_prefix+"#MSGMK_MEDIA_SEE:") )
    {

        if( !customMessage.hasOwnProperty("media") )
        {

            GHbot.answerCallbackQuery(user.id, cb.id, {text: l[lang].MISSING_MEDIA_ERROR, show_alert: true})
            return {customMessage, user, updateMSGMK};

        }

        var options = {
            message_id : msg.message_id,
            chat_id : msg.chat.id,
            reply_markup : 
            {
                inline_keyboard :
                [
                    [{text: l[lang].BACK_BUTTON, callback_data: cb_prefix+"#MSGMK_RESET-RETURN:"+chat.id}],
                ] 
            } 
        }
        options = Object.assign( {}, options, customMessage.media.options );

        var method = mediaTypeToMethod(customMessage.media.type)

        pushUserRequest(TGbot, method, user.id, msg.chat.id, customMessage.media.fileId, options);
        TGbot.deleteMessages(msg.chat.id, [msg.message_id]);

        GHbot.answerCallbackQuery(user.id, cb.id);


    }

    ///BUTTONS related
    if( cb.data.startsWith(cb_prefix+"#MSGMK_BUTTONS:") )
    {

        var callback = cb_prefix+"#MSGMK_BUTTONS:"+chat.id;
        waitReplyForChat(db, callback, user, chat, msg.chat.isGroup);

        GHbot.editMessageText(user.id, l[lang].SET_BUTTONS_ADV, 
            {
                message_id : msg.message_id,
                chat_id : msg.chat.id,
                parse_mode : "HTML",
                reply_markup : 
                {
                    inline_keyboard :
                    [
                        [{text: l[lang].REMOVE_MESSAGE_BUTTON, callback_data: cb_prefix+"#MSGMK_BUTTONS_DEL:"+chat.id}],
                        [{text: l[lang].CANCEL_BUTTON, callback_data: cb_prefix+"#MSGMK:"+chat.id}],
                    ] 
                } 
            }
        )
        GHbot.answerCallbackQuery(user.id, cb.id);

    }
    if( cb.data.startsWith(cb_prefix+"#MSGMK_BUTTONS_SEE:") )
    {

        if( !customMessage.hasOwnProperty("buttons") )
        {

            GHbot.answerCallbackQuery(user.id, cb.id, {text: l[lang].MISSING_BUTTONS_ERROR, show_alert: true})
            return false;

        }

        var options = {
            message_id : msg.message_id,
            chat_id : msg.chat.id,
            parse_mode : "HTML",
            reply_markup : 
            {
                inline_keyboard : []
            } 
        }

        options.reply_markup.inline_keyboard = JSON.parse(JSON.stringify(customMessage.buttonsParsed)); 

        options.reply_markup.inline_keyboard.push([{text: l[lang].BACK_BUTTON, callback_data: cb_prefix+"#MSGMK:"+chat.id}])

        GHbot.editMessageText(user.id, code(customMessage.buttons), options)
        GHbot.answerCallbackQuery(user.id, cb.id);


    }

    ///See entire message
    if( cb.data.startsWith(cb_prefix+"#MSGMK_SEE:") )
    {

        TGbot.deleteMessages(msg.chat.id, [msg.message_id]);
        sendMessage(GHbot, user, chat, customMessage, messageTitle, {}, msg.chat.id).then( () => {

            GHbot.sendMessage(user.id, msg.chat.id, "➖➖➖➖➖➖➖➖➖➖", {
                reply_markup: {inline_keyboard: [[{text: l[lang].BACK_BUTTON, callback_data: cb_prefix+"#MSGMK:"+chat.id}]]}
            })

        } )
        
    }


    if(updateMSGMK) return customMessage;
    return false;

}

/** 
 * @param  {GH} GHbot
 * @param {GH.LGHDatabase} db - database
 * @param  {customMessage} customMessage - MessageMaker object
 * @param  {GH.LGHMessage} msg
 * @param  {GH.LGHChat} chat - selectedChat
 * @param  {GH.LGHUser} user
 * @param  {String} cb_prefix
 * 
 * @return {customMessage|false}
 */
async function messageEvent(GHbot, db, customMessage, msg, chat, user, cb_prefix)
{

    var l = global.LGHLangs;


    var updateMSGMK=false;

    var options = {
        parse_mode : "HTML",
        reply_markup : 
        {
            inline_keyboard :
            [
                [{text: l[user.lang].BACK_BUTTON, callback_data: cb_prefix+"#MSGMK:"+chat.id}],
            ] 
        } 
    }

    if( msg.waitingReply.startsWith(cb_prefix+"#MSGMK_TEXT") )
    {

        if( !msg.hasOwnProperty("text") || !(await validateTelegramHTML(GHbot, user.id, msg.chat.id, msg.text)))
        {
            GHbot.sendMessage(user.id, msg.chat.id, l[user.lang].PARSING_ERROR_TEXT, options)
            return false;
        }

        customMessage.text = msg.text;
        customMessage.format = true;
        if(customMessage.hasOwnProperty("entities")) delete customMessage.entities; //delete old entities
        if(msg.hasOwnProperty("entities")) customMessage.entities = msg.entities;
        updateMSGMK=true

        unsetWaitReply(db, user, chat, msg.chat.isGroup);
        GHbot.sendMessage(user.id, msg.chat.id, l[user.lang].MESSAGE_SET_BUTTON, options )


    }

    if( msg.waitingReply.startsWith(cb_prefix+"#MSGMK_MEDIA") )
    {

        var media = extractMedia(msg);
        if(!media.type)
        {
            GHbot.sendMessage(user.id, msg.chat.id, l[user.lang].MEDIA_INCORRECT, options )
            return false;
        }
        
        if( msg.hasOwnProperty("caption") && await validateTelegramHTML(GHbot, user.id, msg.chat.id, msg.caption))
        {
            if(customMessage.hasOwnProperty("entities")) delete customMessage.entities; //delete old entities
            customMessage.text = msg.caption;
        }
        if(msg.hasOwnProperty("caption_entities"))
        {
            customMessage.entities = msg.caption_entities;
            customMessage.format = true;
        }

        customMessage.media = media;
        updateMSGMK=true

        unsetWaitReply(db, user, chat, msg.chat.isGroup);

        GHbot.sendMessage(user.id, msg.chat.id, l[user.lang].MEDIA_SET_BUTTON, options )

    }

    if( msg.waitingReply.startsWith(cb_prefix+"#MSGMK_BUTTONS") )
    {

        if( !msg.hasOwnProperty("text") )
        {

            GHbot.sendMessage(user.id, msg.chat.id, l[user.lang].PARSING_ERROR_TEXT, options )
            return false;

        }

        var keyboard = parseTextToInlineKeyboard(msg.text);

        if( isObject(keyboard) && keyboard.hasOwnProperty("error") )
        {

            var text = "";

            switch(keyboard.error)
            {

                case "ROWS_LIMIT": text=l[user.lang].BUTTONS_ROWS_LIMIT; break;
                case "CULUMNS_LIMIT": text=l[user.lang].BUTTONS_CULUMNS_LIMIT; break;
                case "TOTAL_LIMIT": text=l[user.lang].BUTTONS_TOTAL_LIMIT; break;
                case "MISSING_LINK": text=l[user.lang].BUTTONS_MISSING_LINK; break;
                case "NAME_LIMIT": text=l[user.lang].BUTTONS_NAME_LIMIT; break;
                case "NAME_TOO_SHORT": text=l[user.lang].BUTTONS_NAME_TOO_SHORT; break;
                case "INVALID_LINK": text=l[user.lang].BUTTONS_INVALID_LINK; break;
                default: text=l[user.lang].PARSING_ERROR;

            }


            text = text +"\n\n"+l[user.lang].ADV_REPORT_ISSUE+"\n\n<b>Row: "+keyboard.row+"\nCulumn: "+keyboard.culumn+"</b>";

            options.disable_web_page_preview = true;
            GHbot.sendMessage(user.id, msg.chat.id, text, options);
            return false;

        }

        customMessage.buttonsParsed = keyboard;
        customMessage.buttons = msg.text;
        updateMSGMK=true;

        unsetWaitReply(db, user, chat, msg.chat.isGroup);

        GHbot.sendMessage(user.id, msg.chat.id, l[user.lang].BUTTONS_SET_BUTTON, options)

    }

    if(customMessage) return customMessage
    return false;

}

/** 
 * @param  {GH} GHbot
 * @param {GH.LGHChat} user - LGHUser object
 * @param  {GH.LGHUser} chat - LGHChat object
 * @param  {customMessage} customMessage - MessageMaker object
 * @param  {String} messageTitle - title for sent message
 * @param  {TelegramBot.SendMessageOptions} additionalOptions - Additional options for telegram
 * @param  {TelegramBot.ChatId} sendId - set a specific chat to message (default on chat.id)
 * 
 * @return {Promise<TelegramBot.Message>}
 *         Telegram message object, false is message is not sent
 */
function sendMessage(GHbot, user, chat, customMessage, messageTitle, additionalOptions, sendId)
{
    var userId = user.id;
    var chatId = chat.id;
    var sendId = sendId || chatId;

    additionalOptions=additionalOptions||{};

    var options = {reply_markup:{}};
    var TGbot = GHbot.TGbot;
    
    var text = "";
    if(messageTitle !== false)
        text = messageTitle ? messageTitle+"\n\n" : "CustomMessage\n\n";

    if(customMessage.format && customMessage.hasOwnProperty("entities"))
    {
        options.entities = JSON.parse(JSON.stringify(customMessage.entities));
        for(var i=0; i < options.entities.length; i++)
            options.entities[i].offset += text.length;
        options.entities.unshift({offset: 0, length: text.length, type: "bold"})
        text += customMessage.text;
    }
    else if(customMessage.format && !customMessage.hasOwnProperty("entities"))
    {
        options.entities = [{offset: 0, length: text.length, type: "bold" }];
        text += customMessage.text;
    }
    else if(!customMessage.format)
    {
        options.parse_mode = "HTML";
        text = "<b>"+text+"</b>"+customMessage.text;
    }


    options.reply_markup.inline_keyboard = customMessage.buttonsParsed;
    options = Object.assign( {}, options, additionalOptions )

    text = substitute(text, user, chat);
    
    //send
    if(customMessage.media)
    {
        var method = mediaTypeToMethod(customMessage.media.type);
        options = Object.assign( {}, options, customMessage.media.options );
        if(text.length != 0) options.caption = text;
        if(options.hasOwnProperty("entities"))
            options.caption_entities = JSON.stringify(options.entities);
        return pushUserRequest(TGbot, method, userId, sendId, customMessage.media.fileId, options);
    }
    if(!customMessage.hasOwnProperty("text"))
        return GHbot.sendMessage( userId, sendId, bold(messageTitle), {parse_mode:"HTML"} );;
    return GHbot.sendMessage( userId, sendId, text, options );

}

/**
 * @param {customMessage} customMessage 
 * @returns {Boolean}
 */
function isEmpty(customMessage)
{
    var hasText = customMessage.hasOwnProperty("text");
    var hasMedia = customMessage.hasOwnProperty("media");

    return (hasText || hasMedia)
}

module.exports = {

    callbackEvent : callbackEvent,
    messageEvent : messageEvent,
    sendMessage : sendMessage,
    isEmpty : isEmpty,
}
