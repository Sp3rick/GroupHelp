var LGHelpTemplate = require("../GHbot.js");

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    GHbot.onMessage( (msg, chat, user) => {

        var from = msg.from;

        if(chat.type != "private") return;

        //if is a message directed to support
        var isSupportDirected = (user.waitingReply == true && user.waitingReplyType == "SUPPORT") || (msg.hasOwnProperty("reply_to_message") && String(msg.reply_to_message.text).startsWith("#Support"));
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

            user.waitingReply = false;
            db.users.update(user);
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

        //if no-one is expecting a message from user
        if( user.waitingReply == false && !isSupportDirected && !isReplyToUserSupport)
            GHbot.sendMessage(user.id, user.id, l[user.lang].PRESENTATION.replace("{name}",user.first_name+" "+(user.last_name||"")),{
                parse_mode : "HTML",
                link_preview_options : JSON.stringify({is_disabled : true}),
                reply_markup :{inline_keyboard :[
                        [{text: l[user.lang].ADD_ME_TO_A_GROUP_BUTTON, url: "tg://resolve?domain=" + TGbot.me.username + "&startgroup&admin=change_info+delete_messages+restrict_members+invite_users+pin_messages+promote_members+manage_video_chats+manage_chat"}],
                        [{text: l[user.lang].GROUP_BUTTON, url: "https://t.me/LibreGHelp" }, {text: l[user.lang].CHANNEL_BUTTON, url: "https://t.me/LibreGroupHelp"}],
                        [{text: l[user.lang].SUPPORT_BUTTON, callback_data: "SUPPORT_BUTTON"}, {text: l[user.lang].INFO_BUTTON, callback_data: "INFO_BUTTON"}],
                        [{text: l[user.lang].LANGS_BUTTON, callback_data: "LANGS_BUTTON"}]
            ]}})
    })

    GHbot.onCallback( async (cb, chat, user) =>  {

        var lang = user.lang;
        var msg = cb.message;

        if(chat.isGroup) return;

        if( cb.data == "MENU" )
        {

            GHbot.editMessageText( user.id, l[lang].PRESENTATION.replace("{name}",user.first_name+" "+(user.last_name||"")),{
                message_id : msg.message_id,
                chat_id : chat.id,
                parse_mode : "HTML",
                link_preview_options : JSON.stringify({is_disabled : true}),
                reply_markup :{inline_keyboard:[
                        [{text: l[lang].ADD_ME_TO_A_GROUP_BUTTON, url: "https://t.me/" + TGbot.me.username + "?startgroup=true&admin=change_info+delete_messages+restrict_members+invite_users+pin_messages+promote_members+manage_video_chats+manage_chat"}],
                        [{text: l[lang].GROUP_BUTTON, url: "https://t.me/LibreGHelp" }, {text: l[lang].CHANNEL_BUTTON, url: "https://t.me/LibreGroupHelp"}],
                        [{text: l[lang].SUPPORT_BUTTON, callback_data: "SUPPORT_BUTTON"}, {text: l[lang].INFO_BUTTON, callback_data: "INFO_BUTTON"}],
                        [{text: l[lang].LANGS_BUTTON, callback_data: "LANGS_BUTTON"}]
            ]}})
            GHbot.answerCallbackQuery(user.id, cb.id);

        }

        if( cb.data == "SUPPORT_BUTTON" )
        {

            user.waitingReply = chat.id;
            user.waitingReplyType = "SUPPORT";
            db.users.update(user);

            GHbot.editMessageText( user.id, l[lang].SUPPORT_MESSAGE, 
            {
                message_id : msg.message_id,
                chat_id : chat.id,
                parse_mode : "HTML",
                reply_markup : {inline_keyboard:[[{text: l[lang].CANCEL_BUTTON, callback_data: "MENU"}]]}
            })
            GHbot.answerCallbackQuery(user.id, cb.id);

        }

        //TODO: complete info button
        if( cb.data == "INFO_BUTTON" )
        {

            GHbot.editMessageText( user.id, l[lang].INFO.replace("{LGHVersion}",global.LGHVersion), 
            {
                message_id : msg.message_id,
                chat_id : chat.id,
                parse_mode : "HTML",
                reply_markup:{inline_keyboard :[
                        [{text: l[lang].SUPPORT_ABOUT_BUTTON, callback_data: "SUPPORT_BUTTON"}],
                        [{text: l[lang].COMMANDS_BUTTON, callback_data: "NOT_IMPLEMENTED"}],
                        [{text: l[lang].BACK_BUTTON, callback_data: "MENU"}]]}
            })
            GHbot.answerCallbackQuery(user.id, cb.id);

        }


        if( cb.data == "NOT_IMPLEMENTED" )
            GHbot.answerCallbackQuery(user.id, cb.id, {text:l[lang].NOT_IMPLEMENTED,show_alert:true});

    })

}

module.exports = main;
