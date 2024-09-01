# What are editors?

Editors are a way create re-usable interfaces of panels, with their expect messages and expect buttons callbacks handling to allow you to show something to an user or edit a variable, object, or something else

As you already know by [LGH Hirarchy](callbacks.md/#lgh-hirarchy), editors has their own space there, the reason why we need to make them separate is simple:  
You still need to know who is the caller of the editor it's so can correctly handle like a possible variable change

Let's begin from the most useful of the editors, `MessageMaker`, that allow the user to modify a [customMessage](GHBot.md/#custommessage-object) object and then also to send it as a telegram message

That's how `rules.js` uses that (some code not interested has been suppressed):

```javascript
const LGHelpTemplate = require("../GHbot.js");
const {sendCommandReply, waitReplyForChat, unsetWaitReply} = require( "../api/utils/utils.js" );
const MSGMK = require( "../api/editors/MessageMaker.js" )
...

function main(args)
{

  const GHbot = new LGHelpTemplate(args);
  const {TGbot, db, config} = GHbot;
  ...

  GHbot.onMessage( async (msg, chat, user) => {

    //check if it's our callback
    if(!chat.isGroup) return;
    if( !(msg.waitingReply && msg.waitingReply.startsWith("S_RULES")) ) return;
    ...
    
    /**
     * rules never expect for other messages
     * so we can give it all directly to MessageMaker hands
     */
    var customMessage = await MSGMK.messageEvent(GHbot, db, chat.rules, msg, chat, user, "S_RULES");

    //then if customMessage has an update, we save that
    if(customMessage)
    {
      chat.rules = customMessage;
      db.chats.update(chat);
    }

  } )


  GHbot.onCallback( (cb, chat, user) => {

    var msg = cb.message;
    var lang = user.lang;

    //check if it's our callback
    if(!chat.isGroup) return;
    if( !cb.data.startsWith("S_RULES")) return;
    ...

    //from rules panel we add a button to access MessageMaker
    if( cb.data.startsWith("S_RULES_BUTTON:") )
    {
    
      GHbot.editMessageText( user.id, l[lang].RULES_SETTING, {
        ...
        reply_markup : {inline_keyboard :[
          [{
            text: l[lang].RULES_CHANGE_BUTTON,
            //we give a button to access MessageMaker
            callback_data: "S_RULES#MSGMK:"+chat.id
          }],
          ...
      ]}})
      GHbot.answerCallbackQuery(user.id, cb.id);
    }

    //we listen here back for requested MessageMaker accesses
    if( cb.data.startsWith("S_RULES#MSGMK") )
    {
      var returnButtons = [[{text: l[lang].BACK_BUTTON, callback_data: "S_RULES_BUTTON:"+chat.id}]];
      var title = l[lang].REGULATION;
      var msgTitle = l[lang].RULES_TITLE;
      //giving the buttons handling to MessageMaker hands
      var customMessage = MSGMK.callbackEvent(GHbot, db, chat.rules, cb, chat, user, "S_RULES", returnButtons, title, msgTitle)

      //then if customMessage has an update, we save that
      if(customMessage)
      {
        chat.rules = customMessage;
        db.chats.update(chat);
      }
    }
    ...
  })
}

module.exports = main;

```

The access point of MessageMaker is trough buttons callbacks, but it works then with the user also by expecting messages, so we need to forward also them
