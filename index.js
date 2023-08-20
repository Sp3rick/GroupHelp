async function main() {

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

    /*
    *dead code, maybe is better to optimize db.chat.get() to store in temporary array most used chats, see hint in api/database.js
    *

    console.log( "Loading database..." )

    fs.readdirSync( db.dir + "/chats/" ).forEach( (file) => {

        var id = file.replace( "-", "_" ).replace( ".json", "" );
        db.chats[id] = fs.readFileSync( db.dir + "/chats/" + file );

    } )
    fs.readdirSync( db.dir + "/users/" ).forEach( (file) => {

        var id = file.replace( ".json", "" );
        db.users[id] = fs.readFileSync( db.dir + "/users/" + file );

    } )
    */

    console.log( "Loading languages..." )
    var l = {}//Object that store all languages
    fs.readdirSync( __dirname + "/langs" ).forEach( (langFile) => {

        var fileName = langFile.replaceAll( ".json", "" );
        l[fileName] = JSON.parse( fs.readFileSync( __dirname + "/langs/" + langFile ) );
        console.log("-loaded language: \"" + l[fileName].LANG_NAME + "\" " + fileName);
        //TODO: detect and fill phrases from incompleted languages with en_en
        
    } );

    TGbot.on( "message", (msg, metadata) => {

        //TODO: make a command parser (variables set like https://github.com/telegraf/telegraf-command-parts should be good to do)

        var chat = msg.chat;
        var from = msg.from;

        if ( msg.chat.type == "group" ){



        }
        if ( msg.chat.type == "supergroup" ){

            

        }
        if ( msg.chat.type == "private" ){

            if ( !db.users.exhist( from.id ) ){

                db.users.add( from );

            };

            var user = db.users.get( from.id );

            TGbot.sendMessage(user.id, l[user.lang].PRESENTATION,
                { 
                    parse_mode : "HTML",
                    reply_markup :
                    {
                        inline_keyboard :
                        [
                            [{text: l[user.lang].ADD_ME_TO_A_GROUP_BUTTON, url: "https://t.me/" + bot.username + "?startgroup=true"}],
                            [{text: l[user.lang].GROUP_BUTTON, url: "https://t.me/LibreGHelp" }, {text: l[user.lang].CHANNEL_BUTTON, url: "https://t.me/LibreGroupHelp"}],
                            [{text: l[user.lang].SUPPORT_BUTTON, callback_data: "NOT_IMPLEMENTED"}, {text: l[user.lang].INFO_BUTTON, callback_data: "NOT_IMPLEMENTED"}],
                            [{text: l[user.lang].LANGS_BUTTON, callback_data: "NOT_IMPLEMENTED"}]
                        ] 
                    } 
                }
            )

        }

        console.log( msg );




    } );


    
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

            console.log("Deleting chat data of a group");
            db.chats.delete( chat.id );

        }

    } )



    TGbot.on( "polling_error", (err) => {
        console.log(err)
    } )

    module.exports = TGbot;

}
main()
