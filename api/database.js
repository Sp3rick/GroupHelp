const fs = require( "fs" );
const TelegramBot = require('node-telegram-bot-api');
const {randomInt, isNumber, isValidChat, isValidUser} = require( global.directory + "/api/utils.js" );

//config database directory here
var dbInnerDir = global.directory;


//TODO: IF POSSIBLE fuse database.chats and database.users functions
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
            console.log( "adding chat to database lang: " + chat.lang );
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


        },

        /**
         * @param {TelegramBot.ChatId} ChatId The user id of the user.
         */
        exhist : function(chatId){

            var chatsFile = database.chatsDir + "/" + chatId + ".json";
            if( fs.existsSync(chatsFile) ){

                return true;

            };
            return false;

        }

    },
    
    users :
    {

        /**
         * @param {TelegramBot.User} user
         */
        add : function(user){

            if( !isValidUser(user) ){

                console.log( "breaking users.add function, maybe you entered wrong user object" );
                return false;

            }

            //TODO (maybe) : create dedicated function to initialize the custom user object (so db.user.add will oly use that to write to disk)
            //prepare object with all bot needed info// TODO: add to documentation all additional infos of users

            user.lang = "en_en";
            if( user.language_code == "en" ){

               user.lang = "en_en"

            }//for other langs extend with if else

            //preparing object finish here//


            var userFile = database.usersDir + "/" + user.id + ".json";
            console.log( "adding user to database lang:" + user.lang );
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

        /**
         * @param {Number|String} userId The user id of the user.
         */
        exhist : function(userId){

            var userFile = database.usersDir + "/" + userId + ".json";
            if( fs.existsSync(userFile) ){

                return true;

            };
            return false;

        },

        /**
         * @param {Number|String} userId The user id of the user.
         */
        get : function(userId){

            var userFile = database.usersDir + "/" + userId + ".json";
            if( !database.users.exhist( userId ) ){

                console.log( "breaking user.get, failed to get user data from id " + userId )
                return false;

            }
            return JSON.parse( fs.readFileSync( userFile, "utf-8" ) );
        }

    }
    
    

}



module.exports = database;
