console.log("Starting...")
const fs = require("fs");
const util = require('util')
const TelegramBot = require('node-telegram-bot-api');
const {randomInt, isNumber} = require( __dirname + "/api/utils.js" );

var currentDir = fs.readdirSync( __dirname );
if ( !currentDir.includes( "database" ) ){

    fs.mkdirSync( __dirname + "/database" );
    console.log( "Generated \"database\" folder" );

}

var config = JSON.parse( fs.readFileSync( __dirname + "/config.json" ) )

// Create a bot that uses 'polling' to fetch new updates
const TGbot = new TelegramBot(config.botToken, {polling: true});
const bot = TGbot.getMe()

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

    var newMember = msg.new_chat_members;
    if ( newMember == bot.id ){

        console.log( "New group added" );
        //TODO: here function to save chat

    }

} )

