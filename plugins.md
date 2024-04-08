When you create a plugin you can use our-made events with many variables already set

ONLY for events from LGHBot you have additional elements bot-related
If event comes from a group the "chat" object will contain the full Custom Chat Object (look at documentation.md) by the database (it's identified by isGroup or if callback data contains a groupId)
user.perms (result of api/rolesManager/sumUserPerms()) is avaiable in 3 cases: if chat.isGroup is true, if callback.data contains a groupId, or on message if user.waitingReply is true and user.waitingReplyType contains a groupId
NOTE: user.perms is a temporary item, it's not intended to be saved in the database (database does not save it)
Any "msg" object contains msg.command (result of api/utils/parseCommand(msg.text))

NOTE FOR CALLBACK EVENT: callback event gives you the full chat object only if chat.isGroup is true, if is private chat you should require it yourself from the database

You can find a comment referring security guards that you can use too in plugins/welcome.js


<b>Roles Manager</b>
(api/rolesManager.js)

>Depends on api/utils.js

This plugin manages users data and roles in the group
1 means true
0 means neutral
-1 means false

LGHPerms Object:

commands: array of commands, if starts with "COMMAND_" means its to be translated, otherwise is the literal command
immune: active if this user can't receive any punishment (kick/warn/mute/ban) [1/0/-1](TO IMPLEMENT)
flood: permission to flood messages [1/0/-1]
link: permission to send links [1/0/-1]
tgLink: permission to send telegram links/usernames [1/0/-1]
forward: permission to forward messages from anywhere [1/0/-1]
quote: permission to quote from anywhere [1/0/-1]
porn: bypass porn/gore checks [1/0/-1]
night: bypass any night mode  limitation [1/0/-1]
media: bypass any media limitation [1/0/-1]
roles: permission to change roles of lower level users [1/0/-1]
settings: permission to change bot group settings [1/0/-1]


Intended permissions anarchy: (if a left-side permission is not neutral overwrites everything in the right side)
chat.users[id].perms > chat.users[id].adminPerms > chat.roles[role].perms (higher role level has higher priority)



chat.users[id] userStatus Object:

warnCount: number of user warns
perms: LGHPerms object for all user-specific permissions
adminPerms: LGHPerms object for user permissions if admin
fullName: result of usernameOrFullName(user)
title: user administrator title
roles: array of user roles, string for pre-made roles, number for custom roles (user-made)



chat.roles[role] LGHRole Object: ( the pre-made roles are in global.roles[roleName] )

name: role name
emoji: emoji for the role
level: role level, higher level users can use commands that affect  lower level users
perms: LGHPerms object applyed at lowest priority on any user in this role
users: array of userId in this role





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

Adds on chat.welcome a custom object "LGHWelcome"

LGHWelcome Object:

state : true if welcome is enabled (default false)
once : true if should be sent only at first user join (default false)
clean : true if last welcome message on the group should be (default false)
joinList : array cronology of users that joined the group over time
lastWelcomeId : messageId of last welcome message sent, useful if clean is enabled, false if never sent one before
message : customMessage object





<b>Anti-Flood Plugin</b>

>Depends on api/rolesManager.js
>Depends on api/utils.js
>Depends on api/setNum.js
>Depends on api/setTime.js

Adds on chat.flood a custom object "LGHFlood"

LGHFlood Object:

messages: number of messages needed to triggher the Antiflood
time: seconds within the specified message should be sent to triggher the Antiflood
punishment: punishment to apply at the user that trigghers the Antiflood [0:off|1:warn|2:kick|3:mute|4:ban]
PTime: avaiable if punishment is set to warn/mute/ban, contains seconds of punishment 
delete: true if flooded messages should be deleted

-




<b>UsersHandler.js</b>

>Depends on api/rolesManager.js
>Depends on api/utils.js

Adds on global.roles[roleName] data about pre-made roles: founder, moderator, muter, cleaner, helper, free.
This plugin adds /perms command and handle any new user on the chat




<b>warns.js</b>

chat.warns Warns Object:

timed: ([userId]: [endTime, endTime, endTime]) contains necerray data to revoke scheduled warns when  time is over
limit: number of warns after wich should be applyed a punishment
punishment: punishment when limit is hit [2:kick|3:mute|4:ban]
PTime: avaiable if punishment is set to warn/mute/ban, contains seconds of punishment
