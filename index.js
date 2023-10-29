async function main() {

    global.LGHVersion = "0.0.8";
    console.log( "Libre group help current version: " )

    console.log("Starting...")
    const fs = require("fs");
    const util = require('util')
    const TelegramBot = require('node-telegram-bot-api');
    const {randomInt, isNumber} = require( __dirname + "/api/utils.js" );
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

    var langKeys = Object.keys(l);
    var loadedLangs = Object.keys(l).length;
    

    TGbot.on( "message", async (msg, metadata) => {

        //TODO: make a command parser (variables set like https://github.com/telegraf/telegraf-command-parts should be good to do)

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

            var user = db.users.get( from.id );

            //if is a message directed to support
            if( (user.waitingReply == true && user.waitingReplyType == "SUPPORT") ||
                (msg.hasOwnProperty("reply_to_message") && String(msg.reply_to_message.text).startsWith("#Support")) )
            {

                //broadcast message to all staff members
                config.botStaff.forEach( async (stafferId) => {

                    var sentMsg = await TGbot.forwardMessage(stafferId, chat.id, msg.message_id );
                    
                    TGbot.sendMessage(stafferId, ("#id" + from.id + " " + msg.message_id + "\n👤Support request message\nReply to this message to reply the user."),
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

                //get id from replyed message
                var firstLine = msg.reply_to_message.text.split(/\r?\n/)[0];
                var toReplyUserId = firstLine.split(" ")[0].replace("#id", "");
                var toReplyMessageId = firstLine.split(" ")[1];

                var toReplyUser = db.users.get( toReplyUserId );

                //message directed to user
                TGbot.sendMessage( toReplyUserId, "#Support\n<i>" + l[toReplyUser.lang].SUPPORT_RECEIVED + "</i>\n\n" + msg.text, {
                    parse_mode: "HTML",
                    reply_to_message_id : toReplyMessageId
                });

                //confirmation message back to staffer 
                TGbot.sendMessage( from.id, "Reply successfully sent." );

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

        var user = db.users.get( from.id );

        //take it for granted that if user clicks a button he's not going to send another message as input
        if( user.waitingReply == true )
        {
            user.waitingReply = false;
            db.users.update(user);
        }

        if( cb.data == "MENU" )
        {

            TGbot.editMessageText( l[user.lang].PRESENTATION, 
                {
                    message_id : msg.message_id,
                    chat_id : chat.id,
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

        //TO IMPLEMENT
        if( cb.data == "SUPPORT_BUTTON" )
        {

            user.waitingReply = true;
            user.waitingReplyType = "SUPPORT";
            db.users.update(user);

            TGbot.editMessageText( l[user.lang].SUPPORT_MESSAGE, 
                {
                    message_id : msg.message_id,
                    chat_id : chat.id,
                    parse_mode : "HTML",
                    reply_markup : 
                    {
                        inline_keyboard :
                        [
                            [{text: l[user.lang].CANCEL_BUTTON, callback_data: "MENU"}],
                        ] 
                    } 
                }
            )

        }

        if( cb.data == "INFO_BUTTON" )
        {

            TGbot.editMessageText( l[user.lang].INFO, 
                {
                    message_id : msg.message_id,
                    chat_id : chat.id,
                    parse_mode : "HTML",
                    reply_markup : 
                    {
                        inline_keyboard :
                        [
                            [{text: l[user.lang].SUPPORT_ABOUT_BUTTON, callback_data: "SUPPORT_BUTTON"}],
                            [{text: l[user.lang].COMMANDS_BUTTON, callback_data: "NOT_IMPLEMENTED"}],
                            [{text: l[user.lang].BACK_BUTTON, callback_data: "MENU"}],
                        ] 
                    } 
                }
            )

        }

        if( cb.data == "LANGS_BUTTON" )
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
            var isEven = (loadedLangs % 2 == 0) ? true : false;

            if( !isEven )
            {

                options.reply_markup.inline_keyboard.push(
                    [{text: l[langKeys[0]].LANG_SELECTOR, callback_data: "LANGSET:" + langKeys[0]}]
                );

            }

            for( var i = (isEven) ? 0 : 1; i < loadedLangs; i=i+2 )
            {

                options.reply_markup.inline_keyboard.push(
                    [
                        {text: l[langKeys[i]].LANG_SELECTOR, callback_data: "LANGSET:" + langKeys[i]},
                        {text: l[langKeys[i+1]].LANG_SELECTOR, callback_data: "LANGSET:" + langKeys[i+1]}
                    ]
                );

            }

            options.reply_markup.inline_keyboard.push(
                [{text: l[user.lang].BACK_BUTTON, callback_data: "MENU"}]
            );

            
            var text = l[config.reserveLang].LANG_CHOOSE;
            if( config.reserveLang != user.lang ) text += "\n" + l[user.lang].LANG_CHOOSE;

            TGbot.editMessageText( text, options )

        }

        
        
        if( cb.data.startsWith( "LANGSET:" ) ) //ex. "LANGSET:en_en"
        {

            var newLang = cb.data.replace("LANGSET:", "");
            user.lang = newLang;
            db.users.update(user);

            TGbot.editMessageText( l[user.lang].LANG_CHANGED, 
                {
                    message_id : msg.message_id,
                    chat_id : chat.id,
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

        }

        //todo: Support option and commands help panel

    } )


    
    TGbot.on( "new_chat_members", (msg) => {

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

            console.log("\n\n\n\nupdate")
            db.chats.update( chat );


            console.log( "Added bot to a group" );
            TGbot.sendMessage(chat.id, l[chat.lang].NEW_GROUP,
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
