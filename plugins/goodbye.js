var LGHelpTemplate = require("../GHbot.js");
const MSGMK = require( "../api/editors/MessageMaker.js" );

l = global.LGHLangs; //importing langs object

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    GHbot.onMessage( async (msg, chat, user) => {

        //handle left members
        if(chat.type != "private" && msg.left_chat_member && (chat.goodbye.group || chat.goodbye.private)){

            var leftUser = msg.left_chat_member;
            if(chat.goodbye.group)
            {     
                leftUser = Object.assign({}, leftUser, db.users.get(leftUser.id));
                var sentMsg = await MSGMK.sendMessage(GHbot, leftUser, chat, chat.goodbye.gMsg, l[chat.lang].EMPTY_GOODBYE);
                if(chat.goodbye.clear)
                    GHbot.TGbot.deleteMessages(chat.id, [chat.goodbye.lastId])
                chat.goodbye.lastId = sentMsg.message_id;
            }
            if(chat.goodbye.private){try{
                await MSGMK.sendMessage(GHbot, leftUser, chat, chat.goodbye.pMsg, l[chat.lang].EMPTY_GOODBYE, {}, leftUser.id);
            }catch (error) {}}

        }

        //security guards
        if (!(user.waitingReply)) return;
        var myCallback = user.waitingReplyType.startsWith("S_GOODBYE");
        if (!myCallback) return;
        if (msg.chat.isGroup && chat.id != msg.chat.id) return;//additional security guard
        if (!(user.perms && user.perms.settings)) return;

        var customMessage = false;
        if(user.waitingReplyType.startsWith("S_GOODBYE_GROUP#MSGMK"))
            customMessage = await MSGMK.messageEvent(GHbot, db, chat.goodbye.gMsg, msg, msg.chat, user, "S_GOODBYE_GROUP");
        if(user.waitingReplyType.startsWith("S_GOODBYE_PRIVATE#MSGMK"))
            customMessage = await MSGMK.messageEvent(GHbot, db, chat.goodbye.pMsg, msg, msg.chat, user, "S_GOODBYE_PRIVATE");
        if(customMessage)
        {
            chat.rules = customMessage;
            db.chats.update(chat);
        }

    } )

    GHbot.onCallback( async (cb, chat, user) => {

        var msg = cb.message;
        var lang = user.lang;

        //security guards for settings
        var myCallback = cb.data.startsWith("S_GOODBYE");
        if(!chat.isGroup) return;
        if (!myCallback) return;
        if (!(user.perms && user.perms.settings)) return;
        if (cb.chat.isGroup && chat.id != cb.chat.id) return;

        if (cb.data.startsWith("S_GOODBYE_BUTTON_GROUP"))
        {
            chat.goodbye.group = !chat.goodbye.group;
            db.chats.update(chat);
        }

        if (cb.data.startsWith("S_GOODBYE_BUTTON_ONCE"))
        {
            chat.goodbye.clear = !chat.goodbye.clear;
            db.chats.update(chat);
        }

        if (cb.data.startsWith("S_GOODBYE_BUTTON_PRIVATE"))
        {
            chat.goodbye.private = !chat.goodbye.private;
            db.chats.update(chat);
        }

        var returnButtons = [[{text: l[lang].BACK_BUTTON, callback_data: "S_GOODBYE_BUTTON:"+chat.id}]];
        if( cb.data.startsWith("S_GOODBYE_GROUP#MSGMK") )
        {
            var title = l[lang].GOODBYE_GROUP_EDIT;
            var msgTitle = l[lang].EMPTY_GOODBYE;
            var customMessage = MSGMK.callbackEvent(GHbot, db, chat.goodbye.gMsg, cb, cb.chat, user, "S_GOODBYE_GROUP", returnButtons, title, msgTitle)
            if(customMessage)
            {
                chat.goodbye.gMsg = customMessage;
                db.chats.update(chat);
            }
        }
        if( cb.data.startsWith("S_GOODBYE_PRIVATE#MSGMK") )
        {
            var title = l[lang].GOODBYE_PRIVATE_EDIT;
            var msgTitle = l[lang].EMPTY_GOODBYE;
            var customMessage = MSGMK.callbackEvent(GHbot, db, chat.goodbye.pMsg, cb, cb.chat, user, "S_GOODBYE_PRIVATE", returnButtons, title, msgTitle)
            if(customMessage)
            {
                chat.goodbye.pMsg = customMessage;
                db.chats.update(chat);
            }
        }
    

        //goodbye menu
        if (cb.data.startsWith("S_GOODBYE_BUTTON")) {

            var groupButton = l[lang].SEND_GROUP_BUTTON + (chat.goodbye.group ? " ✔️" : " ✖️");
            var deleteLastGoodbyeButton = l[lang].DELETE_LAST_GOODBYE + (chat.goodbye.clear ? " ✔️" : " ✖️");
            var privateButton = l[lang].SEND_PRIVATE_BUTTON + (chat.goodbye.private ? " ✔️" : " ✖️");

            var text = l[lang].GOODBYE_DESCRIPTION
            .replace("{group}",chat.goodbye.group ? l[lang].ON : l[lang].OFF)
            .replace("{clear}",chat.goodbye.clear ? "✔️" : "✖️")
            .replace("{private}",chat.goodbye.private ? l[lang].ON : l[lang].OFF)
            .replace("{username}","@"+GHbot.TGbot.me.username)

            GHbot.editMessageText(user.id, text, {
                message_id: msg.message_id,
                chat_id: cb.chat.id,
                parse_mode: "HTML",
                reply_markup:
                {
                    inline_keyboard:
                        [[{text: groupButton, callback_data: "S_GOODBYE_BUTTON_GROUP:" + chat.id },
                        {text: l[lang].SET_MESSAGE_SHORT, callback_data: "S_GOODBYE_GROUP#MSGMK:" + chat.id }],
                        [{text: deleteLastGoodbyeButton, callback_data: "S_GOODBYE_BUTTON_ONCE:" + chat.id}],
                        [{text: privateButton, callback_data: "S_GOODBYE_BUTTON_PRIVATE:" + chat.id },
                        {text: l[lang].SET_MESSAGE_SHORT, callback_data: "S_GOODBYE_PRIVATE#MSGMK:" + chat.id}],
                        [{text: l[lang].BACK_BUTTON, callback_data: "SETTINGS_HERE:" + chat.id}]]
                }
            })
            GHbot.answerCallbackQuery(user.id, cb.id);
            
        }

    })

}

module.exports = main;
