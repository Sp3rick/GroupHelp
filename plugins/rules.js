var LGHelpTemplate = require("../GHbot.js")
const {IsEqualInsideAnyLanguage, isAdminOfChat} = require( "../api/utils.js" );
const {MessageMakerCallback, MessageMakerMSG, MessageMakerSendMessage} = require( "../api/MessageMaker.js" )

function main(args)
{

    var {GHbot, TGbot, db, config} = new LGHelpTemplate(args);

    l = global.LGHLangs; //importing langs object

    GHbot.on( "message", (msg, chat, user) => {

        var command = msg.command;

        if ( chat.isGroup ){

            if( command && IsEqualInsideAnyLanguage(command.name, "COMMAND_RULES") )
                MessageMakerSendMessage(TGbot, chat.id, chat.rules, chat.lang);

        }


        if( !user.waitingReply ) return;
        if( !user.waitingReplyType.startsWith("S_RULES") ) return;

        var settingsChatId = user.waitingReplyType.split(":")[1];
        if( chat.isGroup && settingsChatId != chat.id ) return;//additional security guard
        var settingsChat = db.chats.get(settingsChatId)

        if( !isAdminOfChat(settingsChat, user.id) ) return;

        var {MSGMK, user, updateMSGMK, updateUser} = MessageMakerMSG(TGbot, settingsChat.rules, msg, chat, user, "S_RULES");

        settingsChat.rules = MSGMK;
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
                            [{text: l[lang].RULES_CHANGE_BUTTON, callback_data: "S_RULES_MKMSG:"+settingsChatId}],
                            //TODO: when it's done, add button to edit /rules command permission
                            [{text: l[lang].BACK_BUTTON, callback_data: "SETTINGS_HERE:"+settingsChatId}],
                        ] 
                    } 
                }
            )
            TGbot.answerCallbackQuery(cb.id);

        }

        if( cb.data.startsWith("S_RULES_MKMSG") )
        {

            var returnButton = [[{text: l[lang].BACK_BUTTON, callback_data: "S_RULES_BUTTON:"+settingsChatId}]];
            var {MSGMK, user, updateMSGMK, updateUser} = MessageMakerCallback(TGbot, settingsChat.rules, cb, chat, user, "S_RULES", "<b>"+l[lang].REGULATION+"</b>", returnButton)

            settingsChat.rules = MSGMK;
            if(updateMSGMK) db.chats.update(settingsChat);
            if(updateUser) db.users.update(user);

        }

    })

    

}

module.exports = main;
