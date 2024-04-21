var LGHelpTemplate = require("../GHbot.js")
const {checkCommandPerms} = require( "../api/utils.js" );
const MSGMK = require( "../api/MessageMaker.js" )

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    GHbot.onMessage( (msg, chat, user) => {

        var command = msg.command;

        if ( chat.isGroup ){

            if( command && checkCommandPerms(command, "COMMAND_RULES", user.perms) )
                MSGMK.sendMessage(GHbot, user.id, chat.id, chat.rules, l[chat.lang].RULES_TITLE);

        }

        //security guards
        if( !(user.waitingReply && user.waitingReplyType.startsWith("S_RULES")) ) return;
        var settingsChatId = user.waitingReplyType.split(":")[1];
        if( chat.isGroup && settingsChatId != chat.id ) return;//additional security guard
        if( !(user.perms && user.perms.settings) ) return;

        var settingsChat = db.chats.get(settingsChatId)

        var {customMessage, user, updateMSGMK, updateUser} = MSGMK.messageEvent(GHbot, settingsChat.rules, msg, chat, user, "S_RULES");

        settingsChat.rules = customMessage;
        if(updateMSGMK) db.chats.update(settingsChat);
        if(updateUser) db.users.update(user);

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
        
            GHbot.editMessageText( user.id, l[lang].RULES_SETTING, 
                {
                    message_id : msg.message_id,
                    chat_id : chat.id,
                    parse_mode : "HTML",
                    reply_markup : 
                    {
                        inline_keyboard :
                        [
                            [{text: l[lang].RULES_CHANGE_BUTTON, callback_data: "S_RULES#MSGMK:"+settingsChatId}],
                            //TODO: when it's done, add button to edit /rules command permission
                            [{text: l[lang].BACK_BUTTON, callback_data: "SETTINGS_HERE:"+settingsChatId}],
                        ] 
                    } 
                }
            )
            GHbot.answerCallbackQuery(user.id, cb.id);

        }

        if( cb.data.startsWith("S_RULES#MSGMK") )
        {
            
            var returnButtons = [[{text: l[lang].BACK_BUTTON, callback_data: "S_RULES_BUTTON:"+settingsChatId}]];
            var {customMessage, user, updateMSGMK, updateUser} =
            MSGMK.callbackEvent(GHbot, settingsChat.rules, cb, chat, user, "S_RULES", returnButtons, l[lang].REGULATION, l[lang].RULES_TITLE)

            settingsChat.rules = customMessage;
            if(updateMSGMK) db.chats.update(settingsChat);
            if(updateUser) db.users.update(user);

        }

    })

    

}

module.exports = main;
