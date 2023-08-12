async function main() {

    console.log("Starting...")
    const fs = require("fs");
    const util = require('util')
    const TelegramBot = require('node-telegram-bot-api');
    const {randomInt, isNumber} = require( __dirname + "/api/utils.js" );
    global.directory = __dirname;
    var db = require( __dirname + "/api/database.js" );
    console.log("log db path");
    console.log(db.dir)

    //generating folder tree
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


    var config = JSON.parse( fs.readFileSync( __dirname + "/config.json" ) )

    // Create a bot that uses 'polling' to fetch new updates
    const TGbot = new TelegramBot(config.botToken, {polling: true});
    const bot = await TGbot.getMe()

    TGbot.on( "message", (msg, metadata) => {

        var chat = msg.chat;
        var form = msg.from;

        if ( msg.chat.type == "group" ){



        }
        if ( msg.chat.type == "supergroup" ){

            

        }
        if ( msg.chat.type == "private" ){

            

        }

        console.log( msg );




    } );


    
    TGbot.on( "new_chat_members", (msg) => {

        var chat = msg.chat;
        var form = msg.from;

        

        var newMember = msg.new_chat_member;
        if ( newMember.id == bot.id ){
            
            console.log( "Adding new group to database" );
            
            db.addChat(chat)
            console.log( "Added" );

        }

    } )



    TGbot.on( "left_chat_member", (msg) => {

        var chat = msg.chat;
        var form = msg.from;

        var leftMember = msg.left_chat_member;
        if ( leftMember.id == bot.id && config.deleteChatDataAfterBotRemove == true){

            console.log("Deleting chat data of a group");
            db.deleteChat( chat );

        }

    } )



    TGbot.on( "polling_error", (err) => {
        console.log(err)
    } )

}
main()