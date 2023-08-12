const fs = require( "fs" );
const TelegramBot = require('node-telegram-bot-api');
const { isValidChat } = require("./utils");
const {randomInt, isNumber} = require( global.directory + "/api/utils.js" );

//config database directory here
var dbInnerDir = global.directory;

var database = 
{

    innerDir : dbInnerDir,//location where database folder should be placed (and/or generated)
    dir : dbInnerDir + "/database",
    chatsDir : dbInnerDir + "/database/chats",
    
    /**
     * @param {TelegramBot.Chat} chat
     */
    addChat : function(chat){
       
        if ( !isValidChat(chat) ){

            console.log( "breaking addChat function, maybe you entered wrong chat object" );
            return 0;

        }
        var chatFile = database.chatsDir + "/" + chat.id + ".json";
        console.log( "adding chat to database" );
        fs.writeFileSync( chatFile, JSON.stringify(chat) )
       
        
    },

    /**
     * @param {TelegramBot.Chat} chat
     */
    deleteChat : function(chat){

        if ( !isValidChat(chat) ){

            console.log( "breaking deleteChat function, maybe you entered wrong chat object" );
            return 0;

        }
        var chatFile = database.chatsDir + "/" + chat.id + ".json";
        if ( fs.existsSync(chatFile) ){

            console.log( "Removing a chat from database" );
            fs.unlinkSync( chatFile );

        }


    }
    

}



module.exports = database;
