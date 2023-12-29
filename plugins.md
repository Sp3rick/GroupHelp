<b>Message Maker</b>
(api/MessageMaker.js)

MSGMK Object:

text : Text of messsage
entities : Telegram entities of text
format : Boolean, true if message should be formatted (enabled by default), mean that entities will be passed on sendMessage function
buttons : String, can me transformed in inline_keyboard with parseTextToInlineKeyboard()
buttonsParsed : already parsed buttons ready to use for inline_keyboard


<b>Rules Plugin</b>

>Depends on api/MessageMaker.js
>Depends on api/utils.js

Editable from /settings menù, creates the /rules command

Adds on chat.rules a custom object "MSGMK" (Message Maker) with following elements:

Note: if format is false or entities unavaiable set message parse_mode to HTML (User should see changing format as switching betheen HTML and Formatted)
