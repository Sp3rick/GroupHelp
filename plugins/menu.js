var LGHelpTemplate = require("../GHbot.js");
const GHCommand = require("../api/tg/LGHCommand.js");

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    GHCommand.registerCommands(["COMMAND_START"], (msg, chat, user, private, lang, key, keyLang) => {
        if(msg.chat.type != "private") return;
        GHbot.sendMessage(user.id, user.id, l[user.lang].PRESENTATION.replace("{name}",user.first_name+" "+(user.last_name||"")),{
            parse_mode : "HTML",
            link_preview_options : JSON.stringify({is_disabled : true}),
            reply_markup :{inline_keyboard :[
                [{text: l[user.lang].ADD_ME_TO_A_GROUP_BUTTON, url: "tg://resolve?domain=" + TGbot.me.username + "&startgroup&admin=change_info+delete_messages+restrict_members+invite_users+pin_messages+promote_members+manage_video_chats+manage_chat"}],
                [{text: l[user.lang].GROUP_BUTTON, url: "https://t.me/LGHChat" }, {text: l[user.lang].CHANNEL_BUTTON, url: "https://t.me/LibreGroupHelp"}],
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

        if( cb.data == "INFO_BUTTON" )
        {

            GHbot.editMessageText( user.id, l[lang].INFO.replace("{LGHVersion}",global.LGHVersion), 
            {
                message_id : msg.message_id,
                chat_id : chat.id,
                parse_mode : "HTML",
                reply_markup:{inline_keyboard :[
                        [{text: l[lang].SUPPORT_ABOUT_BUTTON, callback_data: "SUPPORT_BUTTON"}],
                        [{text: l[lang].COMMANDS_BUTTON, url: "https://sp3rick.github.io/GroupHelp/wiki/commands/"}],
                        [{text: l[lang].BACK_BUTTON, callback_data: "MENU"}]]}
            })
            GHbot.answerCallbackQuery(user.id, cb.id);

        }

    })

}

module.exports = main;
