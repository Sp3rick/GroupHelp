# Create a command

LibreGroupHelp offers multi-language command support, when the user sends a command LGH will try to resolve the command trying first to translate the raw one to the command code (usually starting with `COMMAND_`), then, if registered, their function will be ran


## Create command lang-code

Before registering your first command you need to know how to add it to the bot dictionary

Open `langs/en_en.json` and scroll down below until you find the values keys starting with `"COMMAND_"`

```json
"/rules": "COMMAND_RULES",
"/regulation" : "COMMAND_RULES",
"COMMAND_RULES" : "rules",
"CMDDESC_RULES" : "/{name} or /regulation\nSend group regulament message, it can be changed in settings",
"/permissions": "COMMAND_PERMS",
"/perms": "COMMAND_PERMS",
"COMMAND_PERMS" : "perms",
```

As you see, `"COMMAND_RULES" : rules` define the main command as the `/rules` one   
But it owns also some alias, still linked to `COMMAND_RULES`

```json
"/rules": "COMMAND_RULES",
"/regulation" : "COMMAND_RULES",
```

Both `/rules` and `/regulation` will fire up the same function

We see also a `"CMDDESC_RULES"` parameter with a `{name}` substitution key, set this value can help back in some cases where bot has to show a short description of what the command does, it's not mandatory to add this but is reccomended

</br>

Now add our own command

```json
"/example" : "COMMAND_EXAMPLE",
"/showcase" : "COMMAND_EXAMPLE",
"/anotheralias" : "COMMAND_EXAMPLE",
"COMMAND_EXAMPLE" : "example",
"CMDDESC_EXAMPLE" : "/{name} or /showcase or /anotheralias\nThese are just commands to show an example on LibreGroupHelp Wiki"
"/rules": "COMMAND_RULES",
"/regulation" : "COMMAND_RULES",
"COMMAND_RULES" : "rules",
"CMDDESC_RULES" : "/{name} or /regulation\nSend group regulament message, it can be changed in settings",
"/permissions": "COMMAND_PERMS",
"/perms": "COMMAND_PERMS",
"COMMAND_PERMS" : "perms",
```

We added as main command of `COMMAND_EXAMPLE` the command `/example`, anyway also `/showcase` and `/anotheralias` are avaiable as aliases

*Note: `"/example" : "COMMAND_EXAMPLE"` and `"COMMAND_EXAMPLE" : "example"` are always both needed, even if example is already described as the main command, it has to be anyway in the aliases list*

---

## Register command

The command registering tool can be required with  
`const GHCommand = require("../api/tg/LGHCommand.js")`

To reply a command the right procedure is using the sendCommandReply utility (from  `api/utils/utils.js` )
       
Giving back to `sendCommandReply` the `GHCommand.registerCommand` parameters will allow it to decide what is the correct destination chat to reply, running then a callback that gives you a `chadId` where to reply

That's because the user may have the permission to use this command only with a private bot reply, but there are also many other caveuts, this system will handle everything for you, so you can focus on the acutal command creation

Here an example:

```javascript
const { sendCommandReply } = require("../api/utils/utils.js");
const GHCommand = require("../api/tg/LGHCommand.js");
const LGHelpTemplate = require("../GHbot.js");

function main(args)
{

  const GHbot = new LGHelpTemplate(args);
  const {TGbot, db, config} = GHbot;

  GHCommand.registerCommands(["COMMAND_EXAMPLE"], (msg, chat, user, private, lang, key, keyLang) => {

    //we want this command to work only if from groups
    if(!msg.chat.isGroup) return; 

    sendCommandReply(private, lang, GHbot, user.id, chat.id, (sendId)=>{
      var text = "Thanks for the interest into LGH, we appreciate this";
      GHbot.sendMessage(user.id, sendId, text);
    })

  })

}

module.exports = main;
```

If are you sure that your command reply has always to be on the group you can still set `false` instead of `private` on `sendCommandReply`

In the same way if your command reply should be always on private chat, you set `true` instead of `private`

*Note: `msg`, `chat` and `user` are exactly the same parameters you get within [LGH Events](events.md/#expect-messages), they come acutally from there*


## Some insights

Any [msg](GHBot.md/#lghmessage-telegrambotmessage-custommessage) object contains [msg.command](GHBot.md/#parsedcommand-object), can be useful to handle more parameters on your command

---

Why first parameter of `GHCommand.registerCommands` is an array?    
Yes it's exactly what you think, you can run the same function for more commands, but why?

I will show you this directly using `promote.js` plugin as example


```javascript
var commandsList = ["COMMAND_FREE", "COMMAND_UNFREE", "COMMAND_HELPER", "COMMAND_UNHELPER", "COMMAND_CLEANER", "COMMAND_UNCLEANER",
  "COMMAND_MUTER", "COMMAND_UNMUTER", "COMMAND_MODERATOR", "COMMAND_UNMODERATOR", "COMMAND_COFOUNDER", "COMMAND_UNCOFOUNDER",
  "COMMAND_ADMINISTRATOR", "COMMAND_UNADMINISTRATOR", "COMMAND_TITLE", "COMMAND_UNTITLE"];

GHCommand.registerCommands(commandsList, async (msg, chat, user, private, lang, key, keyLang) => {
  if(!msg.chat.isGroup) return;

  /**
   *  note how we return in case of msg.waitingReply, that's because
   *  otherwise we would handle this command also while the user is
   *  dealing with some other piece of the bot 
   * */
  if(msg.waitingReply) return;

  var command = msg.command;
  var lang = msg.chat.lang;
  var target = msg.waitingReplyTarget || msg.target;
  var text = false;
  var options = {parse_mode : "HTML"};
  var toSetRole = false;
  var toUnsetRole = false;

  if( key == "COMMAND_FREE")
    toSetRole = "free";
  if( key == "COMMAND_UNFREE")
    toUnsetRole = "free";

  if( key == "COMMAND_HELPER")
    toSetRole = "helper";
  if( key == "COMMAND_UNHELPER")
    toUnsetRole = "helper";

  if( key == "COMMAND_CLEANER")
    toSetRole = "cleaner"
  if( key == "COMMAND_UNCLEANER")
    toUnsetRole = "cleaner";

  if( key == "COMMAND_MUTER")
    toSetRole = "muter";
  if( key == "COMMAND_UNMUTER")
    toUnsetRole = "muter";

  if( key == "COMMAND_MODERATOR")
    toSetRole = "moderator";
  if( key == "COMMAND_UNMODERATOR")
    toUnsetRole = "moderator";

  if( key == "COMMAND_COFOUNDER")
    toSetRole = "cofounder"
  if( key == "COMMAND_UNCOFOUNDER")
    toUnsetRole = "cofounder";

  if( key == "COMMAND_ADMINISTRATOR"){...}
  if( key == "COMMAND_UNADMINISTRATOR"){...}
  if( key == "COMMAND_TITLE"){...}
  if( key == "COMMAND_UNTITLE"){...}

  //check if user can change a role and if he can apply it to target
  if(toSetRole || toUnsetRole){...}
  if(toSetRole){...}
  if(toUnsetRole){...}    
})
```

As you see, in this case we need to listen for multiple commands at the same time as they need to run pretty the same code, we need only `key` to change `toSetRole` and `toUnsetRole` variable, then the code is same for everyone
