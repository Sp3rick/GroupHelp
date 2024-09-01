# Database

As you may have seen by many examples, an object that we always get is [db](GHBot.md/#LGHDatabase) (database)

```javascript
const LGHelpTemplate = require("../GHbot.js")

function main(args)
{

  const GHbot = new LGHelpTemplate(args);
  const {TGbot, db, config} = GHbot;
  ...
}

module.exports = main;
```

[Database](GHBot.md/#LGHDatabase) is the core of LibreGroupHelp to store chat and users data, as to the privacy implications of that we aim to minimize the amount of sensitive data there and anyway we keep in mind that the user should be able to remove any trace of him there

## Database usage

Currently [database](GHBot.md/#LGHDatabase) let you control [chats](GHBot.md/#chatsDatabase) and [users](GHBot.md/#usersDatabase) using same interface of functions

You are supposed to use `update` method everytime you want to apply changes to one of them

```javascript
const LGHelpTemplate = require("../GHbot.js")

function main(args)
{

  const GHbot = new LGHelpTemplate(args);
  const {TGbot, db, config} = GHbot;

  GHbot.onMessage( (msg, chat, user) => {

    if(!chat.isGroup) return;

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

    if( msg.text == "/anonymize" )
    {
      user.first_name = "anonymous"
      user.last_name = "anonymous"
      db.users.update(users); //apply changes to database
      GHbot.sendMessage( user.id, chat.id, "Anonymized successfully" );
    }

  } )

}

module.exports = main;
```
You find all relative methods documented clicking [db.chats](GHBot.md/#chatsDatabase) and [db.users](GHBot.md/#usersDatabase)

---


*Note: as written on [Known issues](known-issues.md) there are a problem with [chats](GHBot.md/#chatsDatabase) interface of database wich gives a reference copy of a LGHChat object, that's mean that it may be eventually stored on database even without `update` functions, fixing this would require some code refacory, you should still follow the rule of using `update` to confirm changes, if you need to apply only temporary changes of an LGHChat object please make a deep copy*