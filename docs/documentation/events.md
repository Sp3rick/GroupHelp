# Events

ONLY for events from GHBot you have additional elements on parameters bot-related

Usually GHBot events has 3 parameters:
([callback](./GHBot.md/#lghcallback-telegrambotcallbackquery-customcallback) 
or
[message](GHBot.md/#lghmessage-telegrambotmessage-custommessage)),
[chat](GHBot.md/#LGHChat),
[user](GHBot.md/#LGHUser)

GHBot currently has 2 events fully supported

```javascript
GHBot.onCallback( (cb, chat, user) => { console.log(cb) } )
GHBot.onMessage( (msg, chat, user) => { console.log(msg) } ) 
```

---

##Chat data

So how [GHBot](GHBot.md/#LGHInterface) enchanches events for LibreGroupHelp more than using the raw [TGBot](https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md)?

First at all, it allow us to get already a full chat object from the database, thus giving you the full chat configuration

```javascript
const { punishmentToFullText } = require("../api/utils/utils.js");
const LGHelpTemplate = require("../GHbot.js")

function main(args)
{

  const GHbot = new LGHelpTemplate(args);
  const {TGbot, db, config} = GHbot;

  GHbot.onMessage( (msg, chat, user) => {

    var runTest = msg.chat.isGroup && msg.text == "/test"
    if( !runTest ) return;

    console.log("Logging chat flood settings")
    console.log("Message limit: " + msg.chat.flood.messages)
    console.log("Fire if sent within " + msg.chat.flood.time + " seconds")
    var punish = punishmentToFullText(user.lang, msg.chat.flood.punishment, msg.chat.flood.PTime, msg.chat.flood.delete)
    console.log("User will be punished with " + punish)

  } )

}

module.exports = main;
```

Output if any user type `/test` on a group:

  Logging chat flood settings
  Message limit: 3
  Fire if sent within 5 seconds
  User will be punished with Warn for 1 day + delete

*You may wonder why we use msg.chat instead of chat? You get that in detail on [Expect messages](events.md/#expect-messages) section, shotly it's because we want to work on the chat where the message is coming from, not the select chat*

---

## User permissions

We may also want to allow the user to change settings, but we need to know if he has the permission to do that, so we have [user.perms](GHBot.md/#LGHPerms) containing a permissions object about the user on that chat

*Note: [user.perms](GHBot.md/#LGHPerms) is a temporary item*

```javascript
const LGHelpTemplate = require("../GHbot.js")

function main(args)
{

  const GHbot = new LGHelpTemplate(args);
  const {TGbot, db, config} = GHbot;

  GHbot.onMessage( (msg, chat, user) => {

    if(!chat.isGroup) return;

    //we never listen to commands like this on LGH, it's just as example
    if( !msg.text.startsWith("/antiflood") ) return

    //Check for user permissions to change settings
    if(user.perms.settings != 1)
    {
      GHbot.sendMessage(user.id, chat.id, "You haven't settings permission");
      return;
    }

    if( msg.text == "/antiflood kind" )
    {
      chat.flood.messages = 8;
      chat.flood.time = 10;
      db.chats.update(chat); //apply changes to database
      GHbot.sendMessage( user.id, chat.id, "Antiflood set to be kind" );
    }
    else if( msg.text == "/antiflood hard" )
    {
      chat.flood.messages = 3;
      chat.flood.time = 5;
      db.chats.update(chat); //apply changes to database
      GHbot.sendMessage( user.id, chat.id, "Antiflood set to be hard" );
    }

  } )

}

module.exports = main;
```

---

## Expect messages

[GHBot](GHBot.md/#LGHInterface) makes also you easy to expect messages or callbacks from users in private chat and both still relating to the group, keeping the group [chat](GHBot.md/#LGHChat) object

Let's see:

```javascript
const { unsetWaitReply, waitReplyForChat } = require("../api/utils/utils.js");
const LGHelpTemplate = require("../GHbot.js")

function main(args)
{

  const GHbot = new LGHelpTemplate(args);
  const {TGbot, db, config} = GHbot;

  GHbot.onMessage( async (msg, chat, user) => {

    if(!msg.chat.isGroup) return;

    if(msg.text == "/antiflood")
    {
      /**
       * waitReplyForChat, if chat.isGroup == false, will set 
       * automatically the callback as EXAMPLE:groupId
      */
      waitReplyForChat(db, "EXAMPLE", user, chat, chat.isGroup);
      var text = `Ok, antiflood should be kind or hard?\n`+
        `You can reply both here or private chat\n`+
        `@${TGbot.me.username}`;
      GHbot.sendMessage(user.id, chat.id, text);
    }

  } )

  GHbot.onMessage( (msg, chat, user) => {

    
    /**
     * Here, if msg.waitingReply has a groupId (ex. EXAMPLE:-109848493476)
     * so it's following correctly the LGH Callbacks Hirarchy,
     * the "chat" parameter would be bind to the group
     * enriched by the database, we have a full LGH chat object
     */

    //So behaivor is different from "if(!msg.chat.isGroup) return"
    if(!chat.isGroup) return; //think that as "!selectedChat.isGroup"
    if( !msg.waitingReply.startsWith("EXAMPLE") ) return;

    //even on private chat, user.perms still exhist if a group is binded
    if(user.perms.settings != 1)
    {
      GHbot.sendMessage(user.id, chat.id, "You haven't settings permission");
      return;
    }

    if( msg.text == "kind" )
    {
      chat.flood.messages = 8;
      chat.flood.time = 10;
      db.chats.update(chat); //apply changes to database
      GHbot.sendMessage( user.id, chat.id, "Antiflood set to be kind" );
      unsetWaitReply(db, user, chat, chat.isGroup);
    }
    else if( msg.text == "hard" )
    {
      chat.flood.messages = 3;
      chat.flood.time = 5;
      db.chats.update(chat); //apply changes to database
      GHbot.sendMessage( user.id, chat.id, "Antiflood set to be hard" );
      unsetWaitReply(db, user, chat, chat.isGroup);
    }

    //msg.chat keeps for sure the chat wich message is coming from
    var text = `This message is from private chat? ${!msg.chat.isGroup}`;
    GHbot.sendMessage( user.id, chat.id, text);

  } )

}

module.exports = main;
```

---



## Expect buttons clicks

Buttons callbacks works pretty in the same way:

```javascript
const { punishmentToFullText } = require("../api/utils/utils.js");
const LGHelpTemplate = require("../GHbot.js");

function main(args)
{

  const GHbot = new LGHelpTemplate(args);
  const {TGbot, db, config} = GHbot;

  GHbot.onMessage( async (msg, chat, user) => {

    if(!msg.chat.isGroup) return;

    //we never listen to commands like this on LGH, it's just as example
    if(msg.text == "/private")
    {
      var text = "Proceed on private chat\n@"+TGbot.me.username;
      var buttons = [[
        {
          //As you see we follow the hirarchy
          callback_data: "EXAMPLE_SHOW_CONFIG:"+chat.id,
          text: "Show antiflood config"
        }
      ]];
      var options = {reply_markup:{inline_keyboard:buttons}};
      GHbot.sendMessage(user.id, user.id, text, options);
    }

  } )

  GHbot.onCallback( (cb, chat, user) => {

    /**
     * Also here, if cb.data has a groupId (ex. EXAMPLE:-109848493476)
     * following correctly the LGH Callbacks Hirarchy
     * the "chat" parameter would be bind to the group
     * enriched by the database we have a full LGH chat object
     */

    if(!chat.isGroup) return;

    //callback data is stored on cb.data
    if( !cb.data.startsWith("EXAMPLE") ) return

    /**
     * Note: we use cb.chat.id, because editMessageText
     * needs the chatId where callback is coming from
     */
    var editOpts = {
      message_id: cb.message.message_id,
      chat_id: cb.chat.id,
    }

    if(user.perms.settings != 1)
    {
      GHbot.editMessageText(user.id, "You haven't settings permission", editOpts);
      return;
    }

    if( cb.data.startsWith("EXAMPLE_SHOW_CONFIG") )
    {
      var punish = punishmentToFullText(user.lang, chat.flood.punishment, chat.flood.PTime, chat.flood.delete)
      var text = `Chat flood settings
        Message limit: ${chat.flood.messages}
        Fire if sent within ${chat.flood.time} seconds
        User will be punished with ${punish}`
      GHbot.editMessageText(user.id, text, editOpts);
    }

    //cb.chat keeps for sure the chat wich message is coming from
    GHbot.sendMessage( user.id, chat.id, "This callback is from private chat? " + !cb.chat.isGroup );

  } )

}

module.exports = main;
```

## Target user

As you may have seen from the [LGH Callbacks hirarchy](callbacks.md/#lgh-hirarchy), after `?` exhists a parameter for target users, this callback parameter allows you to bind an user intended to be affected in some way trough the callback, so he is going to be avaiable on [cb.target](GHBot/#targetuser-object) or [msg.waitingReplyTarget](GHBot/#targetuser-object)

---

If you need instead data about a direct target of a message you have msg.target

These are some cases where [msg.target](GHBot/#targetuser-object) appears:    
User X, replying to User Y, Y is the target   
User X, use a command mentioning Y (ex. `/ban @UserY`), Y is the target 

That comes useful while handling a command after a [Command creation](commands.md)

## Conclusion

Is better to think about the [chat](GHBot.md/#LGHChat) parameter as the selected chat, not the chat we are (that's on msg.chat), but the chat where we are asked to work on
