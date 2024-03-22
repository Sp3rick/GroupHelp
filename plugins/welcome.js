var LGHelpTemplate = require("../GHbot.js")
const {IsEqualInsideAnyLanguage, isAdminOfChat} = require( "../api/utils.js" );
const MSGMK = require( "../api/MessageMaker.js" )

function main(args)
{

    var {GHbot, TGbot, db, config} = new LGHelpTemplate(args);

    l = global.LGHLangs; //importing langs object

    GHbot.on( "message", (msg, chat, user) => {

        var command = msg.command;

        if( !user.waitingReply ) return;
        if( !user.waitingReplyType.startsWith("S_WELCOME") ) return;

        var settingsChatId = user.waitingReplyType.split(":")[1];
        if( chat.isGroup && settingsChatId != chat.id ) return;//additional security guard
        var settingsChat = db.chats.get(settingsChatId)

        if( !isAdminOfChat(settingsChat, user.id) ) return;

        var {customMessage, user, updateMSGMK, updateUser} = MSGMK.messageEvent(TGbot, settingsChat.welcome.message, msg, chat, user, "S_WELCOME");

        settingsChat.welcome.message = customMessage;
        if(updateMSGMK) db.chats.update(settingsChat);
        if(updateUser) db.users.update(user);

    } )


    GHbot.on( "callback_query", (cb, chat, user) => {

        var msg = cb.message;
        var lang = user.lang;

        var settingsChatId = {};
        var settingsChat = {};

        if( cb.data.startsWith("S_WELCOME") )
        {

            settingsChatId = cb.data.split(":")[1]
            settingsChat = db.chats.get(settingsChatId)

        }

        if( cb.data.startsWith("S_WELCOME_OFF:") )
        {
            if(settingsChat.welcome.state == false)
            {
                TGbot.answerCallbackQuery(cb.id);
                return;
            }
            settingsChat.welcome.state = false;
            db.chats.update(settingsChat)
        }

        if( cb.data.startsWith("S_WELCOME_ON:") )
        {
            if(settingsChat.welcome.state == true)
            {
                TGbot.answerCallbackQuery(cb.id);
                return;
            }
            settingsChat.welcome.state = true;
            db.chats.update(settingsChat)
        }
        if( cb.data.startsWith("S_WELCOME_ALWAYS:") )
        {
            if(settingsChat.welcome.once == false)
            {
                TGbot.answerCallbackQuery(cb.id);
                return;
            }
            settingsChat.welcome.once = false;
            db.chats.update(settingsChat)
        }
        if( cb.data.startsWith("S_WELCOME_ONCE:") )
        {
            if(settingsChat.welcome.once == true)
            {
                TGbot.answerCallbackQuery(cb.id);
                return;
            }
            settingsChat.welcome.once = true;
            db.chats.update(settingsChat)
        }
        if( cb.data.startsWith("S_WELCOME_DELETESWITCH:") )
        {
            settingsChat.welcome.clean = !settingsChat.welcome.clean;
            db.chats.update(settingsChat)
        }

        if( cb.data.startsWith("S_WELCOME_") )
        {

            var text = l[lang].WELCOME_SETTING+"\n\n<b>"+l[lang].STATUS+":</b> ";
            text += settingsChat.welcome.state ? l[lang].ON : l[lang].OFF;
            text += "\n<b>"+l[lang].MODE+":</b> ";
            text += settingsChat.welcome.once ? l[lang].W_SEND_ONCE : l[lang].W_SEND_EVERYTIME;
        
            var deleteSwitchButtonName = l[lang].DELETE_LAST_MESSAGE_BUTTON+" "+(settingsChat.welcome.clean?"✔️":"✖️");
            TGbot.editMessageText( text, 
                {
                    message_id : msg.message_id,
                    chat_id : chat.id,
                    parse_mode : "HTML",
                    reply_markup : 
                    {
                        //TODO: buildare tastiera del welcome
                        inline_keyboard :
                        [
                            [{text: l[lang].TURN_OFF_BUTTON, callback_data: "S_WELCOME_OFF:"+settingsChatId}, {text: l[lang].TURN_ON_BUTTON, callback_data: "S_WELCOME_ON:"+settingsChatId} ],
                            [{text: l[lang].RULES_CHANGE_BUTTON, callback_data: "S_WELCOME#MSGMK:"+settingsChatId}],
                            [{text: l[lang].ALWAYS_SEND_BUTTON, callback_data: "S_WELCOME_ALWAYS:"+settingsChatId}, {text: l[lang].FIRSTJOIN_SEND_BUTTON, callback_data: "S_WELCOME_ONCE:"+settingsChatId}],
                            [{text: deleteSwitchButtonName, callback_data: "S_WELCOME_DELETESWITCH:"+settingsChatId}],
                            [{text: l[lang].BACK_BUTTON, callback_data: "SETTINGS_HERE:"+settingsChatId}],
                        ] 
                    } 
                }
            )
            TGbot.answerCallbackQuery(cb.id);

        }

        if( cb.data.startsWith("S_WELCOME#MSGMK") )
        {

            var returnButtons = [[{text: l[lang].BACK_BUTTON, callback_data: "S_WELCOME_BUTTON:"+settingsChatId}]];
            var {customMessage, user, updateMSGMK, updateUser} =
            MSGMK.callbackEvent(TGbot, settingsChat.welcome.message, cb, chat, user, "S_WELCOME", returnButtons, l[lang].WELCOME)

            settingsChat.welcome.message = customMessage;
            if(updateMSGMK) db.chats.update(settingsChat);
            if(updateUser) db.users.update(user);

        }

    })

    

}

module.exports = main;
