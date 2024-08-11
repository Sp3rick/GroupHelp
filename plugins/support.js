var LGHelpTemplate = require("../GHbot.js");
const { unsetWaitReply, waitReplyForChat, waitReplyPrivate } = require("../api/utils/utils.js");

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    GHbot.onMessage( (msg, chat, user) => {

        var from = msg.from;

        if(chat.type != "private") return;

        //if is a message directed to support
        var isSupportDirected = (msg.waitingReply == "SUPPORT") || (msg.hasOwnProperty("reply_to_message") && String(msg.reply_to_message.text).startsWith("#Support"));
        var isBotStaffer = config.botStaff.includes(String(user.id));
        var isReplyToUserSupport = msg.hasOwnProperty("reply_to_message") && String(msg.reply_to_message.text).startsWith("#id");
        if(isSupportDirected)
        {
            //broadcast message to every bot staff members
            config.botStaff.forEach( async (stafferId) => {

                var sentMsg = await TGbot.forwardMessage(stafferId, chat.id, msg.message_id );

                /*note: this make a little privacy problem because the first name and last name will be left on telegram message so, we
                may want to store this message id and set a timer for delete/edit (removing first and last name) from message after 6 months?
                or more? or less? */
                var text = "#id" + user.id + " " + msg.message_id + "\n" +
                "<b><i>From: </i></b>" + from.first_name + (from.last_name ? " "+from.last_name : "") + "\n" +
                "👤Support request message\nReply to this message to reply the user.";
                
                GHbot.sendMessage(user.id, stafferId, text, {parse_mode:"HTML",reply_to_message_id: sentMsg.message_id});
            });

            //confirm support message sent to user
            GHbot.sendMessage(user.id, user.id, l[user.lang].SUPPORT_SENT_CONFIRM,{ 
                    parse_mode : "HTML",
                    reply_markup :{inline_keyboard :[[{text: l[user.lang].BACK_BUTTON, callback_data: "MENU"}]]}
            })

            unsetWaitReply(db, user, chat, false);
        }
        //if a bot staffer reply to a support message (that starts with #id)
        else if( isBotStaffer && isReplyToUserSupport )
        {

            var lines = msg.reply_to_message.text.split(/\r?\n/);
            var toReplyUserId = lines[0].split(" ")[0].replace("#id", "");
            var toReplyMessageId = lines[0].split(" ")[1];
            var fullNameUser = lines[1].replace("From: ","");

            var toReplyUser = db.users.get( toReplyUserId );

            //message directed to user
            GHbot.sendMessage( user.id, toReplyUserId, "#Support\n<i>" + l[toReplyUser.lang].SUPPORT_RECEIVED + "</i>\n\n" + msg.text, {
                parse_mode: "HTML",
                reply_to_message_id : toReplyMessageId
            });

            //confirmation message back to staffer 
            GHbot.sendMessage( user.id, user.id, "Reply successfully sent." );

            //let know all other staffers that a staffer replyed the user
            config.botStaff.forEach( (stafferId) => { if( stafferId != user.id ){

                var text = from.first_name + " " + (from.last_name || "") + " ["+code(user.id)+"] has answered to\n" +
                fullNameUser + " ["+code(toReplyUserId)+"] with:\n\n" +
                "<i>" + msg.text + "</i>";

                GHbot.sendMessage(user.id, stafferId, text,{ parse_mode : "HTML"})

            } } )

        }
        
    })

    GHbot.onCallback( async (cb, chat, user) =>  {

        var lang = user.lang;
        var msg = cb.message;

        if(chat.isGroup) return;

        if( cb.data == "SUPPORT_BUTTON" )
        {

            var callback = "SUPPORT";
            waitReplyPrivate(db, callback, user);

            GHbot.editMessageText( user.id, l[lang].SUPPORT_MESSAGE, 
            {
                message_id : msg.message_id,
                chat_id : chat.id,
                parse_mode : "HTML",
                reply_markup : {inline_keyboard:[[{text: l[lang].CANCEL_BUTTON, callback_data: "MENU"}]]}
            })
            GHbot.answerCallbackQuery(user.id, cb.id);

        }

    })

}

module.exports = main;
