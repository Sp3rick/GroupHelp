const LGHelpTemplate = require("../GHbot.js")
const { getUnixTime } = require( "../api/utils.js" );
const MSGMK = require( "../api/MessageMaker.js" )

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    GHbot.onMessage(async (msg, chat, user) => {

        //NOTE: deactivate this when captcha is enabled +create a function that handle a welcome message
        if(chat.isGroup && chat.welcome.state && msg.hasOwnProperty("new_chat_members") )
        {
            var options = {reply_parameters: { message_id: msg.message_id, chat_id: chat.id }};
            msg.new_chat_members.forEach(async (user) => {

                if(user.is_bot) return;
                if(chat.welcome.once && chat.welcome.joinList.includes(user.id)) return;

                if(chat.welcome.clean && chat.welcome.lastWelcomeId != false)
                    TGbot.deleteMessages(chat.id, [chat.welcome.lastWelcomeId]);

                var sentMessage = await MSGMK.sendMessage(GHbot, user, chat, chat.welcome.message, false, options);
                if(sentMessage)
                {
                    chat.welcome.joinList.push(user.id);
                    chat.welcome.lastWelcomeId = sentMessage.message_id;
                }
                db.chats.update(chat);
                
            });
        }

        //security guards
        if( !(user.waitingReply && user.waitingReplyType.startsWith("S_WELCOME")) ) return;
        var settingsChatId = user.waitingReplyType.split(":")[1];
        if( chat.isGroup && settingsChatId != chat.id ) return;//additional security guard
        if( !(user.perms && user.perms.settings) ) return;

        var settingsChat = db.chats.get(settingsChatId);

        var customMessage = MSGMK.messageEvent(GHbot, settingsChat.welcome.message, msg, chat, user, "S_WELCOME");

        if(customMessage)
        {
            settingsChat.welcome.message = customMessage;
            db.chats.update(settingsChat);
        }

    } )


    GHbot.onCallback( (cb, chat, user) => {

        var msg = cb.message;
        var lang = user.lang;

        var settingsChatId = {};
        var settingsChat = {};

        if( cb.data.startsWith("S_WELCOME") )
        {

            settingsChatId = cb.data.split(":")[1]
            settingsChat = db.chats.get(settingsChatId)

        }

        //security guards
        if( !cb.data.startsWith("S_WELCOME") ) return;
        if( !(user.perms && user.perms.settings) ) return;
        if( chat.isGroup && settingsChatId != chat.id) return;

        if( cb.data.startsWith("S_WELCOME_OFF:") )
        {
            if(settingsChat.welcome.state == false)
            {
                GHbot.answerCallbackQuery(user.id, cb.id);
                return;
            }
            settingsChat.welcome.state = false;
            db.chats.update(settingsChat)
        }
        if( cb.data.startsWith("S_WELCOME_ON:") )
        {
            if(settingsChat.welcome.state == true)
            {
                GHbot.answerCallbackQuery(user.id, cb.id);
                return;
            }
            settingsChat.welcome.state = true;
            db.chats.update(settingsChat)
        }
        if( cb.data.startsWith("S_WELCOME_ALWAYS:") )
        {
            if(settingsChat.welcome.once == false)
            {
                GHbot.answerCallbackQuery(user.id, cb.id);
                return;
            }
            settingsChat.welcome.once = false;
            db.chats.update(settingsChat)
        }
        if( cb.data.startsWith("S_WELCOME_ONCE:") )
        {
            if(settingsChat.welcome.once == true)
            {
                GHbot.answerCallbackQuery(user.id, cb.id);
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
            GHbot.editMessageText(user.id, text, 
                {
                    message_id : msg.message_id,
                    chat_id : chat.id,
                    parse_mode : "HTML",
                    reply_markup : 
                    {
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
            GHbot.answerCallbackQuery(user.id, cb.id);

        }

        if( cb.data.startsWith("S_WELCOME#MSGMK") )
        {
            var returnButtons = [[{text: l[lang].BACK_BUTTON, callback_data: "S_WELCOME_BUTTON:"+settingsChatId}]];
            var customMessage = MSGMK.callbackEvent(GHbot, settingsChat.welcome.message, cb, chat, user, "S_WELCOME", returnButtons, l[lang].WELCOME);
            if(customMessage)
            {
                settingsChat.welcome.message = customMessage;
                db.chats.update(settingsChat);
            }
        }

    })

}

module.exports = main;
