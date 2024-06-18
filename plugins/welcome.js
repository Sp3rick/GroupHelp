const LGHelpTemplate = require("../GHbot.js")
const { getUnixTime, welcomeNewUser } = require( "../api/utils.js" );
const MSGMK = require( "../api/editors/MessageMaker.js" )

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    GHbot.onMessage(async (msg, chat, user) => {

        //NOTE: deactivate this when captcha is enabled +create a function that handle a welcome message
        if(msg.chat.isGroup && chat.welcome.state && !chat.captcha.state && msg.hasOwnProperty("new_chat_members") )
        {
            msg.new_chat_members.forEach(async (newUser) => {

                var options = {reply_parameters: { message_id: msg.message_id, chat_id: msg.chat.id }};
                welcomeNewUser(GHbot, db, MSGMK, chat, newUser, options);
                
            });
        }

        //security guards
        if(!chat.isGroup) return;
        if( !(user.waitingReply && user.waitingReplyType.startsWith("S_WELCOME")) ) return;
        if( msg.chat.isGroup && chat.id != msg.chat.id ) return;//additional security guard
        if( !(user.perms && user.perms.settings) ) return;

        var customMessage = await MSGMK.messageEvent(GHbot, db, chat.welcome.message, msg, msg.chat, user, "S_WELCOME");

        if(customMessage)
        {
            chat.welcome.message = customMessage;
            db.chats.update(chat);
        }

    } )


    GHbot.onCallback( (cb, chat, user) => {

        var msg = cb.message;
        var lang = user.lang;

        //security guards for settings
        if(!chat.isGroup) return;
        if( !cb.data.startsWith("S_WELCOME") ) return;
        if( !(user.perms && user.perms.settings) ) return;
        if( cb.chat.isGroup && chat.id != cb.chat.id) return;

        if( cb.data.startsWith("S_WELCOME_OFF:") )
        {
            if(chat.welcome.state == false)
            {
                GHbot.answerCallbackQuery(user.id, cb.id);
                return;
            }
            chat.welcome.state = false;
            db.chats.update(chat)
        }
        if( cb.data.startsWith("S_WELCOME_ON:") )
        {
            if(chat.welcome.state == true)
            {
                GHbot.answerCallbackQuery(user.id, cb.id);
                return;
            }
            chat.welcome.state = true;
            db.chats.update(chat)
        }
        if( cb.data.startsWith("S_WELCOME_ALWAYS:") )
        {
            if(chat.welcome.once == false)
            {
                GHbot.answerCallbackQuery(user.id, cb.id);
                return;
            }
            chat.welcome.once = false;
            db.chats.update(chat)
        }
        if( cb.data.startsWith("S_WELCOME_ONCE:") )
        {
            chat.welcome.once = !chat.welcome.once ;
            db.chats.update(chat)
        }
        if( cb.data.startsWith("S_WELCOME_DELETESWITCH:") )
        {
            chat.welcome.clean = !chat.welcome.clean;
            db.chats.update(chat)
        }

        if( cb.data.startsWith("S_WELCOME_") )
        {

            var text = l[lang].WELCOME_SETTING+"\n\n<b>"+l[lang].STATUS+":</b> ";
            text += chat.welcome.state ? l[lang].ON : l[lang].OFF;
            text += "\n<b>"+l[lang].MODE+":</b> ";
            text += chat.welcome.once ? l[lang].W_SEND_ONCE : l[lang].W_SEND_EVERYTIME;
        
            var deleteSwitchButtonName = l[lang].DELETE_LAST_MESSAGE_BUTTON+" "+(chat.welcome.clean?"✔️":"✖️");
            GHbot.editMessageText(user.id, text, 
                {
                    message_id : msg.message_id,
                    chat_id : cb.chat.id,
                    parse_mode : "HTML",
                    reply_markup : 
                    {
                        inline_keyboard :
                        [
                            [{text: l[lang].TURN_OFF_BUTTON, callback_data: "S_WELCOME_OFF:"+chat.id}, {text: l[lang].TURN_ON_BUTTON, callback_data: "S_WELCOME_ON:"+chat.id} ],
                            [{text: l[lang].RULES_CHANGE_BUTTON, callback_data: "S_WELCOME#MSGMK:"+chat.id}],
                            [{text: l[lang].ALWAYS_SEND_BUTTON, callback_data: "S_WELCOME_ALWAYS:"+chat.id}, {text: l[lang].FIRSTJOIN_SEND_BUTTON, callback_data: "S_WELCOME_ONCE:"+chat.id}],
                            [{text: deleteSwitchButtonName, callback_data: "S_WELCOME_DELETESWITCH:"+chat.id}],
                            [{text: l[lang].BACK_BUTTON, callback_data: "SETTINGS_HERE:"+chat.id}],
                        ] 
                    } 
                }
            )
            GHbot.answerCallbackQuery(user.id, cb.id);

        }

        if( cb.data.startsWith("S_WELCOME#MSGMK") )
        {
            var returnButtons = [[{text: l[lang].BACK_BUTTON, callback_data: "S_WELCOME_BUTTON:"+chat.id}]];
            var customMessage = MSGMK.callbackEvent(GHbot, db, chat.welcome.message, cb, cb.chat, user, "S_WELCOME", returnButtons, l[lang].WELCOME);
            if(customMessage)
            {
                chat.welcome.message = customMessage;
                db.chats.update(chat);
            }
        }

    })

}

module.exports = main;
