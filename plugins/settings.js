var LGHelpTemplate = require("../GHbot.js");
const RM = require("../api/rolesManager.js");
const {genSettingsKeyboard, IsEqualInsideAnyLanguage, checkCommandPerms, code} = require( "../api/utils.js" );

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object
    langKeys = Object.keys(l);
    loadedLangs = Object.keys(l).length;

    GHbot.onMessage((msg, chat, user) => {

        var lang = user.lang

        if(!chat.isGroup) return;
        if(user.perms.settings != 1) return;

        if( chat.isGroup && checkCommandPerms(msg.command, "COMMAND_SETTINGS", user.perms ) )
        {

            TGbot.sendMessage( chat.id, l[lang].SETTINGS_WHERE_OPEN, 
                {
                    message_id : msg.message_id,
                    chat_id : chat.id,
                    parse_mode : "HTML",
                    reply_markup : 
                    {
                        inline_keyboard :
                        [
                            [{text: l[lang].SETTINGS_HERE, callback_data: "SETTINGS_HERE:"+chat.id}],
                            [{text: l[lang].SETTINGS_PRIVATE, callback_data: "SETTINGS_PRIVATE:"+chat.id}],
                        ] 
                    } 
                }
            )

        }

    })
    
    GHbot.onCallback(async (cb, chat, user) => {

        var msg = cb.message
        var lang = user.lang
        var isGroup = (chat.isGroup || cb.data.includes(":"))

        var settingsChatId = chat.id;
        if(cb.data.includes(":")) settingsChatId = cb.data.split(":")[1];
        var settingsChat = db.chats.get(settingsChatId);
        var isSettingsAdmin = false;
        if(isGroup) isSettingsAdmin = user.perms.settings == 1;

        if(!isSettingsAdmin && isGroup )
        {
            TGbot.answerCallbackQuery(cb.id, {text: l[lang].MISSING_PERMISSION, show_alert:true});
            return;
        }

        if( cb.data.startsWith("SETTINGS") ) //handle settings and prevent non-admin user from using it
        {
            lang = settingsChat.lang;
        }

        if( cb.data.startsWith("SETTINGS_SELECT:") )
        {

            TGbot.editMessageText( l[user.lang].SETTINGS_WHERE_OPEN, 
                {
                    message_id : msg.message_id,
                    chat_id : chat.id,
                    parse_mode : "HTML",
                    reply_markup : 
                    {
                        inline_keyboard :
                        [
                            [{text: l[user.lang].SETTINGS_HERE, callback_data: "SETTINGS_HERE:"+settingsChatId}],
                            [{text: l[user.lang].SETTINGS_PRIVATE, callback_data: "SETTINGS_PRIVATE:"+settingsChatId}],
                        ] 
                    } 
                }
            )
            TGbot.answerCallbackQuery(cb.id);
        }

        if( cb.data.startsWith("SETTINGS_HERE:") )
        {
            console.log("inside SETTINGS_HERE")

            var options = {
                message_id : msg.message_id,
                chat_id : chat.id,
                parse_mode : "HTML",
                reply_markup : { inline_keyboard : genSettingsKeyboard(user.lang, settingsChatId) }
            }

            var text =
            bold(l[user.lang].SETTINGS.toUpperCase())+"\n"+
            bold(l[user.lang].GROUP+": ")+code(settingsChat.title)+"\n"+
            bold(l[user.lang].GROUP_LANGUAGE+": ")+"<i>"+l[settingsChat.lang].LANG_SELECTOR+"</i>\n\n"+
            l[user.lang].SETTINGS_SELECT;

            TGbot.editMessageText(text, options)

        }
        if( cb.data.startsWith("SETTINGS_PRIVATE:") )
        {

            var options = {
                message_id : msg.message_id,
                chat_id : chat.id,
                parse_mode : "HTML",
                reply_markup : { inline_keyboard : genSettingsKeyboard(user.lang, settingsChatId) }
            }

            var text =
            bold(l[user.lang].SETTINGS.toUpperCase())+"\n"+
            bold(l[user.lang].GROUP+": ")+code(settingsChat.title)+"\n"+
            bold(l[user.lang].GROUP_LANGUAGE+": ")+"<i>"+l[settingsChat.lang].LANG_SELECTOR+"</i>\n\n"+
            l[user.lang].SETTINGS_SELECT;

            try {
                var sentMessage = await TGbot.sendMessage(user.id, text, options);
                TGbot.answerCallbackQuery(cb.id);
            } catch (err) {
                await TGbot.answerCallbackQuery(cb.id, { text: l[lang].SETTINGS_PRIVATE_ERROR, show_alert: true });
            }

        }



        if( cb.data == "LANGS_BUTTON" || cb.data.startsWith("LANGS_BUTTON:") )
        {

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
            //Note: here in this for loop we dont give a specific chatId as LANGSET for groups, its done inside if( isGroup )
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
                    [{text: l[lang].SETTINGS_BUTTON, callback_data: "SETTINGS_HERE:"+settingsChatId }]
                );

                //specify chat id on every LANGSET button
                options.reply_markup.inline_keyboard.forEach( (line,lineIndex) => { line.forEach( (button,buttonIndex) => {
                    if(button.callback_data.includes("LANGSET"))
                        options.reply_markup.inline_keyboard[lineIndex][buttonIndex].callback_data += (":"+settingsChatId);
                } ) } )

            }
            else if( chat.type == "private" )
            {

                options.reply_markup.inline_keyboard.push(
                    [{text: l[lang].BACK_BUTTON, callback_data: "MENU"}]
                );

            }

            
            var text = l[config.reserveLang].LANG_CHOOSE +
            ((config.reserveLang == user.lang) ? "" : "\n"+l[user.lang].LANG_CHOOSE);

            if( isGroup ) text = l[config.reserveLang].LANG_CHOOSE_GROUP_ADVICE + "\n\n" +
            l[config.reserveLang].LANG_CHOOSE_GROUP +
            ((config.reserveLang == user.lang) ? "" : "\n"+l[user.lang].LANG_CHOOSE_GROUP);

            
            //if( config.reserveLang != user.lang ) text += "\n" + l[lang].LANG_CHOOSE;

            TGbot.editMessageText( text, options )
            TGbot.answerCallbackQuery(cb.id);

        }

        if( cb.data.startsWith("S_CLOSE_BUTTON") )
            TGbot.deleteMessage(chat.id, msg.message_id);

        if( cb.data.startsWith( "LANGSET=" ) ) //expected "LANGSET=en_en:settingsChatId" or "LANGSET=en_en" 
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

            var text = l[newLang].LANG_CHANGED;
            if(isGroup)
            {
                settingsChat.lang = newLang;
                db.chats.update(settingsChat);
                options.reply_markup.inline_keyboard.push( [{text: l[lang].SETTINGS_BUTTON, callback_data: "SETTINGS_HERE:"+settingsChatId}] )
                text = l[user.lang].LANG_CHANGED_GROUP.replace("{lang}", l[newLang].LANG_SELECTOR);
            }
            else{
                user.lang = newLang;
                db.users.update(user);
                options.reply_markup.inline_keyboard.push( [{text: l[lang].BACK_BUTTON, callback_data: "MENU"}] )
            }

            TGbot.editMessageText( text, options)
            TGbot.answerCallbackQuery(cb.id);

        }

    })

}

module.exports = main;
