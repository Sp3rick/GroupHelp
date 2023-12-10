var LGHelpTemplate = require("../GHbot.js")
const {randomInt, isNumber, genSettingsKeyboard, isAdminOfChat} = require( "../api/utils.js" );

function main(args)
{

    var {GHbot, TGbot, db, config} = new LGHelpTemplate(args);

    l = global.LGHLangs; //importing langs object
    langKeys = Object.keys(l);
    loadedLangs = Object.keys(l).length;

    
    
    GHbot.on("callback_query", (cb, chat, user) => {

        var msg = cb.message
        var lang = user.lang

        var isSettingsAdmin = false;
        var settingsChatId = "";
        var settingsChat = {};
        if( cb.data.startsWith("SETTINGS") ) //handle settings and prevent non-admin user from using it
        {

            settingsChatId = cb.data.split(":")[1];
            settingsChat = db.chats.get(settingsChatId) //overwrite chat
            lang = settingsChat.lang;
            isSettingsAdmin = isAdminOfChat(settingsChat, user.id);
            console.log("Is admin for settings? " + isSettingsAdmin);

            if(!isSettingsAdmin) return; //if is settings, but user is not chat admin, stop here

        }

        if( cb.data.startsWith("SETTINGS_SELECT:") )
        {

            TGbot.editMessageText( l[lang].SETTINGS_WHERE_OPEN, 
                {
                    message_id : msg.message_id,
                    chat_id : chat.id,
                    parse_mode : "HTML",
                    reply_markup : 
                    {
                        inline_keyboard :
                        [
                            [{text: l[lang].SETTINGS_HERE, callback_data: "SETTINGS_HERE:"+settingsChatId}],
                            [{text: l[lang].SETTINGS_PRIVATE, callback_data: "SETTINGS_PRIVATE:"+settingsChatId}],
                        ] 
                    } 
                }
            )

        }

        //SETTINGS_HERE for edit, SETTINGS_PRIVATE to send new in private
        if( cb.data.startsWith("SETTINGS_HERE:") )
        {
            console.log("inside SETTINGS_HERE")

            var options = {
                message_id : msg.message_id,
                chat_id : chat.id,
                parse_mode : "HTML",
                reply_markup : { inline_keyboard : genSettingsKeyboard(lang, settingsChatId) }
            }

            var text =
            "<b>"+l[lang].SETTINGS.toUpperCase()+"</b>\n"+
            "<b>"+l[lang].GROUP+":</b> <code>"+settingsChat.title+"</code>\n\n"+
            l[lang].SETTINGS_SELECT;

            TGbot.editMessageText(text, options)

        }
        if( cb.data.startsWith("SETTINGS_PRIVATE:") )
        {

            var options = {
                message_id : msg.message_id,
                chat_id : chat.id,
                parse_mode : "HTML",
                reply_markup : { inline_keyboard : genSettingsKeyboard(lang, settingsChatId) }
            }

            var text =
            "<b>"+l[lang].SETTINGS.toUpperCase()+"</b>\n"+
            "<b>"+l[lang].GROUP+":</b> <code>"+settingsChat.title+"</code>\n\n"+
            l[lang].SETTINGS_SELECT;

            TGbot.sendMessage(user.id, text, options)

            //TODO: when bot tryes to send private message check if its arrives, if not ask the user to start bot in private chat

        }





        if( cb.data == "LANGS_BUTTON" || cb.data.startsWith("LANGS_BUTTON:") )
        {

            var managedChatId = chat.id;
            if( cb.data.startsWith("LANGS_BUTTON:") )
            {

                isGroup = true;
                managedChatId = cb.data.replace("LANGS_BUTTON:", "");

            }

            var options = {
                message_id : msg.message_id,
                chat_id : chat.id,
                parse_mode : "HTML",
                reply_markup : 
                {
                    inline_keyboard :
                    [
                        
                    ] 
                }  
            }

            //loading langs buttons panel
            //Note: here in this for loop we dont give a specify chatId as LANGSET for groups, its done inside if( isGroup )
            var isEven = (loadedLangs % 2 == 0) ? true : false;
            if( !isEven )
            {

                options.reply_markup.inline_keyboard.push(
                    [{text: l[langKeys[0]].LANG_SELECTOR, callback_data: "LANGSET=" + langKeys[0]}]
                );

            }
            for( var i = (isEven) ? 0 : 1; i < loadedLangs; i=i+2 )
            {

                options.reply_markup.inline_keyboard.push(
                    [
                        {text: l[langKeys[i]].LANG_SELECTOR, callback_data: "LANGSET="+langKeys[i]},
                        {text: l[langKeys[i+1]].LANG_SELECTOR, callback_data: "LANGSET="+langKeys[i+1]}
                    ]
                );

            }

            if( isGroup )
            {

                options.reply_markup.inline_keyboard.push(
                    [{text: l[lang].SETTINGS_BUTTON, callback_data: "SETTINGS_HERE:"+managedChatId }]
                );


                //specify chat id on every LANGSET button
                options.reply_markup.inline_keyboard.forEach( (line,lineIndex) => { line.forEach( (button,buttonIndex) => {
                    if(button.callback_data.includes("LANGSET"))
                        options.reply_markup.inline_keyboard[lineIndex][buttonIndex].callback_data += (":"+managedChatId);
                } ) } )

            }
            else if( chat.type == "private" )
            {

                options.reply_markup.inline_keyboard.push(
                    [{text: l[lang].BACK_BUTTON, callback_data: "MENU"}]
                );

            }

            
            var text = l[config.reserveLang].LANG_CHOOSE;
            
            if( isGroup ) text = l[config.reserveLang].LANG_CHOOSE_GROUP_ADVICE + "\n\n" + text;;
            
            if( config.reserveLang != user.lang ) text += "\n" + l[lang].LANG_CHOOSE;

            TGbot.editMessageText( text, options )

        }

        //be sure that a non-admin user can't modify with some bug the language
        if( cb.data.startsWith( "LANGSET=" ) ) //expected "LANGSET=en_en:managedChatId" or "LANGSET=en_en" 
        {

            var newLang = cb.data.split("=")[1].split(":")[0];

            var options = {
                message_id : msg.message_id,
                chat_id : chat.id,
                parse_mode : "HTML",
                reply_markup :
                {
                    inline_keyboard :
                    [
                        
                    ] 
                } 
            }

            var hasSpecificChatId = (cb.data.split(":").length == 2 );
            var specificChatId = "";
            if( hasSpecificChatId ){

                isGroup = true;
                specificChatId = cb.data.split(":")[1];
                chat = db.chats.get(specificChatId);

            };

            if( isGroup && isAdminOfChat(chat, user.id))
            {

                chat.lang = newLang;
                db.chats.update(chat);

                options.reply_markup.inline_keyboard.push( [{text: l[lang].SETTINGS_BUTTON, callback_data: "SETTINGS_HERE:"+specificChatId}] )

            }

            if( !hasSpecificChatId && chat.type == "private" )
            {

                user.lang = newLang;
                db.users.update(user);

                options.reply_markup.inline_keyboard.push( [{text: l[lang].BACK_BUTTON, callback_data: "MENU"}] )

            }

            TGbot.editMessageText( l[newLang].LANG_CHANGED, options)

        }

    })

    

}

module.exports = main;
