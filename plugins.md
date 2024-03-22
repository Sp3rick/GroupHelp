<b>Message Maker</b>
(api/MessageMaker.js)

>Depends on api/utils.js

simpleMedia Object:

type : Type of media (audio, photo, video, video_note, animation, sticker, document) or false
fileId : media fileId or false
options : additional options for TelegramBot


customMessage Object:

text : Text of messsage
entities : Telegram entities of text
format : Boolean, true if message should be formatted (enabled by default), mean that entities should be passed on sendMessage function
media : { type, fileId, thumbnail }
buttons : String, can be transformed in inline_keyboard with parseTextToInlineKeyboard()
buttonsParsed : already parsed buttons ready to use for inline_keyboard

Callback_data order:

CallerPrefix#MSGMK:settingsChatId
CallerPrefix is useful to allow the caller to identify it's own callback (ex. if( cb.data.startsWith(myPrefix) ... ))

TODO: allow photo preview-mode


<b>Rules Plugin</b>

>Depends on api/MessageMaker.js
>Depends on api/utils.js

Editable from /settings menù, creates the /rules command

Adds on chat.rules a custom object "customMessage" (Message Maker)

Note: if format is false or entities unavaiable set message parse_mode to HTML (User should see changing format as switching betheen HTML and Formatted)


<b>Welcome Plugin</b>

Adds on chat.welcome a custom object "welcomeObject"

welcomeObject Object:

state : true if welcome is enabled (default true)
once : true if should be sent only at first user join (default false)
clean : true if last welcome message on the group should be deleted
message : customMessage object
