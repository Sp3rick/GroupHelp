var LGHelpTemplate = require("../GHbot.js")
const {IsEqualInsideAnyLanguage, isAdminOfChat} = require( "../api/utils.js" );
const MSGMK = require( "../api/MessageMaker.js" )

function main(args)
{

    var {GHbot, TGbot, db, config} = new LGHelpTemplate(args);

    l = global.LGHLangs; //importing langs object

    GHbot.on( "message", (msg, chat, user) => {

        var command = msg.command;

        if ( chat.isGroup ){

            if( command && IsEqualInsideAnyLanguage(command.name, "COMMAND_RULES") )
                MSGMK.sendMessage(TGbot, chat.id, chat.rules, l[chat.lang].RULES_TITLE);

        }


        if( !user.waitingReply ) return;
        if( !user.waitingReplyType.startsWith("S_RULES") ) return;

        var settingsChatId = user.waitingReplyType.split(":")[1];
        if( chat.isGroup && settingsChatId != chat.id ) return;//additional security guard
        var settingsChat = db.chats.get(settingsChatId)

        if( !isAdminOfChat(settingsChat, user.id) ) return;

        var {customMessage, user, updateMSGMK, updateUser} = MSGMK.messageEvent(TGbot, settingsChat.rules, msg, chat, user, "S_RULES");

        settingsChat.rules = customMessage;
        if(updateMSGMK) db.chats.update(settingsChat);
        if(updateUser) db.users.update(user);

    } )


    GHbot.on( "callback_query", (cb, chat, user) => {

        var msg = cb.message;
        var lang = user.lang;

        var settingsChatId = {};
        var settingsChat = {};

        if( cb.data.startsWith("S_RULES") )
        {

            settingsChatId = cb.data.split(":")[1]
            settingsChat = db.chats.get(settingsChatId)

        }

        if( cb.data.startsWith("S_RULES_BUTTON:") )
        {
        
            TGbot.editMessageText( l[lang].RULES_SETTING, 
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
            TGbot.answerCallbackQuery(cb.id);

        }

        if( cb.data.startsWith("S_RULES#MSGMK") )
        {

            var returnButtons = [[{text: l[lang].BACK_BUTTON, callback_data: "S_RULES_BUTTON:"+settingsChatId}]];
            var {customMessage, user, updateMSGMK, updateUser} =
            MSGMK.callbackEvent(TGbot, settingsChat.rules, cb, chat, user, "S_RULES", returnButtons, l[lang].REGULATION, l[lang].RULES_TITLE)

            settingsChat.rules = customMessage;
            if(updateMSGMK) db.chats.update(settingsChat);
            if(updateUser) db.users.update(user);

        }

    })

    

}

module.exports = main;
