General code info

A new user is added to database when does write in private chat to the bot or when add him to a groups (other users id may be stored in other groups configurations)

"TGbot" variable is for using the bot with all its methods, "bot" is equal to access to bot data (bot = await TGbot.getMe()), docs on https://github.com/yagop/node-telegram-bot-api

While coding keep in mind that user should be able to delete his data in any moment, this for respecting the privacy philosophy of LibreGroupHelp (exception can be when user is banned from a group or is a staff where will be stored ONLY the userId)


<b>Plugins folder info</b>

The code has been modularized so now you can add indipendent module files in "plugins" folder, as you can see in example.js you should require from <i>var LGHelpTemplate = require("../GHbot.js")</i>, create (and assign it to module.exports) a function with 1 argument, use this argument to extract all needed from template <i>var {GHbot, TGbot, db} = new LGHelpTemplate(args);</i>
By that way you will be able to write plugins with all needed jsdocs (Idk how to jsdoc events, currently it's missing)
If you need access text of varius languages it's stored at global.LGHLangs (I advise set it like this "l = global.LGHLangs;")



<b>Language info</b>

The bot has a different language configuration both for users and group
when LibreGroupHelp is added to a group(and add it to the database) the default group language will be inherited from the user who added the bot, the bot assumes that the user has already been added to the database before for inher the lang from (ps. find how to use telegram function to set that a bot can be added only from an admin)


main.js Global variables language-related:

var langKeys = Object.keys(l); 
var loadedLangs = Object.keys(l).length; Total number of loaded languages


<b>Custom Chat Object</b>

Additional data of custom <i>chat</i> object:
admins: array with known admins objects (user data anonymized)
lang : current setted chat lang
isGroup : result of (chat.type == "supergroup" || chat.type == "group")
warns : warns.js plugin related data
users : Object-IdName based data about every user in the group (ex. users[643547] access data of userId 643547)
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


<b>Command Object</b>

You can get this object trough parseCommand(text)
 * @property {String} text - Full raw command text
 * @property {String} prefix - Prefix, example: / ! . , ;
 * @property {String} botCommand - Command and bot specifier (ex. "start@usernamebot")
 * @property {String} name - Command name (ex. "start")
 * @property {String} bot - Specified bot name (ex. "usernamebot")
 * @property {String} args - Raw arguments text after the command
 * @property {Array} splitArgs - Array of arguments split by space

<b>What is done</b>

Add/Removing bot from group handling (not implemented the latter options after  message)
    -Thanksgiving with some hint
    -Settings and lang configuration hint

Default "Hello" message when user write in private chat at bot

Group settings (/settings) with main panel (Todo page 2)

Rules (/rules)

Bot support (does not allow media, currently users should use https://telegra.ph/)

Separate language selection and management for groups and users fully implemented




Complete list of implemented commands:

/settings - open group settings (COMMAND_SETTINGS)
/rules - show group rules (COMMAND_RULES)
/permissions (or /perms) - show permissions summary of a user (COMMAND_PERMS)

(Toimplement):
/del - delete a message (COMMAND_DELETE)
/warn - warn user and punish if reach group warn limit (COMMAND_WARN)
/kick - kick an user out from the group (COMMAND_KICK)
/mute - disable messages to a user (COMMAND_MUTE)
/ban - permanently remove an user from the group (COMMAND_BAN)
