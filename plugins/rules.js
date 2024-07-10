var LGHelpTemplate = require("../GHbot.js")
const {sendCommandReply} = require( "../api/utils/utils.js" );
const MSGMK = require( "../api/editors/MessageMaker.js" )
const CMDPerms = require("../api/editors/CommandsPerms.js")
const GHCommand = require("../api/tg/LGHCommand.js");

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    GHCommand.registerCommands(["COMMAND_RULES"], async (msg, chat, user, private, lang, key, keyLang) => {
        if(!msg.chat.isGroup) return;

        var options = {reply_parameters: {chat_id:msg.chat.id, message_id: msg.message_id, allow_sending_without_reply:true}};
        if(msg.reply_to_message)
        {
            options.reply_parameters.message_id = msg.reply_to_message.message_id;
            options.reply_parameters.chat_id = msg.chat.id;
        }
        var func = (id) => {return MSGMK.sendMessage(GHbot, user, chat, msg.chat.rules, l[msg.chat.lang].RULES_TITLE, options, id)};
        sendCommandReply(private, msg.chat.lang, GHbot, user.id, msg.chat.id, func);
    })

    //waitingReply handler
    GHbot.onMessage( async (msg, chat, user) => {

        //security guards
        if(!chat.isGroup) return;
        if( !(msg.waitingReply && msg.waitingReply.startsWith("S_RULES")) ) return;
        if( msg.chat.isGroup && chat.id != msg.chat.id ) return;//additional security guard
        if( !(user.perms && user.perms.settings) ) return;

        var customMessage = await MSGMK.messageEvent(GHbot, db, chat.rules, msg, chat, user, "S_RULES");

        if(customMessage)
        {
            chat.rules = customMessage;
            db.chats.update(chat);
        }

    } )


    GHbot.onCallback( (cb, chat, user) => {

        var msg = cb.message;
        var lang = user.lang;

        //security guards for settings
        if(!chat.isGroup) return;
        if( !cb.data.startsWith("S_RULES")) return;
        if( !(user.perms && user.perms.settings) ) return;
        if( cb.chat.isGroup && chat.id != cb.chat.id) return;

        if( cb.data.startsWith("S_RULES_BUTTON:") )
        {
        
            GHbot.editMessageText( user.id, l[lang].RULES_SETTING, {
                message_id : msg.message_id,
                chat_id : cb.chat.id,
                parse_mode : "HTML",
                reply_markup : 
                {
                    inline_keyboard :
                    [
                        [{text: l[lang].RULES_CHANGE_BUTTON, callback_data: "S_RULES#MSGMK:"+chat.id}],
                        [{text: l[lang].COMMAND_PERMS_BUTTON, callback_data: "S_RULES#CMDPERMS_MENU:"+chat.id}],
                        [{text: l[lang].BACK_BUTTON, callback_data: "SETTINGS_HERE:"+chat.id}],
                    ] 
                } 
            })
            GHbot.answerCallbackQuery(user.id, cb.id);

        }

        if( cb.data.startsWith("S_RULES#MSGMK") )
        {
            var returnButtons = [[{text: l[lang].BACK_BUTTON, callback_data: "S_RULES_BUTTON:"+chat.id}]];
            var title = l[lang].REGULATION;
            var msgTitle = l[lang].RULES_TITLE;
            var customMessage = MSGMK.callbackEvent(GHbot, db, chat.rules, cb, chat, user, "S_RULES", returnButtons, title, msgTitle)

            if(customMessage)
            {
                chat.rules = customMessage;
                db.chats.update(chat);
            }
        }

        if( cb.data.startsWith("S_RULES#CMDPERMS") )
        {
            var returnButtons = [[{text: l[lang].BACK_BUTTON, callback_data: "S_RULES_BUTTON:"+chat.id}]];
            var newChat = CMDPerms.callbackEvent(GHbot, db, chat, cb, chat, user, "S_RULES", returnButtons)
            if(newChat) db.chats.update(newChat);
        }

    })

    

}

module.exports = main;
