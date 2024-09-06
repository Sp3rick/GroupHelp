var LGHelpTemplate = require("../GHbot.js");
const {genSettingsKeyboard, bold, code, genSettingsText, genSettings2Keyboard, link} = require( "../api/utils/utils.js" );
const CMDPerms = require("../api/editors/CommandsPerms.js")
const GHCommand = require("../api/tg/LGHCommand.js");


function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object
    langKeys = Object.keys(l);
    loadedLangs = Object.keys(l).length;

    GHCommand.registerCommands(["COMMAND_SETTINGS"], async (msg, chat, user, private, lang, key, keyLang) => {
        if(!msg.chat.isGroup) return;
        if(user.perms.settings != 1) return;

        GHbot.sendMessage( user.id, msg.chat.id, l[lang].SETTINGS_WHERE_OPEN, {
            message_id : msg.message_id,
            chat_id : msg.chat.id,
            parse_mode : "HTML",
            reply_markup : {inline_keyboard :[
                    [{text: l[lang].SETTINGS_HERE, callback_data: "SETTINGS_HERE:"+msg.chat.id}],
                    [{text: l[lang].SETTINGS_PRIVATE, callback_data: "SETTINGS_PRIVATE:"+msg.chat.id}],
            ]}
        })
    })

    GHbot.onMessage((msg, chat, user) => {

        

    })
    
    GHbot.onCallback(async (cb, chat, user) => {

        var msg = cb.message
        var lang = user.lang
        var isGroup = chat.isGroup;

        var isSettingsAdmin = false;
        if(isGroup) isSettingsAdmin = user.perms.settings == 1;

        //settings security guards
        if(!isSettingsAdmin && isGroup && cb.data.startsWith("S_"))
        {
            GHbot.answerCallbackQuery(user.id, cb.id, {text: l[lang].MISSING_PERMISSION, show_alert:true});
            return;
        }

        if( cb.data.startsWith("SETTINGS") )
            lang = chat.lang;

        if( cb.data.startsWith("SETTINGS_SELECT:") )
        {

            GHbot.editMessageText(user.id, l[user.lang].SETTINGS_WHERE_OPEN, {
                message_id : msg.message_id,
                chat_id : cb.chat.id,
                parse_mode : "HTML",
                reply_markup : {inline_keyboard:[
                    [{text: l[user.lang].SETTINGS_HERE, callback_data: "SETTINGS_HERE:"+chat.id}],
                    [{text: l[user.lang].SETTINGS_PRIVATE, callback_data: "SETTINGS_PRIVATE:"+chat.id}],
            ]}})
            GHbot.answerCallbackQuery(user.id, cb.id);
        }

        if( cb.data.startsWith("SETTINGS_PRIVATE:") )
        {

            var options = {
                message_id : msg.message_id,
                chat_id : cb.chat.id,
                parse_mode : "HTML",
                reply_markup : { inline_keyboard : genSettingsKeyboard(user.lang, chat.id) }
            }

            var text =
            bold(l[user.lang].SETTINGS.toUpperCase())+"\n"+
            bold(l[user.lang].GROUP+": ")+code(chat.title)+"\n"+
            bold(l[user.lang].GROUP_LANGUAGE+": ")+"<i>"+l[chat.lang].LANG_SELECTOR+"</i>\n\n"+
            l[user.lang].SETTINGS_SELECT;

            try {
                var sentMessage = await TGbot.sendMessage(user.id, text, options);
                var privateLink = "https://t.me/"+GHbot.TGbot.me.username;
                var opts = {parse_mode:"HTML",chat_id:cb.chat.id,message_id:msg.message_id}
                GHbot.editMessageText(user.id, link(l[lang].SETTINGS_SENT,privateLink),opts);
            } catch (err) {
                await GHbot.answerCallbackQuery(user.id, cb.id, { text: l[lang].SETTINGS_PRIVATE_ERROR, show_alert: true });
            }

        }
        if( cb.data.startsWith("SETTINGS_HERE:") )
        {
            console.log("inside SETTINGS_HERE")

            var options = {
                message_id : msg.message_id,
                chat_id : cb.chat.id,
                parse_mode : "HTML",
                reply_markup : { inline_keyboard : genSettingsKeyboard(user.lang, chat.id) }
            }
            var text = genSettingsText(user.lang, chat);
            GHbot.editMessageText(user.id,text,options);

        }
        if( cb.data.startsWith("SETTINGS_PAGE2:") )
        {
            console.log("inside SETTINGS_PAGE2")

            var options = {
                message_id : msg.message_id,
                chat_id : cb.chat.id,
                parse_mode : "HTML",
                reply_markup : { inline_keyboard : genSettings2Keyboard(user.lang, chat.id) }
            }
            var text = genSettingsText(user.lang, chat);
            GHbot.editMessageText(user.id,text,options);
        }


        if(cb.data.startsWith("S_PERMS_BUTTON"))
        {
            var buttons = [
                [{text: l[lang].COMMAND_PERMS_BUTTON, callback_data: "S_#CMDPERMS_MENU:"+chat.id}],
                [{text: l[lang].ANONYMOUS_ADMINS_BUTTON, callback_data: "S_ANONADMINS_BUTTON:"+chat.id}],
                [{text: l[lang].CHANGE_SETTINGS_BUTTON, callback_data: "S_SETTINGSPERM_BUTTON"+chat.id}],
                [{text: l[lang].CUSTOM_ROLES_BUTTON, callback_data: "S_ROLES_BUTTON:"+chat.id}],
                [{text: l[lang].BACK_BUTTON, callback_data: "SETTINGS_PAGE2:"+chat.id}]
            ]
            var options = {
                message_id : msg.message_id,
                chat_id : cb.chat.id,
                parse_mode : "HTML",
                reply_markup : { inline_keyboard : buttons}
            }
            var text = bold(l[lang].S_PERMS_BUTTON);
            GHbot.editMessageText(user.id,text,options);
        }

        if(cb.data.startsWith("S_#CMDPERMS"))
        {
            var returnButtons = [[{text: l[lang].BACK_BUTTON, callback_data: "S_PERMS_BUTTON:"+chat.id}]];
            var newChat = CMDPerms.callbackEvent(GHbot, db, cb, chat, user, "S_", returnButtons)
            if(newChat) db.chats.update(newChat);
        }


        if( cb.data == "LANGS_BUTTON" || cb.data.startsWith("LANGS_BUTTON:") )
        {

            var options = {
                message_id : msg.message_id,
                chat_id : cb.chat.id,
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
                    [{text: l[lang].SETTINGS_BUTTON, callback_data: "SETTINGS_HERE:"+chat.id }]
                );

                //specify cb.chat id on every LANGSET button
                options.reply_markup.inline_keyboard.forEach( (line,lineIndex) => { line.forEach( (button,buttonIndex) => {
                    if(button.callback_data.includes("LANGSET"))
                        options.reply_markup.inline_keyboard[lineIndex][buttonIndex].callback_data += (":"+chat.id);
                } ) } )

            }
            else if( cb.chat.type == "private" )
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

            GHbot.editMessageText(user.id, text, options )
            GHbot.answerCallbackQuery(user.id, cb.id);

        }

        if( cb.data.startsWith( "LANGSET=" ) ) //expected "LANGSET=en_en:chat.id" or "LANGSET=en_en" 
        {

            var newLang = cb.data.split("=")[1].split(":")[0];

            var options = {
                message_id : msg.message_id,
                chat_id : cb.chat.id,
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
                chat.lang = newLang;
                db.chats.update(chat);
                options.reply_markup.inline_keyboard.push( [{text: l[lang].SETTINGS_BUTTON, callback_data: "SETTINGS_HERE:"+chat.id}] )
                text = l[user.lang].LANG_CHANGED_GROUP.replace("{lang}", l[newLang].LANG_SELECTOR);
            }
            else{
                user.lang = newLang;
                db.users.update(user);
                options.reply_markup.inline_keyboard.push( [{text: l[lang].BACK_BUTTON, callback_data: "MENU"}] )
            }

            GHbot.editMessageText(user.id, text, options)
            GHbot.answerCallbackQuery(user.id, cb.id);

        }

    })

}

module.exports = main;
