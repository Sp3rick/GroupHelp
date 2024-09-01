# Plugins

You can create any plugin you want creating a new file inside `plugins` folder

Look at `example.js` to see how it should be organized:

```javascript
const LGHelpTemplate = require("../GHbot.js")

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
```

Put and import in your plugin any needed utility on `api` folder, but if you know that some functions will be ever needed only on your plugin, you are free to declare it directly there

