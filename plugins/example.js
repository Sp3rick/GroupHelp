var LGHelpTemplate = require("../GHbot.js")

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    //here your plugin code//

    l = global.LGHLangs; //importing langs object

    GHbot.onMessage( (msg, chat, user) => {

        if( chat.type == "private" && msg.text == "/test999" )
            GHbot.sendMessage( user.id, chat.id, "Hello, i send this because im a plugin\n"+l[user.lang].flag );

    } )


}

module.exports = main;
