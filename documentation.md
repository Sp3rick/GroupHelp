General code info

index.js does load every plugin and database and acutal bot on main.js

main.js does all necessary works before emitting on GHbot and event with many LibreGroupHelp related data ready to use

all data is managed by database.js, you can access it's methods from db.chats and db.users

all jsdocs objects documentation is on GHbot.js, it's also essential to document event parameters of GHbot events

use TGbot only if you need direct native access with telegram bot api, when possible you should use GHbot events and methods and if does not exhist the one needed create that, TGbot method docs can be found on https://github.com/yagop/node-telegram-bot-api, on TGbot.me is avaiable await TGbot.getMe() result

While coding keep in mind that user should be able to delete his data in any moment, this for respecting the privacy philosophy of LibreGroupHelp (exception can be for essential data for groups, for example warns number, allow to delete this is going to be be abusable)



<b>Plugins</b>

Look at example.js plugin to see how it uses right functions and methods to work with LibreGroupHelp
You can create functions in separate file in ./api/, but if you think it's going to be used only on your plugin you can do that in same file
If you need access text of varius languages it's stored at global.LGHLangs (I advise set it like this "l = global.LGHLangs;")



<b>Language info</b>

The bot has a different language configuration both for users and group
when LibreGroupHelp is added to a group (and add it to the database) the default group language will be inherited from the user who added the bot, (TODO. convert telegram user.language_code to LibreGroupHelp lang code, format on https://en.wikipedia.org/wiki/IETF_language_tag)



<b>Callbacks and user callbacks data management</b>

Here is described the hirarchy of callbacks data.
Giving right callaback data is essential to allow main.js to pre-set wanted values


callbacks events (buttons inteded):

cb.data OR user.waitingReplyType = CALLBACK_NAME#editor_things|editorData:groupId?targetUserId
works with less items still in same order: CALLBACK_NAME:groupId OR CALLBACK_NAME#editor?targetUserId OR CALLBACK_NAME:groupId?targetUserId

-CALLBACK_NAME: name of callback that you can use, be sure that not conflicts with other names, often plugins check if it's their match with string.startsWith()

-editor: also that is often identified with string.startsWith(), it's usually used to open re-usable menus like MessageMaker.js, setNum.js, setTime.js

-groupId: that allow main.js to set a full object of chat (note: msg.chat or cb.message.chat may be not affected, GHbot ever gives you a dedicated chat parameter), it also allow to set the user.perms object in private chat (in group it's done directly from chat.id)

-targetUserId: that allow main.js to set a target user in various cases: cb.target, msg.userWaitingReplyTarget (target for text commands is not related with that, it's also avaiable on msg.command.target and it's based on msg.text instead of targetUserId)



<b>Expect user messages</b>

You can expect for user messages by set user.waitingReply to the chatId where you are expecting a reply and user.waitingReplyType with callback data you will able to retrieve after, set to true if you want to set it for every chat, then you need to update user object on database with db.users.update(user)
When you receive a new message event user.waitingReply will be set true or false by main.js depending if it's the right chat
Remember that if you make a new user.waitingReply in a certain point you will need also to disable that, otherwise other bot functions that want that bot is not waiting for any user reply may not work



<b>Roles</b>

Roles is managed by plugins/userHandler.js and api/rolesManager.js

An user can have multiple roles at the same time
Every role has a level, higher level means best role priority, an user inherits the level of the higher level on its roles
An user can affect with any allowed command any other user with a level lower than him

Both users and roles has their own customPerms object, user perms object has the maximal priority
(rolesManager.js) sumUserPerms() will sum for you all permissions, including roles ordered by level and user perms itself with maximum priority, this function is all you need to know what the user can and can't do

Pre-made roles are set with specific commands (/mod, /muter, /cleaner, /helper, /free) +(unset with "un" prefix, ex: "/unmod")
To set custom roles the command will be /setrole roleName

User permissions data result of sumUserPerms() may be avaiable at target.perms or user.perms



<b>Custom Chat Object</b>

Additional data of custom <i>chat</i> object:
admins: array with known admins objects (user data anonymized)
lang : current chat lang
isGroup : result of (chat.type == "supergroup" || chat.type == "group")
users : Object-IdName based data about every user in the group (ex. users[643547] access data of userId 643547)
basePerms : base permissions applyed to every user
adminPerms : base permissions applyed to admin
roles : GHRole data about a specific role, full role Object if it's a custom role (key with a number)
warns : warns.js plugin related data
rules : rules.js plugin related data
welcome : welcome.js plugin related data
flood : flood.js plugin related data
-When you modify any of this data don't forget to update it with db.chats.update(chat)


<b>Custom User Object</b>

Additional data of custom <i>user</i> object:
lang : current user lang
waitingReply : set to true if the bot is expecting a message from the user
waitingReplyType : additional data related to waitingReply
-When you modify any of this data don't forget to update it with db.users.update(user)


<b>Custom Message Object</b>

Additional data of custom <i>msg</i> object:
command : result of message text parsed with parseCommand()
command.target : identified command targeted user


<b>Command Object</b>

You can get this object trough parseCommand(text)
 * @property {String} text - Full raw command text
 * @property {String} prefix - Prefix, example: / ! . , ;
 * @property {String} botCommand - Command and bot specifier (ex. "start@usernamebot")
 * @property {String} name - Command name (ex. "start")
 * @property {String} bot - Specified bot name (ex. "usernamebot")
 * @property {String} args - Raw arguments text after the command
 * @property {Array} splitArgs - Array of arguments split by space

*target is not listed because that's set later by main.js



Note: COMMAND_ prefix means that command can be solved in multiple languages
@ prefix in command name gives the permission with private chat reply (example @COMMAND_RULES)
to explicitly ask to reply to your command in private chat use * as prefix (ex. /\*rules, /\*perms)
Complete list of implemented commands:

-General
* /settings - open group settings (COMMAND_SETTINGS)
* /rules - show group rules (COMMAND_RULES) (@ avaiable)
* /perms - show permissions summary of a user (COMMAND_PERMS) (@ avaiable)
* /staff - show group staff with default and custom roles (COMMAND_STAFF) (@ avaiable)
* /info - show info about a group user and edit it (COMMAND_INFO) (@ avaiable)
* /me - show info about yourself (COMMAND_ME) (@ avaiable)
* /pin - pin a chat message with or without notification (COMMAND_PIN) (@ avaiable)

-Punishments
* /del - delete a message (COMMAND_DELETE)
* /warn - warn user and punish if reach group warn limit (COMMAND_WARN)
* /kick - kick an user out from the group (COMMAND_KICK)
* /mute - disable messages to a user (COMMAND_MUTE)
* /ban - permanently remove an user from the group (COMMAND_BAN)

-Roles
* /free - give free role to user (COMMAND_FREE)
* /unfree - remove free role to user (COMMAND_UNFREE)
* /helper - set helper role to user (COMMAND_HELPER)
* /unhelper - remove helper role to user (COMMAND_UNHELPER)
* /cleaner - set cleaner role to user (COMMAND_CLEANER)
* /uncleaner - remove cleaner role to user (COMMAND_UNCLEANER)
* /muter - set muter role to user (COMMAND_MUTER)
* /unmuter - remove muter role to user (COMMAND_UNMUTER)
* /mod - set moderator role to user (COMMAND_MODERATOR)
* /unmod - remove moderator role to user (COMMAND_UNMODERATOR)
* /cofounder - set cofounder role to user (COMMAND_COFOUNDER)
* /uncofounder - remove cofounder role to user (COMMAND_UNCOFOUNDER)
-Admins
* /admin - make user admin (COMMAND_ADMINISTRATOR)
* /unadmin - remove admin role to user (COMMAND_UNADMINISTRATOR)
* /title - set admin title (COMMAND_TITLE)
* /untitle - remove admin title (COMMAND_UNTITLE)
-Privacy
* /forgot - remove every data on the group about an user (COMMAND_FORGOT)

You can find additional info on plugins.md https://github.com/Sp3rick/GroupHelp/blob/main/plugins.md
