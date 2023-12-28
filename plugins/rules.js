var LGHelpTemplate = require("../GHbot.js")
const {IsEqualInsideAnyLanguage, isAdminOfChat, parseTextToInlineKeyboard, isObject} = require( "../api/utils.js" );

function main(args)
{

    var {GHbot, TGbot, db, config} = new LGHelpTemplate(args);

    l = global.LGHLangs; //importing langs object

    GHbot.on( "message", (msg, chat, user) => {

        var command = msg.command;

        if ( chat.isGroup ){

            if( command && IsEqualInsideAnyLanguage(command.name, "COMMAND_RULES") )
            {
                var options = {reply_markup:{}};

                var text = l[chat.lang].RULES_TITLE+"\n\n";

                if(chat.rules.format && chat.rules.hasOwnProperty("entities"))
                {
                    options.entities = chat.rules.entities;

                    for(var i=0; i < options.entities.length; i++)
                        options.entities[i].offset += text.length;

                    options.entities.unshift({offset: 0, length: text.length, type: "bold" })

                    text += chat.rules.text;
                }
                else
                {
                    options.parse_mode = "HTML";
                    text = "<b>"+text+"</b>"+(chat.rules.text||"");
                }

                options.reply_markup.inline_keyboard = chat.rules.buttonsParsed; 
                
                TGbot.sendMessage( chat.id, text, options )

            }

        }


        if( !user.waitingReply ) return;
        if( !user.waitingReplyType.startsWith("S_RULES") ) return;

        var settingsChatId = user.waitingReplyType.split(":")[1];
        if( chat.isGroup && settingsChatId != chat.id ) return;//additional security guard
        var settingsChat = db.chats.get(settingsChatId)

        if( !isAdminOfChat(settingsChat, user.id) ) return;

        var options = {
            parse_mode : "HTML",
            reply_markup : 
            {
                inline_keyboard :
                [
                    [{text: l[user.lang].BACK_BUTTON, callback_data: "S_RULES_CHANGE_BUTTON:"+settingsChatId}],
                ] 
            } 
        }

        if( user.waitingReplyType.startsWith("S_RULES_TEXT_BUTTON:") )
        {

            if( !msg.hasOwnProperty("text") )
            {

                TGbot.sendMessage( chat.id, l[user.lang].PARSING_ERROR_TEXT, options)
                return;

            }

            settingsChat.rules.text = msg.text;
            settingsChat.rules.format = true;
            if(settingsChat.rules.hasOwnProperty("entities")) delete settingsChat.rules.entities; //delete old entities
            if(msg.hasOwnProperty("entities")) settingsChat.rules.entities = msg.entities;
            db.chats.update( settingsChat );

            user.waitingReply = false;
            db.users.update( user );

            TGbot.sendMessage( chat.id, l[user.lang].MESSAGE_SET_BUTTON, options )


        }

        if( user.waitingReplyType.startsWith("S_RULES_BUTTONS_BUTTON:") )
        {

            if( !msg.hasOwnProperty("text") )
            {

                TGbot.sendMessage( chat.id, l[user.lang].PARSING_ERROR_TEXT, options )
                return;

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
                return;

            }

            settingsChat.rules.buttonsParsed = keyboard;
            settingsChat.rules.buttons = msg.text;
            db.chats.update(settingsChat)

            user.waitingReply = false;
            db.users.update(user);

            TGbot.sendMessage( chat.id, l[user.lang].BUTTONS_SET_BUTTON, options)

        }
        
        

    } )


    GHbot.on( "callback_query", (cb, chat, user) => {

        var msg = cb.message;
        var lang = user.lang;

        var settingsChatId = {};
        var settingsChat = {};

        if( cb.data.startsWith("S_RULES") )
        {

            settingsChatId = cb.data.split(":")[1]
            settingsChat = db.chats.get(settingsChatId)

        }

        if( cb.data.startsWith("S_RULES_BUTTON:") )
        {
        
            TGbot.editMessageText( l[lang].RULES_SETTING, 
                {
                    message_id : msg.message_id,
                    chat_id : chat.id,
                    parse_mode : "HTML",
                    reply_markup : 
                    {
                        inline_keyboard :
                        [
                            [{text: l[lang].RULES_CHANGE_BUTTON, callback_data: "S_RULES_CHANGE_BUTTON:"+settingsChatId}],
                            //TODO: when it's done, add button to edit /rules command permission
                            [{text: l[lang].BACK_BUTTON, callback_data: "SETTINGS_HERE:"+settingsChatId}],
                        ] 
                    } 
                }
            )
            TGbot.answerCallbackQuery(cb.id);

        }

        if( cb.data.startsWith("S_RULES_REMOVETEXT_BUTTON:") &&  settingsChat.rules.hasOwnProperty("text"))
        {

            delete settingsChat.rules.text;
            delete settingsChat.rules.entities;
            db.chats.update( settingsChat );

        }
        if( cb.data.startsWith("S_RULES_CHANGE_BUTTON:") || cb.data.startsWith("S_RULES_REMOVETEXT_BUTTON:") )
        {

            if( user.waitingReply )
            {
                user.waitingReply = false;
                db.users.update(user);
            }

            var hasText = false;
            var hasMedia = false;
            var hasButtons = false;
            if( settingsChat.hasOwnProperty( "rules" ) )
            {

                hasText = settingsChat.rules.hasOwnProperty("text");
                hasMedia = settingsChat.rules.hasOwnProperty("media");
                hasButtons = settingsChat.rules.hasOwnProperty("buttons");

            }

            var text = "<b>"+l[lang].REGULATION+"</b>\n\n"+
            l[lang].TEXT_BUTTON + (hasText ? " ✅" : " ❌") +"\n"+
            l[lang].S_MEDIA_BUTTON + (hasMedia ? " ✅" : " ❌") +"\n"+
            l[lang].URLBUTTONS_BUTTON + (hasButtons ? " ✅" : " ❌") +"\n\n"+ 
            l[lang].CHANGE_RULES_ADV;
        
            TGbot.editMessageText( text, 
                {
                    message_id : msg.message_id,
                    chat_id : chat.id,
                    parse_mode : "HTML",
                    reply_markup : 
                    {
                        inline_keyboard :
                        [
                            [{text: l[lang].TEXT_BUTTON, callback_data: "S_RULES_TEXT_BUTTON:"+settingsChatId},
                            {text: l[lang].SEE_BUTTON, callback_data: "S_RULES_SEETEXT_BUTTON:"+settingsChatId}],

                            [{text: l[lang].S_MEDIA_BUTTON, callback_data: "S_RULES_MEDIA_BUTTON:"+settingsChatId},
                            {text: l[lang].SEE_BUTTON, callback_data: "S_RULES_SEEMEDIA_BUTTON:"+settingsChatId}],

                            [{text: l[lang].URLBUTTONS_BUTTON, callback_data: "S_RULES_BUTTONS_BUTTON:"+settingsChatId},
                            {text: l[lang].SEE_BUTTON, callback_data: "S_RULES_SEEBUTTONS_BUTTON:"+settingsChatId}],

                            [{text: l[lang].BACK_BUTTON, callback_data: "S_RULES_BUTTON:"+settingsChatId}],

                            //TODO: add a last button that allow to see the whole rules message as entire
                        ] 
                    } 
                }
            )
            TGbot.answerCallbackQuery(cb.id);

        }

        //

        if( cb.data.startsWith("S_RULES_TEXT_BUTTON:") )
        {

            user.waitingReply = true;
            user.waitingReplyType = "S_RULES_TEXT_BUTTON:"+settingsChatId;
            db.users.update(user);

            TGbot.editMessageText( l[lang].SET_MESSAGE_ADV, 
                {
                    message_id : msg.message_id,
                    chat_id : chat.id,
                    parse_mode : "HTML",
                    reply_markup : 
                    {
                        inline_keyboard :
                        [
                            [{text: l[lang].REMOVE_MESSAGE_BUTTON, callback_data: "S_RULES_REMOVETEXT_BUTTON:"+settingsChatId}],
                            [{text: l[lang].CANCEL_BUTTON, callback_data: "S_RULES_CHANGE_BUTTON:"+settingsChatId}],
                        ] 
                    } 
                }
            )
            TGbot.answerCallbackQuery(cb.id);

        }
        if( cb.data.startsWith("S_RULES_TEXT_SWITCHFORMAT:") ){
            settingsChat.rules.format = !settingsChat.rules.format;
            db.chats.update(settingsChat);
        }
        if( cb.data.startsWith("S_RULES_SEETEXT_BUTTON:") || cb.data.startsWith("S_RULES_TEXT_SWITCHFORMAT:") )
        {

            if( !settingsChat.rules.hasOwnProperty("text") )
            {

                TGbot.answerCallbackQuery(cb.id, {text: l[lang].MISSING_MESSAGE_ERROR, show_alert: true})
                return;

            }

            var options = {
                message_id : msg.message_id,
                chat_id : chat.id,
                reply_markup : 
                {
                    inline_keyboard :
                    [
                        [{text: l[lang].BACK_BUTTON, callback_data: "S_RULES_CHANGE_BUTTON:"+settingsChatId}],
                    ] 
                } 
            }

            if(settingsChat.rules.format)
            {
                if(settingsChat.rules.hasOwnProperty("entities"))
                    options.entities = settingsChat.rules.entities;

                options.reply_markup.inline_keyboard.unshift([{text: l[lang].ENTITIES_FORMAT, callback_data: "S_RULES_TEXT_SWITCHFORMAT:"+settingsChatId}])
            }
            else
            {
                options.parse_mode = "HTML"; 
                options.reply_markup.inline_keyboard.unshift([{text: l[lang].HTML_FORMAT, callback_data: "S_RULES_TEXT_SWITCHFORMAT:"+settingsChatId}])
            }               

        

            TGbot.editMessageText(settingsChat.rules.text, options)
            TGbot.answerCallbackQuery(cb.id);


        }

        //

        if( cb.data.startsWith("S_RULES_BUTTONS_BUTTON:") )
        {

            user.waitingReply = true;
            user.waitingReplyType = "S_RULES_BUTTONS_BUTTON:"+settingsChatId;
            db.users.update(user);

            TGbot.editMessageText( l[lang].SET_BUTTONS_ADV, 
                {
                    message_id : msg.message_id,
                    chat_id : chat.id,
                    parse_mode : "HTML",
                    reply_markup : 
                    {
                        inline_keyboard :
                        [
                            [{text: l[lang].REMOVE_MESSAGE_BUTTON, callback_data: "S_RULES_REMOVETEXT_BUTTON:"+settingsChatId}],
                            [{text: l[lang].CANCEL_BUTTON, callback_data: "S_RULES_CHANGE_BUTTON:"+settingsChatId}],
                        ] 
                    } 
                }
            )
            TGbot.answerCallbackQuery(cb.id);

        }
        if( cb.data.startsWith("S_RULES_SEEBUTTONS_BUTTON:") )
        {

            if( !settingsChat.rules.hasOwnProperty("buttons") )
            {

                TGbot.answerCallbackQuery(cb.id, {text: l[lang].MISSING_BUTTONS_ERROR, show_alert: true})
                return;

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

            options.reply_markup.inline_keyboard = settingsChat.rules.buttonsParsed; 

            options.reply_markup.inline_keyboard.push([{text: l[lang].BACK_BUTTON, callback_data: "S_RULES_CHANGE_BUTTON:"+settingsChatId}])

            TGbot.editMessageText("<code>"+settingsChat.rules.buttons+"</code>", options)
            TGbot.answerCallbackQuery(cb.id);


        }

    })

    

}

module.exports = main;
