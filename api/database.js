const fs = require( "fs" );
const TelegramBot = require('node-telegram-bot-api');
const {randomInt, isNumber, isValidChat, isValidUser} = require( global.directory + "/api/utils.js" );

//config database directory here
var dbInnerDir = global.directory;

var database = 
{

    innerDir : dbInnerDir,//location where database folder should be placed (and/or generated)
    dir : dbInnerDir + "/database",
    chatsDir : dbInnerDir + "/database/chats",
    usersDir : dbInnerDir + "/database/users",

    chats :
    {

        /**
         * @param {TelegramBot.Chat} chat
         */
        add : function(chat){
        
            if ( !isValidChat(chat) ){

                console.log( "breaking chats.add function, maybe you entered wrong chat object" );
                return false;

            }
            var chatFile = database.chatsDir + "/" + chat.id + ".json";
            console.log( "adding chat to database" );
            fs.writeFileSync( chatFile, JSON.stringify(chat) )
            return true;
            
        },

        /**
         * @param {TelegramBot.ChatId} chatId The chat id of the user.
         */
        delete : function(chatId){

            var chatFile = database.chatsDir + "/" + chatId + ".json";
            if ( !fs.existsSync(chatFile) ){
                
                console.log( "breaking chats.delete function, " + chatFile + " file does not exhist" )
                return false;

            }

            console.log( "Removing a chat from database" );
            fs.unlinkSync( chatFile );
            return true;


        }

    },
    
    users :
    {

        /**
         * @param {TelegramBot.User} user
         */
        add : function(user){

            if( isValidUser(user) ){

                console.log( "breaking users.add function, maybe you entered wrong user object" );
                return false;

            }
            var userFile = database.usersDir + "/" + user.id + ".json";
            console.log( "adding chat to database" );
            fs.writeFileSync( userFile, JSON.stringify(user) );
            return true;


        },

        /**
         * @param {Number|String} userId The user id of the user.
         */
        delete : function(userId){

            var userFile = database.usersDir + "/" + userId + ".json";
            if ( !fs.existsSync(userFile) ){

                console.log( "breaking chats.delete function, " + chatFile + " file does not exhist" )
                return false;

            }

            console.log( "Removing a chat from database" );
            fs.unlinkSync( userFile );
            return true;

        },

        /*todo this (return true or false)
        exhist : function(userId){

            var userFile = database.chatsDir + "/" + userId + ".json";
            if( fs.existsSync() )

        }*/

    }
    
    

}



module.exports = database;
