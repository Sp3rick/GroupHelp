const { parseCommand, isAdmin } = require("./api/utils");

async function main() {

    global.LGHVersion = "0.0.10";
    console.log( "Libre group help current version: " )

    console.log("Starting...")
    const fs = require("fs");
    const util = require('util')
    const TelegramBot = require('node-telegram-bot-api');
    const {randomInt, isNumber, genSettingsKeyboard, isAdminOfChat} = require( __dirname + "/api/utils.js" );
    global.directory = __dirname; //used from /api/database.js
    
    var config = JSON.parse( fs.readFileSync( __dirname + "/config.json" ) )
    // Create a bot that uses 'polling' to fetch new updates
    const TGbot = new TelegramBot(config.botToken, {polling: true});
    const bot = await TGbot.getMe()

    var generateDatabase = require( __dirname + "/api/database.js" );
    var db = await generateDatabase(TGbot);
    console.log("log db path");
    console.log(db.dir)

    console.log( "Generating folder tree..." )
    var dbInnerDirFiles = fs.readdirSync( db.innerDir );
    if ( !dbInnerDirFiles.includes( "database" ) ){

        fs.mkdirSync( db.dir );
        console.log( "Generated \"database\" folder" );


    }
    var dbDirFiles = fs.readdirSync( db.dir )
    if( !dbDirFiles.includes( "chats" ) )
    {

        fs.mkdirSync( db.chatsDir);
        console.log( "Generated \"database/chats\" folder" );

    }
    if( !dbDirFiles.includes( "users" ) )
    {

        fs.mkdirSync( db.usersDir);
        console.log( "Generated \"database/users\" folder" );

    }



    console.log( "Loading languages..." )
    var l = {}//Object that store all languages
    var rLang = config.reserveLang;
    l[rLang] = JSON.parse( fs.readFileSync( __dirname + "/langs/" + rLang + ".json") ); //default language to fix others uncompleted langs
    console.log( "-loaded principal language: \"" + l[rLang].LANG_NAME + "\" " + rLang )


    var langs = fs.readdirSync( __dirname + "/langs" );
    langs = langs.slice( langs.indexOf(rLang + ".json")+1 );

    var defaultLangObjects = Object.keys(l[rLang])
    langs.forEach( (langFile) => {

        var fileName = langFile.replaceAll( ".json", "" );
        l[fileName] = JSON.parse( fs.readFileSync( __dirname + "/langs/" + langFile ) );
        console.log("-loaded language: \"" + l[fileName].LANG_NAME + "\" " + fileName);

        defaultLangObjects.forEach( (object) => { //detect and fill phrases from incompleted languages with default language (config.reserveLang)

            if( !l[fileName].hasOwnProperty( object ) )
            {

                console.log( "  identified missing paramenter " + object + ", replacing from " + rLang );
                l[fileName][object] = l[rLang][object];

            };

        } )
        
    } );

    global.LGHLangs = l; //add global reference

    var langKeys = Object.keys(l);
    var loadedLangs = Object.keys(l).length;
    

    TGbot.on( "message", async (msg, metadata) => {

        var command = parseCommand(msg.text || "");

        var chat = msg.chat;
        var from = msg.from;

        if ( msg.chat.type == "group" ){



        }
        if ( msg.chat.type == "supergroup" || msg.chat.type == "group"){

            

        }
        if ( msg.chat.type == "private" ){

            if ( !db.users.exhist( from.id ) ){

                db.users.add( from );

            };

            var user = Object.assign( {},  db.users.get( from.id ), user );

            //if is a message directed to support
            if( (user.waitingReply == true && user.waitingReplyType == "SUPPORT") ||
                (msg.hasOwnProperty("reply_to_message") && String(msg.reply_to_message.text).startsWith("#Support")) )
            {

                //broadcast message to all staff members
                config.botStaff.forEach( async (stafferId) => {

                    var sentMsg = await TGbot.forwardMessage(stafferId, chat.id, msg.message_id );

                    /*note: this make a little privacy problem because the first name and last name will be left on telegram message so, we
                    may store this message id and set a timer for delete/edit (removing first and last name) from message after 6 months? or more? or less?
                    */
                    var text = "#id" + from.id + " " + msg.message_id + "\n" +
                    "<b><i>From: </i></b>" + from.first_name + (from.last_name ? " "+from.last_name : "") + "\n" +
                    "👤Support request message\nReply to this message to reply the user.";
                    
                    TGbot.sendMessage(stafferId, text,
                        { 
                            parse_mode : "HTML",
                            reply_to_message_id: sentMsg.message_id
                        }
                    )

                })

                //confirm support message sent to user
                TGbot.sendMessage(user.id, l[user.lang].SUPPORT_SENT_CONFIRM,
                    { 
                        parse_mode : "HTML",
                        reply_markup :
                        {
                            inline_keyboard :
                            [
                                [{text: l[user.lang].BACK_BUTTON, callback_data: "MENU"}]
                            ] 
                        } 
                    }
                )

                user.waitingReply = false;
                db.users.update(user);

            }

            //if a bot staffer reply to a support message (that starts with #id)
            else if( msg.hasOwnProperty("reply_to_message") && String(msg.reply_to_message.text).startsWith("#id") && config.botStaff.includes(String(from.id)) )
            {

                var lines = msg.reply_to_message.text.split(/\r?\n/);
                var toReplyUserId = lines[0].split(" ")[0].replace("#id", "");
                var toReplyMessageId = lines[0].split(" ")[1];
                var fullNameUser = lines[1].replace("From: ","");

                var toReplyUser = db.users.get( toReplyUserId );

                //message directed to user
                TGbot.sendMessage( toReplyUserId, "#Support\n<i>" + l[toReplyUser.lang].SUPPORT_RECEIVED + "</i>\n\n" + msg.text, {
                    parse_mode: "HTML",
                    reply_to_message_id : toReplyMessageId
                });

                //confirmation message back to staffer 
                TGbot.sendMessage( from.id, "Reply successfully sent." );

                //let know all other staffers that a staffer replyed the user
                config.botStaff.forEach( (stafferId) => { if( stafferId != from.id ){

                    var text = from.first_name + " " + (from.last_name || "") + " [<code>" + from.id + "</code>] has answered to\n" +
                    fullNameUser + " [<code>" + toReplyUserId + "</code>] with:\n\n" +
                    "<i>" + msg.text + "</i>";

                    TGbot.sendMessage(stafferId, text,
                        { 
                            parse_mode : "HTML",
                        }
                    )

                } } )

            }

            else
            {

                TGbot.sendMessage(user.id, l[user.lang].PRESENTATION,
                    { 
                        parse_mode : "HTML",
                        reply_markup :
                        {
                            inline_keyboard :
                            [
                                [{text: l[user.lang].ADD_ME_TO_A_GROUP_BUTTON, url: "https://t.me/" + bot.username + "?startgroup=true"}],
                                [{text: l[user.lang].GROUP_BUTTON, url: "https://t.me/LibreGHelp" }, {text: l[user.lang].CHANNEL_BUTTON, url: "https://t.me/LibreGroupHelp"}],
                                [{text: l[user.lang].SUPPORT_BUTTON, callback_data: "SUPPORT_BUTTON"}, {text: l[user.lang].INFO_BUTTON, callback_data: "INFO_BUTTON"}],
                                [{text: l[user.lang].LANGS_BUTTON, callback_data: "LANGS_BUTTON"}]
                            ] 
                        } 
                    }
                )
                
            }
            

        }

        console.log( msg );




    } );

    TGbot.on( "callback_query", (cb) => {

        TGbot.answerCallbackQuery(cb.id);
        //
        var msg = cb.message;
        var from = cb.from;
        var chat = msg.chat;
        var isGroup = (chat.type == "group" || chat.type == "supergroup")

        var user = Object.assign( {},  db.users.get( from.id ), from );

        var lang = user.lang;

        console.log("Callback data: " + cb.data)

        if( isGroup ){
            chat = db.chats.get( chat.id );
            lang = chat.lang;
        };

        //take it for granted that if user clicks a button he's not going to send another message as input
        if( user.waitingReply == true )
        {
            user.waitingReply = false;
            db.users.update(user);
        }

        if( cb.data == "MENU" )
        {

            TGbot.editMessageText( l[lang].PRESENTATION, 
                {
                    message_id : msg.message_id,
                    chat_id : chat.id,
                    parse_mode : "HTML",
                    reply_markup :
                    {
                        inline_keyboard :
                        [
                            [{text: l[lang].ADD_ME_TO_A_GROUP_BUTTON, url: "https://t.me/" + bot.username + "?startgroup=true"}],
                            [{text: l[lang].GROUP_BUTTON, url: "https://t.me/LibreGHelp" }, {text: l[lang].CHANNEL_BUTTON, url: "https://t.me/LibreGroupHelp"}],
                            [{text: l[lang].SUPPORT_BUTTON, callback_data: "SUPPORT_BUTTON"}, {text: l[lang].INFO_BUTTON, callback_data: "INFO_BUTTON"}],
                            [{text: l[lang].LANGS_BUTTON, callback_data: "LANGS_BUTTON"}]
                        ] 
                    } 
                }
            )

        }

        if( cb.data == "SUPPORT_BUTTON" )
        {

            user.waitingReply = true;
            user.waitingReplyType = "SUPPORT";
            db.users.update(user);

            TGbot.editMessageText( l[lang].SUPPORT_MESSAGE, 
                {
                    message_id : msg.message_id,
                    chat_id : chat.id,
                    parse_mode : "HTML",
                    reply_markup : 
                    {
                        inline_keyboard :
                        [
                            [{text: l[lang].CANCEL_BUTTON, callback_data: "MENU"}],
                        ] 
                    } 
                }
            )

        }

        if( cb.data == "INFO_BUTTON" )
        {

            TGbot.editMessageText( l[lang].INFO, 
                {
                    message_id : msg.message_id,
                    chat_id : chat.id,
                    parse_mode : "HTML",
                    reply_markup : 
                    {
                        inline_keyboard :
                        [
                            [{text: l[lang].SUPPORT_ABOUT_BUTTON, callback_data: "SUPPORT_BUTTON"}],
                            [{text: l[lang].COMMANDS_BUTTON, callback_data: "NOT_IMPLEMENTED"}],
                            [{text: l[lang].BACK_BUTTON, callback_data: "MENU"}],
                        ] 
                    } 
                }
            )

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

            if( isGroup && isAdminOfChat(chat, from.id))
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
       

        var isSettingsAdmin = false;
        var settingsChatId = "";
        var settingsChat = {};
        if( cb.data.startsWith("SETTINGS") ) //handle settings and prevent non-admin user from using it
        {

            settingsChatId = cb.data.split(":")[1];
            settingsChat = db.chats.get(settingsChatId) //overwrite chat
            lang = settingsChat.lang;
            isSettingsAdmin = isAdminOfChat(settingsChat, from.id);
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

            TGbot.sendMessage(from.id, text, options)

            //TODO: when bot tryes to send private message check if its arrives, if not ask the user to start bot in private chat

        }

        
        

        //todo: commands help panel

    } )


    
    TGbot.on( "new_chat_members", async (msg) => {

        var chat = msg.chat;
        var fixChatId = String(msg.chat.id).replace( "-", "_");
        var from = msg.from;
        console.log(msg)


        var newMember = msg.new_chat_member;
        if ( newMember.id == bot.id ){

            if ( !db.chats.exhist( chat.id ) && !db.users.exhist( from.id ) ){

                db.users.add( from );

            }
            if ( !db.chats.exhist( chat.id ) ){//if there arent already the chat add it

                console.log( "Adding new group to database" );
                chat.lang = db.users.get( from.id ).lang
                console.log( "Group lang: " + chat.lang )
                db.chats.add(chat)

            }
            else{

                chat = db.chats.get(chat.id);

            }

            db.chats.update( chat );

            console.log( "Added bot to a group, lang: " + chat.lang );
            await TGbot.sendMessage(chat.id, l[chat.lang].NEW_GROUP,
            { 
                parse_mode : "HTML",
                reply_markup :
                {
                    inline_keyboard :
                    [
                        [ {text: l[chat.lang].ADV_JOIN_CHANNEL, url: "https://t.me/LibreGroupHelp"} ]
                    ] 
                } 
            }
            )

            TGbot.sendMessage(chat.id, l[chat.lang].SETUP_GUIDE,
                { 
                    parse_mode : "HTML",
                    reply_markup :
                    {
                        inline_keyboard :
                        [
                            [
                                {text: l[chat.lang].LANGS_BUTTON2, callback_data: "LANGS_BUTTON:"+chat.id},
                                {text: l[chat.lang].SETTINGS_BUTTON, callback_data: "SETTINGS_SELECT:"+chat.id},
                            ]
                        ] 
                    } 
                }
            )
 
            

        }

    } )



    TGbot.on( "left_chat_member", (msg) => {

        var chat = msg.chat;
        var from = msg.from;

        var leftMember = msg.left_chat_member;
        if ( leftMember.id == bot.id && config.deleteChatDataAfterBotRemove == true){

            console.log("Bot kicked from chat and config.deleteChatDataAfterBotRemove == true, deleting chat data of group");
            db.chats.delete( chat.id );

        }

    } )



    TGbot.on( "polling_error", (err) => {
        console.log(err)
    } )

    module.exports = TGbot;

}
main()
