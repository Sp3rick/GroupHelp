Here there are various documentations about various plugins, if you created one you can document it here

If you need documentation look at here [documentation.md](https://github.com/Sp3rick/GroupHelp/blob/main/documentation.md)


## Roles Manager
(api/rolesManager.js)

>Depends on api/utils/utils.js

This plugin manages users data and roles in the group

1 means true

0 means neutral

-1 means false

<b>LGHPerms Object:</b>

>commands: array of commands, if starts with "COMMAND_" means its to be translated, otherwise is the literal command
>
>immune: active if this user can't receive any punishment (kick/warn/mute/ban) [1/0/-1]
>
>flood: permission to flood messages [1/0/-1]
>
>link: permission to send links [1/0/-1]
>
>tgLink: permission to send telegram links/usernames [1/0/-1]
>
>forward: permission to forward messages from anywhere [1/0/-1]
>
>quote: permission to quote from anywhere [1/0/-1]
>
>porn: bypass porn/gore checks [1/0/-1]
>
>night: bypass any night mode  limitation [1/0/-1]
>
>media: bypass any media limitation [1/0/-1]
>
>alphabets: Bypass any alphabets characters limitations [1/0/-1]
>
>words: Bypass banned words limitations [1/0/-1]
>
>length: Bypass message length limitations [1/0/-1]
>
>roles: permission to change roles of lower level users [1/0/-1]
>
>settings: permission to change bot group settings [1/0/-1]


Intended permissions anarchy: (if a left-side permission is not neutral overwrites everything in the right side)

chat.users[id].perms > chat.users[id].adminPerms > chat.roles[role].perms (higher role level has higher priority) > chat.basePerms



<b>chat.users[id] userStatus Object:</b>

>firtJoin: Unix number of first user join time in seconds, false if unknown
>
>perms: LGHPerms object for all user-specific permissions
>
>adminPerms: LGHPerms object for user permissions if admin
>
>roles: array of user roles, string for pre-made roles, number for custom roles (user-made)
>
>warnCount: number of user warns
>
>title: user administrator title



<b>chat.roles[role] LGHRole Object:</b> ( the pre-made roles are in global.roles[roleName] )

>name: role name
>
>emoji: emoji for the role
>
>level: role level, higher level users can use commands that affect  lower level users
>
>perms: LGHPerms object applyed at lowest priority on any user in this role
>
>users: array of userId in this role





## Message Maker
(api/MessageMaker.js)

>Depends on api/utils/utils.js

<b>simpleMedia Object:</b>

>type : Type of media (audio, photo, video, video_note, animation, sticker, document) or false
>
>fileId : media fileId or false
>
>options : additional options for TelegramBot


<b>customMessage Object:</b>

>text : Text of messsage
>
>entities : Telegram entities of text
>
>format : Boolean, true if message should be formatted (enabled by default), mean that entities should be passed on sendMessage function
>
>media : { type, fileId, thumbnail }
>
>buttons : String, can be transformed in inline_keyboard with parseTextToInlineKeyboard()
>
>buttonsParsed : already parsed buttons ready to use for inline_keyboard

<b>Callback_data order:</b>

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

(TO IMPLEMENT & TODO: allow to make a sum of dates and time)

• {RULES} = group regulation text

• {DATE} = current date

• {TIME} = current time

• {WEEKDAY} = week day

• {MONTH} = current month

• {YEAR} = current year

• {UNIX} = seconds since 1970/1/1

optional if configuration allow external api:

Syntax: FIAT{SYMBOL:OPTION}

• {BTC} {ETH} {BNB} {SOL} {XRP} {DOGE} {TON} {ADA} ... {XMR} = crypto price, avaiable any top2000 crypto symbol

• {TOP1} {TOP2} ... {TOP2000} = get crypto symbol at specific classific height (max 2000) ({TOP1} will translate to "BTC", so {{TOP1}} is the same of {BTC} and will give you the crypto price)

• Options: CAP(capitalization), VOL(24h volume), SUPPLY, RANK(cap classific), NAME, EXPLORER. (example: {CAPBITCOIN})

• Convert from default to specific currency: ${number}, €{number}, £{number}, CHF{number} or ₣{number}.

• Examples: {BNB}, €{BTC}, CHF{ETH}, £{BTC:CAP}, {XMR:SUPPLY}, €{{TOP15}} £{{TOP3}:NAME}

• Api: https://api.coincap.io/v2/assets (https://docs.coincap.io/)





## setChatBasedPunish.js

>Depends on api/utils/utils.js
>Depends on api/setTime.js

A settings panel to edit LGHChatBasedPunish object (avaiable on GHbot.js)





## usersHandler.js

>Depends on api/rolesManager.js
>Depends on api/utils/utils.js

Adds on global.roles[roleName] data about pre-made roles: founder, moderator, muter, cleaner, helper, free.

This plugin is made for automatic handling of secondary works about users on chats that's not needed to stay on main.js

Added commands: /reload, /staff, /info, /perms, /forgot





## promote.js

>Depends on api/rolesManager.js
>Depends on api/utils/utils.js

Handle promotions and unpromotions commands, allow also to edit single admin perms

Added commands: /free, /unfree, /helper, /unhelper, /cleaner, /uncleaner, /muter, /unmuter, /mod, /unmod, /cofounder, /uncofounder, /admin, /unadmin, /title, /untitle





## punish.js

>Depends on api/punishments.js
>Depends on api/utils/utils.js

Handle punish and unpunish commands

Added commands: /delete, /warn, /unwarn, /kick, /mute, /unmute, /ban, /unban





## Settings Plugin

>Depends on api/utils/utils.js

Manage settings for single users and settings panel for chats, lang setting is included

Added commands: /settings




## CommandsPerms.js

>Depends on api/utils/utils.js

A menu to change basic commands permissions for every on group or admins, in future will allow to change perms for roles 





## Rules Plugin

>Depends on api/MessageMaker.js
>Depends on api/utils/utils.js

Module to add rules of the group and allow to edit these trough settings

Added commands: /rules

Adds on chat.rules a custom object "customMessage" (Message Maker)

Note: if format is false or entities unavaiable set message parse_mode to HTML (User should see changing format as switching betheen HTML and Formatted)





## Welcome Plugin

>Depends on api/MessageMaker.js
>Depends on api/utils/utils.js

Module to allow set up a welcome message for new users in the group

Adds on chat.welcome a custom object "LGHWelcome"

LGHWelcome Object:

>state : true if welcome is enabled (default false)
>
>once : true if should be sent only at first user join (default false)
>
>clean : true if last welcome message on the group should be (default false)
>
>joinList : array cronology of users that joined the group over time
>
>lastWelcomeId : messageId of last welcome message sent, useful if clean is enabled, false if never sent one before
>
>message : customMessage object





## Anti-Flood Plugin

>Depends on api/rolesManager.js
>Depends on api/utils/utils.js
>Depends on api/setNum.js
>Depends on api/setTime.js

Adds on chat.flood a custom object "LGHFlood"

LGHFlood Object:

>messages: number of messages needed to triggher the Antiflood
>
>time: seconds within the specified message should be sent to triggher the Antiflood
>
>punishment: punishment to apply at the user that trigghers the Antiflood [0:off|1:warn|2:kick|3:mute|4:ban]
>
>PTime: avaiable if punishment is set to warn/mute/ban, contains seconds of punishment
>
>delete: true if flooded messages should be deleted





## Anti-Spam Plugin

>Depends on api/punishment.js
>Depends on api/utils/utils.js
>Depends on api/setNum.js
>Depends on api/setExceptions.js
>Depends on api/setChatBasedPunishment.js
>Depends on api/rolesManager.js

Adds on chat.flood a custom object "LGHSpam"

LGHSpam Object:

>tgLinks: rules and exceptions for telegram links considered as spam
>
>links: rules and exceptions for all links considered as spam
>
>forward: rules and exceptions for all forwarded messages considered as spam
>
>quote: rules and exceptions for all quoted messages considered as spam





## Captcha Plugin

>Depends on api/punishment.js
>Depends on api/utils/utils.js
>Depends on api/setTime.js
>Depends on api/MessageMaker.js
>Depends on svg-captcha
>Depends on canvas
>Depends on canvg
>Depends on @xmldom/xmldom
>Depends on node-fetch

Adds on chat.captcha a custom object "LGHCaptcha"

LGHSpam Object:

>state: True if welcome is enabled (default false).
>
>mode: Type of captcha, can be "image" (default "image")
>
>time: Time limit to solve the captcha
>
>once: True if should be sent only at first user join (from welcome.js) (default false).
>
>fails: True if captcha should notify on group that someone failed the captcha (default false).
>
>punishment: Punishment to apply [1:warn|2:kick|3:mute|4:ban].
>
>PTime: Available if punishment is set to warn/mute/ban, contains seconds of punishment





## Goodbye Plugin

>Depends on api/MessageMaker.js

Adds on chat.goodbye a custom object "LGHGoodbye"

LGHSpam Object:

>group: True if goodbye should be sent on group
>
>clear: True if last goodbye message should be deleted before sending a new one
>
>lastId: messageId of last goodbye message sent on group
>
>gMsg: Goodbye message to send on group
>
>private: True if goodbye should be sent on private chat
>
>pMsg: Goodbye message to send on private chat





## warns.js

>Depends on api/utils/utils.js
>Depends on api/setNum.js
>Depends on api/setTime.js

Allow you to change warn settings on a group

chat.warns Warns Object:

>timed: ([userId]: [endTime, endTime, endTime]) contains necerray data to revoke scheduled warns when time is over
>
>count: ([userId]: number) countains count of warns for each user
>
>limit: number of warns after wich should be applyed a punishment
>
>punishment: punishment when limit is hit [2:kick|3:mute|4:ban]
>
>PTime: avaiable if punishment is set to warn/mute/ban, contains seconds of punishment





## pin.js

>Depends on api/utils/utils.js

Adds /pin command and handle all related things
