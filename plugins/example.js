var LGHelpTemplate = require("../GHbot.js")

function main(args)
{

    var {GHbot, TGbot, db, config} = new LGHelpTemplate(args);



    //here your plugin code//

    l = global.LGHLangs; //importing langs object

    GHbot.on( "private", (msg, chat, user) => {

        if( msg.text == "/test999" )
            TGbot.sendMessage( chat.id, "Hello, i send this because im a plugin\n"+l[user.lang].flag );
        

    } )

    

}

module.exports = main;
