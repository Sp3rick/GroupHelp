When you create a plugin you can use our-made events with many variables already set

ONLY for events from LGHBot you have additional elements bot-related
If event comes from a group the "chat" object will contain the full Custom Chat Object (look at documentation.md) by the database (it's identified by isGroup or if callback data contains a groupId)
user.perms (result of api/rolesManager/sumUserPerms()) is avaiable in 3 cases: if chat.isGroup is true, if callback.data contains a groupId, or on message if user.waitingReply is true and user.waitingReplyType contains a groupId
NOTE: user.perms is a temporary item, it's not intended to be saved in the database (database does not save it)
Any "msg" object contains msg.command (result of api/utils/parseCommand(msg.text))
--Targets--
Any msg.command object may contain an msg.command.target object if a command target user is found
Also cb.target may exhist, builded up from user id after "?" in cb.data
user.waitingReplyTarget is set if a target if found in user.waitingReplyType (after "#")

NOTE FOR CALLBACK EVENT: callback event gives you the full chat object only if chat.isGroup is true, if is private chat you should require it yourself from the database (var settingsChatId = cb.data.split(":")[1]; var settingsChat = db.chats.get(settingsChatId))

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
immune: active if this user can't receive any punishment (kick/warn/mute/ban) [1/0/-1]
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
chat.users[id].perms > chat.users[id].adminPerms > chat.roles[role].perms (higher role level has higher priority) > chat.basePerms



chat.users[id] userStatus Object:

firtJoin: Unix number of first user join time in seconds, false if unknown
perms: LGHPerms object for all user-specific permissions
adminPerms: LGHPerms object for user permissions if admin
roles: array of user roles, string for pre-made roles, number for custom roles (user-made)
warnCount: number of user warns
title: user administrator title



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

text avaiable substitutions:
• {ID} = user ID
• {NAME} = first name of user
• {SURNAME} = user surname
• {NAMESURNAME} = name and surname
• {GHNAME} = name in LGH format
• {USERNAME} = user @username
• {MENTION} = link to the user profile
• {LANG} = user language
• {FLAG} = user language flag
• {GROUPNAME} = group name
• {GROUPUSERNAME} = group username
• {GROUPID} = group id
(TO IMPLEMENT)
• {RULES} = group regulation text
• {DATE} = current date
• {TIME} = current time
• {WEEKDAY} = week day
• {MONTH} = current month
• {YEAR} = current year
• {UNIX} = seconds since 1970/1/1

(TO IMPLEMENT)
optional if configuration allow external api:
• {HALVING} = remaining time for bitcoin halving
• {BTC} {ETH} {BNB} {SOL} {XRP} {DOGE} {TON} {ADA} ... {XMR} = avaiable any top100 crypto symbol
• {TOP1} {TOP2} ... {TOP100} = get crypto symbol specific classific height (max 100)
-Crypto prefixes: CAP(capitalization), VOL(24h volume), RANK(cap classific), SUPPLY, NAME, EXPLORER. (example: {CAPBITCOIN})
-Currency crypto prefixes: $, €, £, CHF or ₣. (default on group currency)
-Examples: {BNB}, {€BTC}, {CHFETH}, {£CAPBTC}, {SUPPLYXMR}, {€{TOP15}} {£VOL{TOP3}}
-Api: https://api.coincap.io/v2/assets (https://docs.coincap.io/)





<b>usersHandler.js</b>

>Depends on api/rolesManager.js
>Depends on api/utils.js

Adds on global.roles[roleName] data about pre-made roles: founder, moderator, muter, cleaner, helper, free.
This plugin is made for automatic handling of secondary works about users on chats that's not needed to stay on main.js
Added commands: /reload, /staff, /info, /perms, /forgot





<b>promote.js</b>

>Depends on api/rolesManager.js
>Depends on api/utils.js

Handle promotions and unpromotions commands, allow also to edit single admin perms
Added commands: /free, /unfree, /helper, /unhelper, /cleaner, /uncleaner, /muter, /unmuter, /mod, /unmod, /cofounder, /uncofounder, /admin, /unadmin, /title, /untitle





<b>punish.js</b>

>Depends on api/punishments.js
>Depends on api/utils.js

Handle punish and unpunish commands
Added commands: /delete, /warn, /unwarn, /kick, /mute, /unmute, /ban, /unban





<b>Settings Plugin</b>

>Depends on api/utils.js

Manage settings for single users and settings panel for chats, lang setting is included
Added commands: /settings





<b>Rules Plugin</b>

>Depends on api/MessageMaker.js
>Depends on api/utils.js

Module to add rules of the group and allow to edit these trough settings
Added commands: /rules

Adds on chat.rules a custom object "customMessage" (Message Maker)

Note: if format is false or entities unavaiable set message parse_mode to HTML (User should see changing format as switching betheen HTML and Formatted)





<b>Welcome Plugin</b>

>Depends on api/MessageMaker.js
>Depends on api/utils.js

Module to allow set up a welcome message for new users in the group

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





<b>warns.js</b>

>Depends on api/utils.js
>Depends on api/setNum.js
>Depends on api/setTime.js

Allow you to change warn settings on a group

chat.warns Warns Object:

timed: ([userId]: [endTime, endTime, endTime]) contains necerray data to revoke scheduled warns when time is over
count: ([userId]: number) countains count of warns for each user
limit: number of warns after wich should be applyed a punishment
punishment: punishment when limit is hit [2:kick|3:mute|4:ban]
PTime: avaiable if punishment is set to warn/mute/ban, contains seconds of punishment
