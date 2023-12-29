const TelegramBot = require("node-telegram-bot-api");
const {parseTextToInlineKeyboard, isObject} = require("./utils.js");

/** 
 * @typedef {Object} MSGMK
 * @property {String} text - Text of messsage
 * @property {TelegramBot.MessageEntity} entities - Telegram entities of text
 * @property {Boolean} format - True if message should be formatted (enabled by default), mean that entities will be passed on sendMessage function
 * @property {String} buttons - Can me transformed in inline_keyboard with parseTextToInlineKeyboard()
 * @property {TelegramBot.KeyboardButton} buttonsParsed - Specified bot name (ex. "usernamebot")
 */
/** 
 * @typedef {Object} MessageMakerReturn
 * @property {MSGMK} MSGMK
 * @property {TelegramBot.User} user
 * @property {Boolean} updateMSGMK - If true means that MSGMK has changed
 * @property {Boolean} updateUser - If true means that user has changed
 */

/** 
 * @param  {TelegramBot} TGbot
 * @param  {MSGMK} MSGMK
 * @param  {TelegramBot.CallbackQuery} cb
 * @param  {TelegramBot.Chat} chat
 * @param  {TelegramBot.User} user
 * @param  {String} cb_prefix
 * @param  {String} title
 * @param  {TelegramBot.KeyboardButton} additionalButtons
 * 
 * 
 * @return {MessageMakerReturn}
 *         Parsed command object, false if is not a command
 */
function MessageMakerCallback(TGbot, MSGMK, cb, chat, user, cb_prefix, title, additionalButtons)
{

    var l = global.LGHLangs;

    var updateMSGMK=false;
    var updateUser=false;

    title=title||"Message Maker";
    additionalButtons=additionalButtons||[];

    var msg = cb.message;
    var lang = user.lang;

    var settingsChatId = cb.data.split(":")[1];

    /// Deletions And Base
    if( cb.data.startsWith(cb_prefix+"_MKMSG_TEXT_DEL:") &&  MSGMK.hasOwnProperty("text") )
    {

        delete MSGMK.text;
        delete MSGMK.entities;
        updateMSGMK=true;

    }
    if( cb.data.startsWith(cb_prefix+"_MKMSG_BUTTONS_DEL:") &&  MSGMK.hasOwnProperty("buttons") )
    {

        delete MSGMK.buttons;
        delete MSGMK.buttonsParsed;
        updateMSGMK=true;

    }
    if( cb.data.startsWith(cb_prefix+"_MKMSG:") || cb.data.startsWith(cb_prefix+"_MKMSG_TEXT_DEL:") || cb.data.startsWith(cb_prefix+"_MKMSG_BUTTONS_DEL:") )
    {

        if( user.waitingReply )
        {
            user.waitingReply = false;
            updateUser=true;
        }

        var hasText = MSGMK.hasOwnProperty("text");
        var hasMedia = MSGMK.hasOwnProperty("media");
        var hasButtons = MSGMK.hasOwnProperty("buttons");

        var text = title+"\n\n"+
        l[lang].TEXT_BUTTON + (hasText ? " ✅" : " ❌") +"\n"+
        l[lang].S_MEDIA_BUTTON + (hasMedia ? " ✅" : " ❌") +"\n"+
        l[lang].URLBUTTONS_BUTTON + (hasButtons ? " ✅" : " ❌") +"\n\n"+ 
        l[lang].CHANGE_RULES_ADV;

        var options = {
            message_id : msg.message_id,
            chat_id : chat.id,
            parse_mode : "HTML",
            reply_markup : 
            {
                inline_keyboard :
                [
                    [{text: l[lang].TEXT_BUTTON, callback_data: cb_prefix+"_MKMSG_TEXT:"+settingsChatId},
                    {text: l[lang].SEE_BUTTON, callback_data: cb_prefix+"_MKMSG_TEXT_SEE:"+settingsChatId}],

                    [{text: l[lang].S_MEDIA_BUTTON, callback_data: cb_prefix+"_MKMSG_MEDIA:"+settingsChatId},
                    {text: l[lang].SEE_BUTTON, callback_data: cb_prefix+"_MKMSG_MEDIA_SEE:"+settingsChatId}],

                    [{text: l[lang].URLBUTTONS_BUTTON, callback_data: cb_prefix+"_MKMSG_BUTTONS:"+settingsChatId},
                    {text: l[lang].SEE_BUTTON, callback_data: cb_prefix+"_MKMSG_BUTTONS_SEE:"+settingsChatId}],

                    [{text: l[lang].SEE_WHOLE_MESSAGE, callback_data: cb_prefix+"_MKMSG_SEE:"+settingsChatId}]
                ] 
            } 
        }

        additionalButtons.forEach(button => {
            options.reply_markup.inline_keyboard.push( button );
        });
    
        TGbot.editMessageText(text, options)
        TGbot.answerCallbackQuery(cb.id);

    }

    ///TEXT related
    if( cb.data.startsWith(cb_prefix+"_MKMSG_TEXT:") )
    {

        user.waitingReply = true;
        user.waitingReplyType = cb_prefix+"_MKMSG_TEXT:"+settingsChatId;
        updateUser=true;

        TGbot.editMessageText( l[lang].SET_MESSAGE_ADV, 
            {
                message_id : msg.message_id,
                chat_id : chat.id,
                parse_mode : "HTML",
                reply_markup : 
                {
                    inline_keyboard :
                    [
                        [{text: l[lang].REMOVE_MESSAGE_BUTTON, callback_data: cb_prefix+"_MKMSG_TEXT_DEL:"+settingsChatId}],
                        [{text: l[lang].CANCEL_BUTTON, callback_data: cb_prefix+"_MKMSG:"+settingsChatId}],
                    ] 
                } 
            }
        )
        TGbot.answerCallbackQuery(cb.id);

    }
    if( cb.data.startsWith(cb_prefix+"_MKMSG_TEXT_SWITCH:") ){
        MSGMK.format = !MSGMK.format;
        updateMSGMK=true;
    }
    if( cb.data.startsWith(cb_prefix+"_MKMSG_TEXT_SEE:") || cb.data.startsWith(cb_prefix+"_MKMSG_TEXT_SWITCH:") )
    {

        if( !MSGMK.hasOwnProperty("text") )
        {

            TGbot.answerCallbackQuery(cb.id, {text: l[lang].MISSING_MESSAGE_ERROR, show_alert: true})
            return {MSGMK, user, updateMSGMK, updateUser};

        }

        var options = {
            message_id : msg.message_id,
            chat_id : chat.id,
            reply_markup : 
            {
                inline_keyboard :
                [
                    [{text: l[lang].BACK_BUTTON, callback_data: cb_prefix+"_MKMSG:"+settingsChatId}],
                ] 
            } 
        }

        if(MSGMK.format)
        {
            if(MSGMK.hasOwnProperty("entities"))
                options.entities = MSGMK.entities;

            options.reply_markup.inline_keyboard.unshift([{text: l[lang].ENTITIES_FORMAT, callback_data: cb_prefix+"_MKMSG_TEXT_SWITCH:"+settingsChatId}])
        }
        else
        {
            options.parse_mode = "HTML"; 
            options.reply_markup.inline_keyboard.unshift([{text: l[lang].HTML_FORMAT, callback_data: cb_prefix+"_MKMSG_TEXT_SWITCH:"+settingsChatId}])
        }               

    

        TGbot.editMessageText(MSGMK.text, options)
        TGbot.answerCallbackQuery(cb.id);


    }

    ///BUTTONS related
    if( cb.data.startsWith(cb_prefix+"_MKMSG_BUTTONS:") )
    {

        user.waitingReply = true;
        user.waitingReplyType = cb_prefix+"_MKMSG_BUTTONS:"+settingsChatId;
        updateUser=true;

        TGbot.editMessageText( l[lang].SET_BUTTONS_ADV, 
            {
                message_id : msg.message_id,
                chat_id : chat.id,
                parse_mode : "HTML",
                reply_markup : 
                {
                    inline_keyboard :
                    [
                        [{text: l[lang].REMOVE_MESSAGE_BUTTON, callback_data: cb_prefix+"_MKMSG_BUTTONS_DEL:"+settingsChatId}],
                        [{text: l[lang].CANCEL_BUTTON, callback_data: cb_prefix+"_MKMSG:"+settingsChatId}],
                    ] 
                } 
            }
        )
        TGbot.answerCallbackQuery(cb.id);

    }
    if( cb.data.startsWith("S_RULES_MKMSG_BUTTONS_SEE:") )
    {

        if( !MSGMK.hasOwnProperty("buttons") )
        {

            TGbot.answerCallbackQuery(cb.id, {text: l[lang].MISSING_BUTTONS_ERROR, show_alert: true})
            return {MSGMK, user, updateMSGMK, updateUser};;

        }

        var options = {
            message_id : msg.message_id,
            chat_id : chat.id,
            parse_mode : "HTML",
            reply_markup : 
            {
                inline_keyboard : []
            } 
        }

        options.reply_markup.inline_keyboard = MSGMK.buttonsParsed; 

        options.reply_markup.inline_keyboard.push([{text: l[lang].BACK_BUTTON, callback_data: "S_RULES_MKMSG:"+settingsChatId}])

        TGbot.editMessageText("<code>"+MSGMK.buttons+"</code>", options)
        TGbot.answerCallbackQuery(cb.id);


    }

    ///See only
    if( cb.data.startsWith(cb_prefix+"_MKMSG_SEE:") )
    {

        console.log("bruh")

        TGbot.deleteMessage(chat.id, msg.message_id);
        MessageMakerSendMessage(TGbot, chat.id, MSGMK, lang).then( () => {

            TGbot.sendMessage(chat.id, "➖➖➖➖➖➖➖➖➖➖", {
                reply_markup: {inline_keyboard: [[{text: l[lang].BACK_BUTTON, callback_data: cb_prefix+"_MKMSG:"+settingsChatId}]]}
            })

        } )
        //TGbot.answerCallbackQuery(cb.id);
        
    }


    return {MSGMK, user, updateMSGMK, updateUser}

}

/** 
 * @param  {TelegramBot} TGbot
 * @param  {MSGMK} MSGMK
 * @param  {TelegramBot.Message} msg
 * @param  {TelegramBot.Chat} chat
 * @param  {TelegramBot.User} user
 * @param  {String} cb_prefix
 * 
 * 
 * @return {MessageMakerReturn}
 *         Parsed command object, false if is not a command
 */
function MessageMakerMSG(TGbot, MSGMK, msg, chat, user, cb_prefix)
{

    var l = global.LGHLangs;

    var updateUser=false;
    var updateMSGMK=false;

    var settingsChatId = user.waitingReplyType.split(":")[1];

    var options = {
        parse_mode : "HTML",
        reply_markup : 
        {
            inline_keyboard :
            [
                [{text: l[user.lang].BACK_BUTTON, callback_data: "S_RULES_MKMSG:"+settingsChatId}],
            ] 
        } 
    }

    if( user.waitingReplyType.startsWith(cb_prefix+"_MKMSG_TEXT:") )
        {

            if( !msg.hasOwnProperty("text") )
            {

                TGbot.sendMessage( chat.id, l[user.lang].PARSING_ERROR_TEXT, options)
                return {MSGMK, user, updateMSGMK, updateUser};

            }

            MSGMK.text = msg.text;
            MSGMK.format = true;
            if(MSGMK.hasOwnProperty("entities")) delete MSGMK.entities; //delete old entities
            if(msg.hasOwnProperty("entities")) MSGMK.entities = msg.entities;
            updateMSGMK=true

            user.waitingReply = false;
            updateUser=true;

            TGbot.sendMessage( chat.id, l[user.lang].MESSAGE_SET_BUTTON, options )


    }

    if( user.waitingReplyType.startsWith(cb_prefix+"_MKMSG_BUTTONS:") )
    {

        if( !msg.hasOwnProperty("text") )
        {

            TGbot.sendMessage( chat.id, l[user.lang].PARSING_ERROR_TEXT, options )
            return {MSGMK, user, updateMSGMK, updateUser};

        }

        var keyboard = parseTextToInlineKeyboard(msg.text); console.log(JSON.stringify(keyboard));

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
            TGbot.sendMessage( chat.id, text, options);
            return {MSGMK, user, updateMSGMK, updateUser};

        }

        MSGMK.buttonsParsed = keyboard;
        MSGMK.buttons = msg.text;
        updateMSGMK=true;

        user.waitingReply = false;
        updateUser=true;

        TGbot.sendMessage( chat.id, l[user.lang].BUTTONS_SET_BUTTON, options)

    }

    return {MSGMK, user, updateMSGMK, updateUser};

}

/** 
 * @param  {TelegramBot} TGbot
 * @param  {TelegramBot.ChatId} chatId
 * @param  {MSGMK} MSGMK
 * @param  {String} lang 
 * @param  {TelegramBot.SendMessageOptions} additionalOptions 
 * 
 * @return {Promise<TelegramBot.Message>}
 *         Parsed command object, false if is not a command
 */
function MessageMakerSendMessage(TGbot, chatId, MSGMK, lang, additionalOptions)
{

    additionalOptions=additionalOptions||{};

    var options = {reply_markup:{}};

    var text = l[lang].RULES_TITLE+"\n\n";

    if(MSGMK.format && MSGMK.hasOwnProperty("entities"))
    {
        options.entities = MSGMK.entities;

        for(var i=0; i < options.entities.length; i++)
            options.entities[i].offset += text.length;

        options.entities.unshift({offset: 0, length: text.length, type: "bold" })

        text += MSGMK.text;
    }
    else
    {
        options.parse_mode = "HTML";
        text = "<b>"+text+"</b>"+(MSGMK.text||"");
    }

    options.reply_markup.inline_keyboard = MSGMK.buttonsParsed;

    options = Object.assign( {}, options, additionalOptions )
    
    return TGbot.sendMessage( chatId, text, options );

}

module.exports = {

    MessageMakerCallback : MessageMakerCallback,
    MessageMakerMSG : MessageMakerMSG,
    MessageMakerSendMessage : MessageMakerSendMessage,
    MessageMakerSendMessage : MessageMakerSendMessage

}
