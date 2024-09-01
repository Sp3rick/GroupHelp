## LGH Hirarchy

We need to expect button clicks and messages from users to be able to perform most of actions for our bot


That's why we need an unified hirarchy of how callbacks data are organized, on LibreGroupHelp they are avaiable for buttons on `cb.data` and `msg.waitingReply` for messages, we will talk about how to expect user messages soon, but first you should follow the right hirachy so main.js can set right variables for [LGH Events](events.md)

</br>

That's the hirarchy:

`CallbackName_opt1_opt2!data#editorName_opt1_opt2|editorData:groupId?targetUserId`

</br>

It works too with less items like this: `CallbackName:groupId`, `CallbackName#editor?targetUserId`, `CallbackName:groupId?targetUserId`.

</br>

**CallbackName**  
Name of callback that you can use, be sure that not conflicts with other names, often plugins check if it's their match with `string.startsWith()`, `opt1` and `opt2` separated by `_` is avaiable to futher go deep with your callback listener

---

**data**  
Some additional data that you can attach to CallbackName (requires `CallbackName`)

---

**editorName**  
Also that is often identified with string.startsWith(), it's usually used by re-usable menus like MessageMaker.js, setNum.js, setTime.js

[What are editors?](editors.md)

---

**editorData**  
Additional data that editor may attach (requires `editorName`)

---

**groupId**   
This value when given allow main.js to set by any chat context a specific full chat object on it's events inside [GHBot](GHBot.md/#LGHInterface) (`msg.chat` or `cb.message.chat` are not affected) and `user.perms` related to user permissions on the given groupId

[Read how groupId helps LGH Events](events.md/#expect-messages)

---

**targetUserId**  
This value when given allow main.js to set a specific target user in various cases: `cb.target`, `msg.waitingReplyTarget` (note: it's volontarily separated from `msg.target` that's command target dedicated)

[Read how targetUserId helps LGH Events](events.md/#target-user)

---


## Expect user messages

In this example i will show you how to expect futher message from user and, listen it back when he replicate, and then disable futher message expectations

For messages callbacks comes at help 2 functions:

  waitReplyForChat(database, callback, user, chat, onGroup)
  unsetWaitReply(database, user, chat, onGroup)

</br>

Keep in mind that Callback Hirarchy upon explained has to be followed

```javascript
const LGHelpTemplate = require("../GHbot.js")
const {waitReplyForChat, unsetWaitReply} = require( "../api/utils/utils.js" );

function main(args)
{

  const GHbot = new LGHelpTemplate(args);
  const {TGbot, db, config} = GHbot;

  GHbot.onMessage( (msg, chat, user) => {

    if(msg.text != "/guess") return;

    //if users type /guess expect a message with "EXPECT_PASSWORD" callback

    /**
     * waitReplyForChat, if chat.isGroup == false, will set 
     * automatically the callback as EXAMPLE:groupId
    */
    waitReplyForChat(db, "EXPECT_PASSWORD", user, chat, chat.isGroup)

    GHbot.sendMessage(user.id, chat.id, "Guess the password")

  })

  GHbot.onMessage( (msg, chat, user) => {

    var isMyCallback = msg.waitingReply && msg.waitingReply.startsWith("EXPECT_PASSWORD")
    if(!isMyCallback) return;

    if(msg.text == "password1234"){
      GHbot.sendMessage(user.id, chat.id, "Congratulation, password guessed!")
      unsetWaitReply(db, user, chat, chat.isGroup) //do not expect futher messages
    }
    else{
      GHbot.sendMessage(user.id, chat.id, "Password incorrect, try again ): ")
    }

  })

}

module.exports = main;
```

When you are expecting a message other plugins will see (with `msg.waitingReply` != false) your decision and they may stop working until you finished, so be sure to use unsetWaitReply eventually


## Expect user button clicks

Currently LGH has no special procedure to expect button clicks, just follow the hirarchy and do how you would do with [TGbot](https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md)

You find an example here: [LGH Events: Expect buttons clicks](events.md/#expect-buttons-clicks) 
