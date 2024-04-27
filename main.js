var LGHelpTemplate = require("./GHbot.js");
const {parseCommand} = require( __dirname + "/api/utils.js" );
const EventEmitter = require("node:events");
const getDatabase = require( "./api/database.js" );
const RM = require("./api/rolesManager.js");
const TR = require("./api/tagResolver.js");
const TelegramBot = require('node-telegram-bot-api');
const {loadChatUserId, tag, getOwner, keysArrayToObj, isChatAllowed } = require("./api/utils.js");
  

async function main(config) {

    config.chatWhitelist = keysArrayToObj(config.chatWhitelist);
    config.chatBlacklist = keysArrayToObj(config.chatBlacklist);
    


    const GroupHelpBot = new EventEmitter();
    GroupHelpBot.setMaxListeners(100);
    
    

    console.log("Starting a bot...")
    
    var TGbot = new TelegramBot(config.botToken, {polling: true});
    await TGbot.setWebHook("",{allowed_updates: JSON.stringify(["message", "edited_channel_post", "callback_query", "message_reaction", "message_reaction_count", "chat_member"])})
    const bot = await TGbot.getMe();
    TGbot.me = bot;


    //load database
    var db = getDatabase(config);
    console.log("log db path");
    console.log(db.dir)

    const GHbot = new LGHelpTemplate({GHbot: GroupHelpBot, TGbot, db, config});

    //load tagResolver
    TR.load(config);

    //some simplified variables
    l = global.LGHLangs;


    TGbot.on( "message", async (msg, metadata) => {

        if(!isChatAllowed(config, msg.chat.id)) return;
        
        TR.logMsg(msg)

        var from = msg.from;
        var chat = msg.chat;
        var isGroup =  (chat.type == "supergroup" || chat.type == "group");
        chat.isGroup = isGroup;

        //configuring user
        if ( !db.users.exhist( from.id ) )
            db.users.add( from );
        var user = Object.assign( {},  db.users.get( from.id ), msg.from );
        if(user.waitingReply)
        {
            if(user.waitingReply !== true && user.waitingReply != chat.id)
                    user.waitingReply = false;
            else
            {
                console.log("message from waitingReply user: " + user.waitingReplyType);
                user.waitingReply = true;
            }
        }
            

        //handle new chats
        if(isGroup && (config.overwriteChatDataIfReAddedToGroup || !db.chats.exhist( chat.id )))
        {    
            console.log( "Adding new group to database" );

            //configure group lang
            chat.lang = config.reserveLang;
            var isAdderUserKnown = msg.hasOwnProperty("new_chat_member") && msg.new_chat_members.some(user=>{user.id==bot.id});
            if(isAdderUserKnown)//If possible inherit lang from who added the bot
                chat.lang = user.lang;
            console.log( "Group lang: " + chat.lang )

            db.chats.add(chat);
            chat = db.chats.get(chat.id)

            //add admins
            var adminList = await TR.getAdmins(TGbot, chat.id, db);
            chat = RM.reloadAdmins(chat, adminList);
            db.chats.update(chat);

            var creator = getOwner(adminList);
            var newGroupText = l[chat.lang].NEW_GROUP;
            newGroupText = (creator && !creator.is_anonymous) ? newGroupText.replace("{owner}",tag(".",creator.user.id)) : ".";
            
            await GHbot.sendMessage(user.id, chat.id, newGroupText,{parse_mode:"HTML",
                reply_markup :{inline_keyboard:[[{text: l[chat.lang].ADV_JOIN_CHANNEL, url: "https://t.me/LibreGroupHelp"}]]}
            })
            GHbot.sendMessage(user.id, chat.id, l[chat.lang].SETUP_GUIDE,{parse_mode:"HTML",
                reply_markup :{inline_keyboard :[[
                            {text: l[chat.lang].LANGS_BUTTON2, callback_data: "LANGS_BUTTON:"+chat.id},
                            {text: l[chat.lang].SETTINGS_BUTTON, callback_data: "SETTINGS_SELECT:"+chat.id}]]}
            })
     
        }
        chat = Object.assign( {}, ((chat.isGroup ? db.chats.get( chat.id ) : {})), chat );
        
        //configuring msg.command and msg.command.target
        var command = parseCommand(msg.text || "");
        msg.command = command;
        msg.command.target = false;
        var targetId = TR.getCommandTargetUserId(msg);
        if(targetId)
        {
            msg.command.target = {
                id:targetId,
                name: TR.LGHUserNameByTarget(msg, targetId),
            }
            if(isGroup) msg.command.target.perms = RM.sumUserPerms(chat, targetId);
            msg.command.target.user = msg.hasOwnProperty("reply_to_message") ? msg.reply_to_message.from : db.users.get(targetId);
            if(!msg.command.target.user) msg.command.target.user = loadChatUserId(TGbot, chat.id, targetId, db);

            //if target is got from args exclude that one responsable
            if(!msg.hasOwnProperty("reply_to_message") && targetId != msg.from.id)
            {
                msg.command.args = (msg.command.splitArgs.length >= 2) ?
                    msg.command.args.split(msg.command.splitArgs[0]+" ")[1] : msg.command.args = "";
                msg.command.splitArgs.shift();   
            }
    
        }

        //add any new chat user
        if(chat.users && !chat.users.hasOwnProperty(user.id))
        {
            chat = RM.addUser(chat, msg.from);
            db.chats.update(chat);
        }

        //configuring user.perms
        var selectedChat;
        if( isGroup || (user.waitingReply == true &&  user.waitingReplyType.includes(":")) )
        {
            selectedChat = isGroup ? chat : db.chats.get(user.waitingReplyType.split(":")[1].split("?")[0]);
            user.perms = RM.sumUserPerms(selectedChat, user.id);
        }

        //configuring user.waitingReplyTarget 
        if( user.waitingReply == true && user.waitingReplyType.includes("?") )
        {
            var wrTargetId = user.waitingReplyType.split("?")[1];
            user.waitingReplyTarget = RM.userIdToTarget(TGbot, selectedChat, wrTargetId, db);
        }

        GroupHelpBot.emit( "message", msg, chat, user );
        if ( chat.type == "private" )
            GroupHelpBot.emit( "private", msg, chat, user );

    } );

    TGbot.on( "callback_query", async (cb) => {

        if(!isChatAllowed(config, cb.message.chat.id)) return;

        TR.logCb(cb);

        console.log("Callback data: " + cb.data)

        var msg = cb.message;
        var from = cb.from;
        var chat = msg.chat;
        chat.isGroup = (chat.type == "group" || chat.type == "supergroup");

        if ( !db.users.exhist( from.id ) )
            db.users.add( from );

        var user = Object.assign( {},  db.users.get( from.id ), from );
        if(chat.isGroup && !db.chats.exhist( chat.id )) return; //drop callbacks from unknown groups
        var chat = Object.assign( {}, ((chat.isGroup ? db.chats.get( chat.id ) : {})), chat );

        //take it for granted that if user clicks a button he's not going to send another message as input
        if( user.waitingReply == chat.id || user.waitingReply === true )
        {
            user.waitingReply = false;
            db.users.update(user);
        }

        //configure user.perms and selectedChat
        var selectedChat;
        if(chat.isGroup || cb.data.includes(":"))
        {
            selectedChat = chat.isGroup ? chat : db.chats.get(cb.data.split(":")[1].split("?")[0]);
            user.perms = RM.sumUserPerms(selectedChat, user.id);
        }

        //configure cb.target
        if(cb.data.includes("?"))
        {
            var targetId = cb.data.split("?")[1];
            cb.target = RM.userIdToTarget(TGbot, selectedChat, targetId, db);
        }

        GroupHelpBot.emit( "callback_query", cb, chat, user );

    } )

    TGbot.on( "left_chat_member", (msg) => {

        if(!isChatAllowed(config, msg.chat.id)) return;

        var chat = msg.chat;
        var from = msg.from;

        var leftMember = msg.left_chat_member;
        if ( leftMember.id == bot.id && config.deleteChatDataAfterBotRemove == true){

            console.log("Bot kicked from chat and config.deleteChatDataAfterBotRemove == true, deleting chat data of group");
            db.chats.delete( chat.id );

        }

    } )

    TGbot.on( "polling_error", (err) => {
        if(err.code == "ETELEGRAM")
        {
            var errDescription = err.response.body.description;
            if(errDescription.includes("Bad Gateway")) console.log("P ETELEGRAM: Bad gateway");
        }
        else if(err.code == "EFATAL")
        {
            console.log("P EFATAL");
        }
        else {console.log(err) + "P OBJ: " + JSON.stringify(err)}
    } )

    TGbot.on( "webhook_error", (err) => {
        if(err.code == "ETELEGRAM")
        {
            var errDescription = err.response.body.description;
            if(errDescription.includes("Forbidden: bot was kicked from the supergroup chat")) console.log("WB ETELEGRAM: "+errDescription);
        }
        else {console.log(err) + "WB OBJ: " + JSON.stringify(err)}
    } )

    return { GHbot: GroupHelpBot, TGbot, db };

}

module.exports = main;