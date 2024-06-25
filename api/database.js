const fs = require( "fs" );
const TelegramBot = require('node-telegram-bot-api');
const {isValidChat, isValidUser, getUnixTime} = require( global.directory + "/api/utils.js" )
var RM = require("../api/rolesManager.js");

function newSpamObj()
{
    var obj = {
        tgLinks: { usernames:false, bots:false, exceptions:[], punishment:1, PTime:0 },
        links: { usernames:false, bots:false, exceptions:[], punishment:1, PTime:0 },
        forward: {
            channels: {punishment: 0, PTime: 0, delete: false},
            groups: {punishment: 0, PTime: 0, delete: false},
            users: {punishment: 0, PTime: 0, delete: false},
            bots: {punishment: 0, PTime: 0, delete: false},
        },
        quote: {
            channels: {punishment: 0, PTime: 0, delete: false},
            groups: {punishment: 0, PTime: 0, delete: false},
            users: {punishment: 0, PTime: 0, delete: false},
            bots: {punishment: 0, PTime: 0, delete: false},
        },
    }

    return obj;
}

function newCaptchaObj()
{
    var obj = {
        state: false,
        mode: "image",
        time: 3600,
        once: false,
        fails: false,
        punishment: 2,
        PTime: 0,
    }

    return obj;
}

function newGoodbyeObj()
{
    var obj = {
        group: false,
        clear: false,
        lastId: false,
        gMsg: {},
        private: false,
        pMsg: {},
    }

    return obj;
}

function newAlphabetsObj()
{
    var obj = {
        arabic: {punishment: 0, PTime: 0, delete: false},
        cyrillic: {punishment: 0, PTime: 0, delete: false},
        chinese: {punishment: 0, PTime: 0, delete: false},
        latin: {punishment: 0, PTime: 0, delete: false},
    }

    return obj;
}
function update2d5Perms(perms)
{
    perms.alphabets = 0;
    perms.words = 0;
    perms.length = 0;
    return perms;
}
function update2d7d3Perms(perms)
{
    perms.commands.forEach((command, index)=>{
        perms.commands[index] = command.replace("@","*");
    })
    return perms;
}

function updateDatabase(version, versionFile, chatsDir, usersDir)
{
    if(version == "0.2")
    {
        version = "0.2.1";
        console.log("\tupdating from 0.2 to 0.2.1 ...");
    }

    if(version == "0.2.1")
    {
        version = "0.2.4";
        console.log("\tupdating from 0.2.1 to 0.2.4 ...");

        var chatFiles = fs.readdirSync(chatsDir);
        chatFiles.forEach((fileName)=>{
            var file = chatsDir+"/"+fileName;
            var chat = JSON.parse(fs.readFileSync(file, "utf-8"));
            chat.spam = newSpamObj();
            fs.writeFileSync(file, JSON.stringify(chat));
        })
    }

    if(version == "0.2.2")
    {
        version = "0.2.4";
        console.log("\tupdating from 0.2.2 to 0.2.4 ...");

        var chatFiles = fs.readdirSync(chatsDir);
        chatFiles.forEach((fileName)=>{
            var file = chatsDir+"/"+fileName;
            var chat = JSON.parse(fs.readFileSync(file, "utf-8"));

            if(chat.spam.hasOwnProperty("exceptions"))
            {
                chat.spam.tgLinks.exceptions = chat.spam.exceptions;
                delete chat.spam.exceptions;
            }

            fs.writeFileSync(file, JSON.stringify(chat));
        })
    }

    if(version == "0.2.4" || version == "0.2.4.0")
    {
        version = "0.2.4.1";
        console.log("\tupdating from 0.2.4 to 0.2.4.1 ...");

        var chatFiles = fs.readdirSync(chatsDir);
        chatFiles.forEach((fileName)=>{
            var file = chatsDir+"/"+fileName;
            var chat = JSON.parse(fs.readFileSync(file, "utf-8"));
            chat.captcha = newCaptchaObj();
            fs.writeFileSync(file, JSON.stringify(chat));
        })
    }

    if(version == "0.2.4.1")
    {
        version = "0.2.5";
        console.log("\tupdating from 0.2.4.1 to 0.2.5 ...");

        var chatFiles = fs.readdirSync(chatsDir);
        chatFiles.forEach((fileName)=>{
            var file = chatsDir+"/"+fileName;
            var chat = JSON.parse(fs.readFileSync(file, "utf-8"));
            chat.goodbye = newGoodbyeObj();
            fs.writeFileSync(file, JSON.stringify(chat));
        })
    }

    if(version == "0.2.5")
    {
        version = "0.2.6";
        console.log("\tupdating from 0.2.5 to 0.2.6 ...");

        var chatFiles = fs.readdirSync(chatsDir);
        chatFiles.forEach((fileName)=>{
            var file = chatsDir+"/"+fileName;
            var chat = JSON.parse(fs.readFileSync(file, "utf-8"));
            chat.alphabets = newAlphabetsObj();
            chat.basePerms = update2d5Perms(chat.basePerms);
            if(chat.adminPerms) chat.adminPerms = update2d5Perms(chat.adminPerms);
            Object.keys(chat.users).forEach(userId=>{
                chat.users[userId].perms = update2d5Perms(chat.users[userId].perms);
                chat.users[userId].adminPerms = update2d5Perms(chat.users[userId].adminPerms);
            })
            Object.keys(chat.roles).forEach(role=>{
                if(chat.roles[role].perms) chat.roles[role].perms = update2d5Perms(chat.roles[role].perms);
            })
            fs.writeFileSync(file, JSON.stringify(chat));
        })
    }

    if(version == "0.2.6")
    {
        version = "0.2.7";
        console.log("\tupdating from 0.2.6 to 0.2.7 ...");

        var chatFiles = fs.readdirSync(chatsDir);
        chatFiles.forEach((fileName)=>{
            var file = chatsDir+"/"+fileName;
            var chat = JSON.parse(fs.readFileSync(file, "utf-8"));
            chat.media = {};
            fs.writeFileSync(file, JSON.stringify(chat));
        })
    }

    if(version == "0.2.7")
    {
        version = "0.2.7.3";
        console.log("\tupdating from 0.2.7 to 0.2.7.3 ...");

        var chatFiles = fs.readdirSync(chatsDir);
        chatFiles.forEach((fileName)=>{
            var file = chatsDir+"/"+fileName;
            var chat = JSON.parse(fs.readFileSync(file, "utf-8"));
            chat.alphabets = newAlphabetsObj();
            chat.basePerms = update2d7d3Perms(chat.basePerms);
            chat.basePerms.commands.push("COMMAND_RELOAD");
            if(chat.adminPerms) chat.adminPerms = update2d7d3Perms(chat.adminPerms);
            Object.keys(chat.users).forEach(userId=>{
                chat.users[userId].perms = update2d7d3Perms(chat.users[userId].perms);
                chat.users[userId].adminPerms = update2d7d3Perms(chat.users[userId].adminPerms);
                chat.users[userId].waitingReply = false;
            })
            Object.keys(chat.roles).forEach(role=>{
                if(chat.roles[role].perms) chat.roles[role].perms = update2d7d3Perms(chat.roles[role].perms);
            })
            fs.writeFileSync(file, JSON.stringify(chat));
        })

        var userFiles = fs.readdirSync(usersDir);
        userFiles.forEach((fileName)=>{
            var file = usersDir+"/"+fileName;
            var user = JSON.parse(fs.readFileSync(file, "utf-8"));
            if(user.hasOwnProperty("waitingReplyType"))
                delete user.waitingReplyType;
            user.waitingReply = false;
            fs.writeFileSync(file, JSON.stringify(user));
        });
            
    }

    //add new if here to update from latest dbVersion to new


    fs.writeFileSync(versionFile, version);
}

/**
 * @typedef {import("node-telegram-bot-api")} TelegramBot
 */

function getDatabase(config) {

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
    var exhistChatsFolder = fs.existsSync(chatsDir);
    if( !exhistChatsFolder )
    {

        fs.mkdirSync(chatsDir);
        console.log( "Generated \"database/chats\" folder" );

    }
    var exhistUsersFolder = fs.existsSync(usersDir);
    if( !exhistUsersFolder)
    {

        fs.mkdirSync(usersDir);
        console.log( "Generated \"database/users\" folder" );

    }

    console.log("Updating database if it's too old...")
    var dbVersion = "";
    var versionFile = dir+"/version";
    var dbDirFiles = fs.readdirSync( dir )
    if( !dbDirFiles.includes( "version") )
        dbVersion = "0.2";
    else
        dbVersion = fs.readFileSync(versionFile);
    updateDatabase(dbVersion, versionFile, chatsDir, usersDir);

    global.DBCHATS = {};

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

                
                chat.admins = [];
                chat.lang = config.reserveLang;
                chat.currency = "USD";
                chat.users = {};
                chat.basePerms = RM.newPerms(["@COMMAND_RULES", "@COMMAND_ME", "@COMMAND_STAFF"]);
                chat.adminPerms = RM.newPerms(["COMMAND_RULES", "@COMMAND_ME", "COMMAND_STAFF", "COMMAND_PERMS"]);
                chat.roles = RM.newPremadeRolesObject();
                chat.warns = { timed:{}, count:{}, limit:3, punishment:3, PTime: 0 };
                chat.rules = {};
                chat.welcome = { state:false, once:false, clean:false, joinList:[], lastWelcomeId:false, message:{} };
                chat.flood = { messages:3, time:5, punishment:1, PTime: 1800, delete:true }
                chat.spam = newSpamObj();
                chat.captcha = newCaptchaObj();
                chat.goodbye = newGoodbyeObj();
                chat.alphabets = newAlphabetsObj();
                chat.media = {};
                
                var chatFile = database.chatsDir + "/" + chat.id + ".json";
                console.log( "adding chat to database lang: " + chat.lang );
                fs.writeFileSync( chatFile, JSON.stringify(chat) )

                return true;
                
            },

            /**
             * @param {TelegramBot.ChatId} chatId The chat id of the user.
             */
            delete : function(chatId){

                if(global.DBCHATS.hasOwnProperty(chatId))
                    delete global.DBCHATS[chatId];

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
                var now = getUnixTime();

                if(global.DBCHATS.hasOwnProperty(chatId))
                {
                    global.DBCHATS[chatId].lastUse = now;
                    return true;
                }

                var chatsFile = database.chatsDir + "/" + chatId + ".json";
                if( fs.existsSync(chatsFile) )
                    return true;

                return false;

            },

            /**
             * @param {TelegramBot.ChatId} ChatId The user id of the user.
             */
            get : function(chatId){
                var now = getUnixTime();

                if(global.DBCHATS.hasOwnProperty(chatId))
                {
                    global.DBCHATS[chatId].lastUse = now;
                    return global.DBCHATS[chatId];
                }

                var chatFile = database.chatsDir + "/" + chatId + ".json";
                if( !database.chats.exhist( chatId ) ){
                    console.log( "breaking chats.get, failed to get chat data from id " + chatId )
                    return false;
                }

                var chat = JSON.parse(fs.readFileSync( chatFile, "utf-8" ));
                global.DBCHATS[chatId] = chat;
                global.DBCHATS[chatId].lastUse = now;
                return chat;
            },

            /**
             * @param {TelegramBot.Chat} chat
             */
            update : async (chat) => {
                var now = getUnixTime();

                var oldChat = database.chats.get( chat.id ); //check if exhist and be sure to load it
                if(oldChat == false)
                {
                    console.log("the updated chat does not exhist " + chat.id);
                    return false;
                }

                //this allow the caller to edit single elements of chat (chat.id is required)
                if(chat.hasOwnProperty("title")) global.DBCHATS[chat.id].title = chat.title;
                if(chat.hasOwnProperty("type")) global.DBCHATS[chat.id].type = chat.type;
                if(chat.hasOwnProperty("admins")) global.DBCHATS[chat.id].admins = chat.admins;
                if(chat.hasOwnProperty("lang")) global.DBCHATS[chat.id].lang = chat.lang;
                if(chat.hasOwnProperty("users")) global.DBCHATS[chat.id].users = chat.users;
                if(chat.hasOwnProperty("basePerms")) global.DBCHATS[chat.id].basePerms = chat.basePerms;
                if(chat.hasOwnProperty("roles")) global.DBCHATS[chat.id].roles = chat.roles;
                if(chat.hasOwnProperty("warns")) global.DBCHATS[chat.id].warns = chat.warns;
                if(chat.hasOwnProperty("rules")) global.DBCHATS[chat.id].rules = chat.rules;
                if(chat.hasOwnProperty("welcome")) global.DBCHATS[chat.id].welcome = chat.welcome;
                if(chat.hasOwnProperty("flood")) global.DBCHATS[chat.id].flood = chat.flood;
                if(chat.hasOwnProperty("spam")) global.DBCHATS[chat.id].spam = chat.spam;
                if(chat.hasOwnProperty("captcha")) global.DBCHATS[chat.id].captcha = chat.captcha;
                if(chat.hasOwnProperty("goodbye")) global.DBCHATS[chat.id].goodbye = chat.goodbye;
                if(chat.hasOwnProperty("alphabets")) global.DBCHATS[chat.id].alphabets = chat.alphabets;
                if(chat.hasOwnProperty("media")) global.DBCHATS[chat.id].media = chat.media;

                global.DBCHATS[chat.id].lastUse = now;

                return true;

            },

            //write on disk
            /**
             * @param {TelegramBot.ChatId} ChatId The user id of the user.
             */
            save : function (chatId)
            {
                if(!global.DBCHATS.hasOwnProperty(chatId)) return false;
                var chatFile = database.chatsDir + "/" + chatId + ".json";
                console.log( "saving chat to database, id:" + chatId );
                var lastUse = global.DBCHATS[chatId].lastUse; 
                delete global.DBCHATS[chatId].lastUse;
                fs.writeFileSync( chatFile, JSON.stringify(global.DBCHATS[chatId]) )
                global.DBCHATS[chatId].lastUse = lastUse
                return true;
            },

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

                user.waitingReply = false;
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
             * @param {TelegramBot.User} user
             */
            update : function(user){

                if( !isValidUser(user) ){

                    console.log( "breaking users.update function, maybe you entered wrong user object" );
                    return false;

                }

                var oldUser = database.users.get( user.id );
                var newUser = oldUser;

                if( user.hasOwnProperty("lang") ) newUser.lang = user.lang;
                if( user.hasOwnProperty("premium") ) newUser.premium = user.premium;
                if( user.hasOwnProperty("waitingReply") ) newUser.waitingReply = user.waitingReply;


                var userFile = database.usersDir + "/" + newUser.id + ".json";
                console.log( "updating user to database lang:" + newUser.lang );
                fs.writeFileSync( userFile, JSON.stringify(newUser) );
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

        },

        unload : function ()
        {
            var ids = Object.keys(global.DBCHATS);
            console.log("unloading " + ids.length + " chats");
            console.log(ids)
            ids.forEach((id)=>{
                database.chats.save(id);
                delete global.DBCHATS[id];
            })
        }

    }

    //save on disk every chat (preventing case of uncontrolled crash)
    setInterval( () => {
        var ids = Object.keys(global.DBCHATS);
        ids.forEach((id)=>{
            database.chats.save(id);
        })
    }, config.saveDatabaseSeconds*1000)

    //that's for keep most used chats loaded and allowing database functions spamming
    //this is a clean up for inactive chats to prevent ram from blowing up
    var cleanerIntervalTime = 60000; //milliseconds
    var unloadAfter = 60; //seconds
    setInterval( () => {
        var ids = Object.keys(global.DBCHATS);
        var now = getUnixTime();
        ids.forEach((id)=>{
            var chat = global.DBCHATS[id];
            //console.log(now + " - " + chat.lastUse + " = " + (now - chat.lastUse) + " > " + unloadAfter)
            if( (now - chat.lastUse) > unloadAfter ) 
            {
                console.log("unloading " + id);
                database.chats.save(id);
                delete global.DBCHATS[id];
            }
        })
    }, cleanerIntervalTime )

    return database;


}
module.exports = getDatabase;
