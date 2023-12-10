const fs = require( "fs" );
const TelegramBot = require('node-telegram-bot-api');
const {randomInt, isNumber, isValidChat, isValidUser} = require( global.directory + "/api/utils.js" );

/**
 * @typedef {import("node-telegram-bot-api")} TelegramBot
 */
/**
 *
 * @param {TelegramBot} TGbot - Instance o TelegramBot
 */
function getDatabase(TGbot) {

    //config database directory here
    var dbInnerDir = global.directory;
    var dir = dbInnerDir + "/database";
    var chatsDir = dbInnerDir + "/database/chats";
    var usersDir = dbInnerDir + "/database/users";

    console.log( "Generating folder tree (if not already)..." )
    var dbInnerDirFiles = fs.readdirSync( dbInnerDir );
    if ( !dbInnerDirFiles.includes( "database" ) ){

        fs.mkdirSync( dir );
        console.log( "Generated \"database\" folder" );

    }
    var dbDirFiles = fs.readdirSync( dir )
    if( !dbDirFiles.includes( "chats" ) )
    {

        fs.mkdirSync( chatsDir);
        console.log( "Generated \"database/chats\" folder" );

    }
    if( !dbDirFiles.includes( "users" ) )
    {

        fs.mkdirSync( usersDir);
        console.log( "Generated \"database/users\" folder" );

    }


    //TODO: IF POSSIBLE fuse database.chats and database.users functions
    var database = {

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

            },

            /**
             * @param {TelegramBot.ChatId} ChatId The user id of the user.
             */
            //TODO: optimize get functions to store mostly used chats in a temporary array, if the chat isn't used for too time it get unloaded
            get : function(chatId){

                var chatFile = database.chatsDir + "/" + chatId + ".json";
                if( !database.chats.exhist( chatId ) ){

                    console.log( "breaking user.get, failed to get user data from id " + chatId )
                    return false;

                }
                return JSON.parse( fs.readFileSync( chatFile, "utf-8" ) );
            },

            /**
             * @param {TelegramBot.Chat} chat
             */
            update : async (chat) => {

                var oldChat = database.chats.get( chat.id );
                var newChat = oldChat;

                newChat.title = chat.title;
                newChat.type = chat.type;
                newChat.lang = chat.lang;
                newChat.admins = await ( async () => {
                    
                    var adminList = await TGbot.getChatAdministrators( chat.id );
                    
                    //anonymize admins data
                    for(var i=0; i < adminList.length; ++i)
                    {

                        adminList[i].id = adminList[i].user.id;
                        delete adminList[i].user;
                        adminList[i].user = {id : adminList[i].id} //re-enabling id only for compatibility

                    }

                    return adminList;

                } )()
                console.log( "admins added: " + JSON.stringify(newChat.admins));

                var chatFile = database.chatsDir + "/" + chat.id + ".json";
                console.log( "updating chat to database lang:" + chat.lang );
                fs.writeFileSync( chatFile, JSON.stringify(newChat) )
                return true;

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

                //TODO (maybe) : create dedicated function to initialize the custom user object (so db.user.add will only use that to write to disk)
                //prepare object with all bot needed info// TODO: add to documentation all additional infos of users

                user.lang = "en_en";
                if( user.language_code == "en" ){

                    user.lang = "en_en"

                }//for other langs extend with if else

                //removing some data to anonymize
                delete user.first_name;
                if(user.hasOwnProperty("last_name")) delete user.last_name;
                delete user.username;

                //preparing object finish here//

                var userFile = database.usersDir + "/" + user.id + ".json";
                console.log( "adding user to database lang:" + user.lang );
                fs.writeFileSync( userFile, JSON.stringify(user) );
                return true;


            },
            /**
             * @param {TelegramBot.User} user
             */
            update : function(user){

                if( !isValidUser(user) ){

                    console.log( "breaking users.update function, maybe you entered wrong user object" );
                    return false;

                }

                oldUser = database.users.get( user.id );
                newUser = oldUser;

                newUser.lang = user.lang;
                if( user.hasOwnProperty("premium") ) newUser.premium = user.premium;


                var userFile = database.usersDir + "/" + user.id + ".json";
                console.log( "updating user to database lang:" + user.lang );
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

    return database;


}
module.exports = getDatabase;
