When you create a plugin you can use our-made events with many variables already set
If is a group the "chat" object will contain the full object
Any "chat" object contain the boolean value chat.isGroup and if true also chat.lang for lang of the group
Any "msg" object contain the "command" result of api/utils.js/parseCommand(msg.text)


<b>Roles Manager</b>
(api/rolesManager.js)

>Depends on api/utils.js




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

>Depends on api/MessageMaker.js
>Depends on api/utils.js

Adds on chat.welcome a custom object "welcomeObject"

welcomeObject Object:

state : true if welcome is enabled (default false)
once : true if should be sent only at first user join (default false)
clean : true if last welcome message on the group should be (default false)
joinList : array cronology of users that joined the group over time
lastWelcomeId : messageId of last welcome message sent, useful if clean is enabled, false if never sent one before
message : customMessage object





<b>Anti-Flood Plugin</b>

>Depends on api/rolesManager.js
>Depends on api/utils.js

Adds on chat.flood a custom object "floodObject"

floodObject Object:

messages: number of messages needed to triggher the Antiflood
time: seconds within the specified message should be sent to triggher the Antiflood
punishment: punishment to apply at the user that trigghers the Antiflood [0:off|1:warn|2:kick|3:mute|4:ban]
PTime: avaiable if punishment is set to warn/mute/ban, contains seconds of mute
delete: true if flooded messages should be deleted

-




<b>UsersHandler.js</b>

This plugin manages users data in the group
1 means true
0 means neutral
-1 means false

customPerms Object:

commands: array of commands, if starts with "COMMAND_" means its to be translated, otherwise is the literal command
flood: permission to flood messages [1/0/-1]
link: permission to send links [1/0/-1]
tgLink: permission to send telegram links/usernames [1/0/-1]
forward: permission to forward messages from anywhere [1/0/-1]
quote: permission to quote from anywhere [1/0/-1]
porn: bypass porn/gore checks [1/0/-1]
night: bypass any night mode  limitation [1/0/-1]
media: bypass any media limitation [1/0/-1]
roles: permission to change roles of lower level users [1/0/-1]


chat.users[id].perms overwrites a permission of chat.roles[role].perms if users permission isn't neutral (0), array get summed


chat.users[id] userStatus Object:

warnCount: number of user warns
perms: customPerms object for all user-specific permissions
roles: array user roles, string for pre-made roles, number for custom roles (user-made)


chat.roles[role] GHRole Object: ( the pre-made roles are in global.roles[roleName] )

name: role name
emoji: emoji for the role
level: role level, higher level users can use commands that affect  lower level users
perms: customPerms object applyed at lowest priority on any user in this role
users: array of userId in this role


Staff and user management warn
