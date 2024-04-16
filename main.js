const {parseCommand, getAdmins} = require( __dirname + "/api/utils.js" );
const EventEmitter = require("node:events");
const getDatabase = require( "./api/database.js" );
const RM = require("./api/rolesManager.js");
const TR = require("./api/tagResolver.js")
const { anonymizeAdmins, removeBotAdmins } = require("./api/utils.js");
  
  

async function main(config) {


  
    const GHbot = new EventEmitter();


    
    

    console.log("Starting a bot...")
    const TelegramBot = require('node-telegram-bot-api');
    
    // Create a bot that uses 'polling' to fetch new updates
    const TGbot = new TelegramBot(config.botToken, {polling: true});
    const bot = await TGbot.getMe()


    //load database
    var db = getDatabase(config);
    console.log("log db path");
    console.log(db.dir)


    //some simplified variables
    l = global.LGHLangs;



    TGbot.on( "message", async (msg, metadata) => {

        TR.log(msg)

        var from = msg.from;
        msg.chat.isGroup =  (msg.chat.type == "supergroup" || msg.chat.type == "group")
        var isGroup = msg.chat.isGroup;

        if ( !db.users.exhist( from.id ) )
            db.users.add( from );
        var user = Object.assign( {},  db.users.get( from.id ), msg.from );

        if(isGroup && !db.chats.exhist( msg.chat.id ))
        {    
            console.log( "Adding new group to database" );

            msg.chat.lang = config.reserveLang;
            if(msg.hasOwnProperty("new_chat_member") && msg.new_chat_members.some(user=>{user.id==bot.id}))//If possible inherit lang from who added the bot
                msg.chat.lang = user.lang;
            console.log( "Group lang: " + msg.chat.lang )

            db.chats.add(msg.chat);
            msg.chat = db.chats.get(msg.chat.id)

            var adminList = await getAdmins(TGbot, msg.chat.id);
            var anonAdminList = anonymizeAdmins(JSON.parse(JSON.stringify(adminList)))
            msg.chat.admins = anonAdminList;
            msg.chat = RM.reloadAdmins(msg.chat, adminList);
            db.chats.update(msg.chat);
            
            await TGbot.sendMessage(msg.chat.id, l[msg.chat.lang].NEW_GROUP,
            { 
                parse_mode : "HTML",
                reply_markup :
                {
                    inline_keyboard :
                    [
                        [ {text: l[msg.chat.lang].ADV_JOIN_CHANNEL, url: "https://t.me/LibreGroupHelp"} ]
                    ] 
                } 
            }
            )

            TGbot.sendMessage(msg.chat.id, l[msg.chat.lang].SETUP_GUIDE,
                { 
                    parse_mode : "HTML",
                    reply_markup :
                    {
                        inline_keyboard :
                        [
                            [
                                {text: l[msg.chat.lang].LANGS_BUTTON2, callback_data: "LANGS_BUTTON:"+msg.chat.id},
                                {text: l[msg.chat.lang].SETTINGS_BUTTON, callback_data: "SETTINGS_SELECT:"+msg.chat.id},
                            ]
                        ] 
                    } 
                }
            )
     
        }
        var chat = Object.assign( {}, ((msg.chat.isGroup ? db.chats.get( msg.chat.id ) : {})), msg.chat );
        
        var command = parseCommand(msg.text || "");
        msg.command = command;

        
        if ( msg.chat.type == "private" ){


            /**
             * @event GHBot#private
             * @type {object}
             * @property {boolean} msg - Indicates whether the snowball is tightly packed.
             * @fires private
             */
            GHbot.emit( "private", msg, chat, user );


            //if no-one is expecting a message from user
            if( user.waitingReply == false )
            {

                TGbot.sendMessage(user.id, l[user.lang].PRESENTATION.replace("{name}",user.first_name+" "+(user.last_name||"")),
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
            else console.log("message from waitingReply user: " + user.waitingReplyType);

            //if is a message directed to support
            if( (user.waitingReply == true && user.waitingReplyType == "SUPPORT") ||
                (msg.hasOwnProperty("reply_to_message") && String(msg.reply_to_message.text).startsWith("#Support")) )
            {

                //broadcast message to every bot staff members
                config.botStaff.forEach( async (stafferId) => {

                    var sentMsg = await TGbot.forwardMessage(stafferId, chat.id, msg.message_id );

                    /*note: this make a little privacy problem because the first name and last name will be left on telegram message so, we
                    may want to store this message id and set a timer for delete/edit (removing first and last name) from message after 6 months?
                    or more? or less? */
                    var text = "#id" + from.id + " " + msg.message_id + "\n" +
                    "<b><i>From: </i></b>" + from.first_name + (from.last_name ? " "+from.last_name : "") + "\n" +
                    "👤Support request message\nReply to this message to reply the user.";
                    
                    TGbot.sendMessage(stafferId, text,
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

                var lines = msg.reply_to_message.text.split(/\r?\n/);
                var toReplyUserId = lines[0].split(" ")[0].replace("#id", "");
                var toReplyMessageId = lines[0].split(" ")[1];
                var fullNameUser = lines[1].replace("From: ","");

                var toReplyUser = db.users.get( toReplyUserId );

                //message directed to user
                TGbot.sendMessage( toReplyUserId, "#Support\n<i>" + l[toReplyUser.lang].SUPPORT_RECEIVED + "</i>\n\n" + msg.text, {
                    parse_mode: "HTML",
                    reply_to_message_id : toReplyMessageId
                });

                //confirmation message back to staffer 
                TGbot.sendMessage( from.id, "Reply successfully sent." );

                //let know all other staffers that a staffer replyed the user
                config.botStaff.forEach( (stafferId) => { if( stafferId != from.id ){

                    var text = from.first_name + " " + (from.last_name || "") + " [<code>" + from.id + "</code>] has answered to\n" +
                    fullNameUser + " [<code>" + toReplyUserId + "</code>] with:\n\n" +
                    "<i>" + msg.text + "</i>";

                    TGbot.sendMessage(stafferId, text,
                        { 
                            parse_mode : "HTML",
                        }
                    )

                } } )

            }
            

        }

        if( isGroup || (user.waitingReply == true &&  user.waitingReplyType.includes(":")) )
        {
            var selectedChat = isGroup ? chat : db.chats.get(user.waitingReplyType.split(":")[1]);
            user.perms = RM.sumUserPerms(selectedChat, user.id);
        }

        //add any new chat user
        if(chat.users && !chat.users.hasOwnProperty(user.id))
        {
            chat.users[user.id] = RM.newUser(msg.from);
            db.chats.update(chat);
        }

        GHbot.emit( "message", msg, chat, user );
        

    } );

    TGbot.on( "callback_query", (cb) => {

        var msg = cb.message;
        var from = cb.from;
        var chat = msg.chat;
        var isGroup = (chat.type == "group" || chat.type == "supergroup")
        chat.isGroup = isGroup;

        if ( !db.users.exhist( from.id ) ){

            db.users.add( from );

        };

        var user = Object.assign( {},  db.users.get( from.id ), from );
        var chat = Object.assign( {}, ((chat.isGroup ? db.chats.get( chat.id ) : {})), chat );

        var lang = user.lang;

        console.log("Callback data: " + cb.data)

        if( isGroup ){
            chat = db.chats.get( chat.id );
            lang = chat.lang;
        };

        //take it for granted that if user clicks a button he's not going to send another message as input
        if( user.waitingReply == true )
        {
            user.waitingReply = false;
            db.users.update(user);
        }

        if( cb.data == "MENU" )
        {

            TGbot.editMessageText( l[lang].PRESENTATION.replace("{name}",user.first_name+" "+(user.last_name||"")), 
                {
                    message_id : msg.message_id,
                    chat_id : chat.id,
                    parse_mode : "HTML",
                    reply_markup :
                    {
                        inline_keyboard :
                        [
                            [{text: l[lang].ADD_ME_TO_A_GROUP_BUTTON, url: "https://t.me/" + bot.username + "?startgroup=true"}],
                            [{text: l[lang].GROUP_BUTTON, url: "https://t.me/LibreGHelp" }, {text: l[lang].CHANNEL_BUTTON, url: "https://t.me/LibreGroupHelp"}],
                            [{text: l[lang].SUPPORT_BUTTON, callback_data: "SUPPORT_BUTTON"}, {text: l[lang].INFO_BUTTON, callback_data: "INFO_BUTTON"}],
                            [{text: l[lang].LANGS_BUTTON, callback_data: "LANGS_BUTTON"}]
                        ] 
                    } 
                }
            )
            TGbot.answerCallbackQuery(cb.id);

        }

        if( cb.data == "SUPPORT_BUTTON" )
        {

            user.waitingReply = true;
            user.waitingReplyType = "SUPPORT";
            db.users.update(user);

            TGbot.editMessageText( l[lang].SUPPORT_MESSAGE, 
                {
                    message_id : msg.message_id,
                    chat_id : chat.id,
                    parse_mode : "HTML",
                    reply_markup : 
                    {
                        inline_keyboard :
                        [
                            [{text: l[lang].CANCEL_BUTTON, callback_data: "MENU"}],
                        ] 
                    } 
                }
            )
            TGbot.answerCallbackQuery(cb.id);

        }

        if( cb.data == "INFO_BUTTON" )
        {

            TGbot.editMessageText( l[lang].INFO, 
                {
                    message_id : msg.message_id,
                    chat_id : chat.id,
                    parse_mode : "HTML",
                    reply_markup : 
                    {
                        inline_keyboard :
                        [
                            [{text: l[lang].SUPPORT_ABOUT_BUTTON, callback_data: "SUPPORT_BUTTON"}],
                            [{text: l[lang].COMMANDS_BUTTON, callback_data: "NOT_IMPLEMENTED"}],
                            [{text: l[lang].BACK_BUTTON, callback_data: "MENU"}],
                        ] 
                    } 
                }
            )
            TGbot.answerCallbackQuery(cb.id);

        }


        if(isGroup || cb.data.includes(":"))
        {
            var selectedChat = isGroup ? chat : db.chats.get(cb.data.split(":")[1]);
            user.perms = RM.sumUserPerms(selectedChat, user.id);
        }
        GHbot.emit( "callback_query", cb, chat, user );

        //todo: commands help panel

    } )


    
    TGbot.on( "new_chat_members", async (msg) => {

        var chat = msg.chat;
        var from = msg.from;

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

    //module.exports = TGbot;

    return { GHbot, TGbot, db };

}

module.exports = main;

//module.exports = {GHbot : GHbot, TGbot : TGbot};
