var LGHelpTemplate = require("../GHbot.js")
const GHCommand = require("../api/tg/LGHCommand.js");
const { replaceLast } = require("../api/utils/utils.js");

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    GHCommand.registerCommands(["COMMAND_HELP"], (msg, chat, user, private, lang, key, keyLang) => {
        if(msg.chat.type != "private") return;
        GHbot.sendMessage(user.id, msg.chat.id, l[lang].HELP_DESCRIPTION, {parse_mode:"HTML"})
    })

    GHCommand.registerCommands(["COMMAND_COMMANDS"], (msg, chat, user, private, lang, key, keyLang) => {
        if(msg.chat.type != "private") return;
        GHbot.sendMessage(user.id, msg.chat.id, l[lang].COMMANDS_HELP_DESCRIPTION, {parse_mode:"HTML"})
    })

    GHCommand.registerCommands(["COMMAND_GETURL"], (msg, chat, user, private, lang, key, keyLang) => {
        if(!msg.chat.isGroup) return;

        if(msg.hasOwnProperty("reply_to_message")){
            var options = {
                disable_web_page_preview:true,
                reply_parameters: {message_id: msg.message_id},
                parse_mode:"HTML"
            }
            var url = "https://t.me/c/"+String(chat.id).replace("-100","")+"/"+msg.reply_to_message.message_id
            GHbot.sendMessage(user.id, msg.chat.id, url, options)
        }
        else{
            GHbot.sendMessage(user.id, msg.chat.id, l[lang].COMMAND_GETURL_USAGE, {parse_mode:"HTML"})
        }
        
    })

}

module.exports = main;
