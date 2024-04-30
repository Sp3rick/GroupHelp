var LGHelpTemplate = require("../GHbot.js")
const {checkCommandPerms, sendCommandReply} = require( "../api/utils.js" );
const MSGMK = require( "../api/MessageMaker.js" )
const CMDPerms = require("../api/CommandsPerms.js")

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    GHbot.onMessage( (msg, chat, user) => {

        var command = msg.command;
        var where;

        where = checkCommandPerms(command, "COMMAND_RULES", user.perms);
        if( chat.isGroup && command && where )
        {
            var options = {reply_parameters: {chat_id:chat.id, message_id: msg.message_id, allow_sending_without_reply:true}};
            if(msg.reply_to_message)
            {
                options.reply_parameters.message_id = msg.reply_to_message.message_id;
                options.reply_parameters.chat_id = chat.id;
            }
            var func = (id) => {return MSGMK.sendMessage(GHbot, user, chat, chat.rules, l[chat.lang].RULES_TITLE, options, id)};
            sendCommandReply(where, chat.lang, GHbot, user, chat.id, func);
        }

        //security guards
        if( !(user.waitingReply && user.waitingReplyType.startsWith("S_RULES")) ) return;
        var settingsChatId = user.waitingReplyType.split(":")[1];
        if( chat.isGroup && settingsChatId != chat.id ) return;//additional security guard
        if( !(user.perms && user.perms.settings) ) return;

        var settingsChat = db.chats.get(settingsChatId)

        var customMessage = MSGMK.messageEvent(GHbot, db, settingsChat.rules, msg, chat, user, "S_RULES");

        if(customMessage)
        {
            settingsChat.rules = customMessage;
            db.chats.update(settingsChat);
        }

    } )


    GHbot.onCallback( (cb, chat, user) => {

        var msg = cb.message;
        var lang = user.lang;

        var settingsChatId = {};
        var settingsChat = {};

        if( cb.data.startsWith("S_RULES") )
        {

            settingsChatId = cb.data.split(":")[1]
            settingsChat = db.chats.get(settingsChatId)

        }

        //security guards
        if( !cb.data.startsWith("S_RULES") ) return;
        if( !(user.perms && user.perms.settings) ) return;
        if( chat.isGroup && settingsChatId != chat.id) return;

        if( cb.data.startsWith("S_RULES_BUTTON:") )
        {
        
            GHbot.editMessageText( user.id, l[lang].RULES_SETTING, {
                message_id : msg.message_id,
                chat_id : chat.id,
                parse_mode : "HTML",
                reply_markup : 
                {
                    inline_keyboard :
                    [
                        [{text: l[lang].RULES_CHANGE_BUTTON, callback_data: "S_RULES#MSGMK:"+settingsChatId}],
                        [{text: l[lang].COMMAND_PERMS_BUTTON, callback_data: "S_RULES#CMDPERMS_MENU:"+settingsChatId}],
                        [{text: l[lang].BACK_BUTTON, callback_data: "SETTINGS_HERE:"+settingsChatId}],
                    ] 
                } 
            })
            GHbot.answerCallbackQuery(user.id, cb.id);

        }

        if( cb.data.startsWith("S_RULES#MSGMK") )
        {
            var returnButtons = [[{text: l[lang].BACK_BUTTON, callback_data: "S_RULES_BUTTON:"+settingsChatId}]];
            var title = l[lang].REGULATION;
            var msgTitle = l[lang].RULES_TITLE;
            var customMessage = MSGMK.callbackEvent(GHbot, db, settingsChat.rules, cb, chat, user, "S_RULES", returnButtons, title, msgTitle)

            if(customMessage)
            {
                settingsChat.rules = customMessage;
                db.chats.update(settingsChat);
            }
        }

        if( cb.data.startsWith("S_RULES#CMDPERMS") )
        {
            var returnButtons = [[{text: l[lang].BACK_BUTTON, callback_data: "S_RULES_BUTTON:"+settingsChatId}]];
            var newChat = CMDPerms.callbackEvent(GHbot, db, settingsChat, cb, chat, user, "S_RULES", returnButtons)
            if(newChat) db.chats.update(newChat);
        }

    })

    

}

module.exports = main;
