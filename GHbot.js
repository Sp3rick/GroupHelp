/**
 *  IMPORTANT: README
 * If you edit this file don't forget to run `node runDocs.js` before pull request
 * In case of errors maybe you wrong something on the JSDocs here
 */

const TelegramBot = require("node-telegram-bot-api");
const { pushUserRequest } = require("./api/tg/SafeTelegram");


//BASIC DECLARATIONS
/**
 * @typedef {Object} AnonTGUser - Basic anonymized user object
 * @property {String|Number} id - userId
 */


//PUNISH
/**
 * @typedef {0|1|2|3|4} Punishment
 * @description Punishment to apply
 * - 0: off
 * - 1: warn
 * - 2: kick
 * - 3: mute
 * - 4: ban
 */
/**
 * @typedef {Object} LGHPunish antispam.js settings Object.
 * @property {Punishment} punishment - Punishment to apply [0:off/1:warn/2:kick/3:mute/4:ban].
 * @property {Number|null} PTime - Available if punishment is set to warn/mute/ban, contains seconds of punishment.
 * @property {boolean|null} delete - True if deletion is enabled as side effect.
 */
/**
 * @typedef {Object} LGHChatBasedPunish - Object to reresent different punish settings for more chat types
 * @property {LGHPunish} channels - Punish to apply for channels.
 * @property {LGHPunish} groups - Punish to apply for groups.
 * @property {LGHPunish} users - Punish to apply for users.
 * @property {LGHPunish} bots - Punish to apply for bots.
 */
/**
 * @typedef {Object} LGHAlphabetBasedPunish - Object to reresent different punish settings for messages containing various Alphabets
 * @property {LGHPunish} arabic - Punish to apply for messages containing arabic characters.
 * @property {LGHPunish} cyrillic - Punish to apply for messages containing cyrillic (russian) characters.
 * @property {LGHPunish} chinese - Punish to apply for messages containing chinese characters.
 * @property {LGHPunish} latin - Punish to apply for messages containing latin characters.
 */


//TARGETUSER
/**
 * @typedef {Object} TargetUser - Object that refers to a target user
 * @property {string|number} id - Telegram user Id
 * @property {string} name - Full LGH name identifier: "fullName [id]"
 * @property {LGHPerms} perms - LGHPerms with perms of target
 * @property {TelegramBot.User|null} user - If avaiable, target basic user object
 */


/**
 * @enum {number}
 * @description Permission status
 * - 1: allowed
 * - 0: neutral
 * - -1: denied
 */
const PermissionStatus = {
    ALLOWED: 1,
    NEUTRAL: 0,
    DENIED: -1,
};  

//PERMISSIONS
/**
 * @typedef {Object} LGHPerms - LGHPerms Object.
 * @property {Array.<string>} commands - Array of commands, if starts with "COMMAND_" means its to be translated, otherwise is the literal command.
 * @property {PermissionStatus} immune - Active if this user can't receive any punishment (kick/warn/mute/ban) [1/0/-1].
 * @property {PermissionStatus} flood - Permission to flood messages [1/0/-1].
 * @property {PermissionStatus} link - Permission to send links [1/0/-1].
 * @property {PermissionStatus} tgLink - Permission to send telegram links/usernames [1/0/-1].
 * @property {PermissionStatus} forward - Permission to forward messages from anywhere [1/0/-1].
 * @property {PermissionStatus} quote - Permission to quote from anywhere [1/0/-1].
 * @property {PermissionStatus} porn - Bypass porn/gore checks [1/0/-1].
 * @property {PermissionStatus} night - Bypass any night mode limitation [1/0/-1].
 * @property {PermissionStatus} media - Bypass any media limitation [1/0/-1].
 * @property {PermissionStatus} alphabets - Bypass any alphabets characters limitations [1/0/-1].
 * @property {PermissionStatus} words - Bypass banned words limitations [1/0/-1].
 * @property {PermissionStatus} length - Bypass message length limitations [1/0/-1].
 * @property {PermissionStatus} roles - Permission to change roles of lower level users [1/0/-1].
 * @property {PermissionStatus} settings - Permission to change bot group settings [1/0/-1].
 */


//MESSAGEMAKER
/**
 * @typedef {Object} simpleMedia
 * @property {String|null} type - Type of media (audio, photo, video, video_note, animation, sticker, document) or false
 * @property {String} fileId - media fileId or false
 * @property {Object} options - additional options for TelegramBot
 */
/**
 * @typedef {Object} customMessage - object of MessageMaker
 * @property {String} text - Text of messsage
 * @property {Array.<TelegramBot.MessageEntity>} entities - Telegram entities of text
 * @property {Array.<String>} roles - array user roles, string for pre-made roles, number for custom roles (user-made)
 * @property {Boolean} format - true if message should be formatted (enabled by default), mean that entities should be passed on sendMessage function
 * @property {simpleMedia} media - user administrator title
 * @property {String} buttons - can be transformed in inline_keyboard with parseTextToInlineKeyboard()
 * @property {Array.<TelegramBot.KeyboardButton>} buttonsParsed - already parsed buttons ready to use for inline_keyboard
 */


//CUSTOM CHAT DECLARATIONS
/**
 * @typedef {object} LGHAdminAdds
 * @property {AnonTGUser} user - Basic anonymized user object
 * @property {TelegramBot.ChatMemberStatus} status
 */
/**
 * @typedef {TelegramBot.ChatAdministratorRights | LGHAdminAdds} LGHAdmin
 */
/**
 * @typedef {Array<LGHAdmin>} LGHAdminList
 */
/**
 * @typedef {Object} userStatus - object with data about an user in a group
 * @property {Number} firtJoin - Unix number of first user join time in seconds, false if unknown (managed by welcome.js)
 * @property {LGHPerms} perms - LGHPerms object for all user-specific permissions
 * @property {LGHPerms} adminPerms - LGHPerms object for user permissions if admin
 * @property {Array.<String>} roles - array user roles, string for pre-made roles, number for custom roles (user-made)
 * @property {String|undefined} title - user administrator title
 * @property {String|null} waitingReply - string with callback data hirarchy if bot is expecting a message from user on group
 */
/**
 * @typedef {Object} LGHRole - if pre-made role (string key) only users object should be used
 * @property {String|null} name - role name
 * @property {String|null} emoji - emoji for the role
 * @property {Number|null} level - role level, higher level users can use commands that affect  lower level users
 * @property {LGHPerms|null} perms - LGHPerms object applyed at lowest priority on any user in this role
 * @property {Array.<String>} users - array of userId in this role
 */


//PLUGINS DECLARATIONS
//warns
/**
 * @typedef {Object} LGHWarns - warns.js plugin related data
 * @property {Object.<string, Number>} timed - ([userId]: [endTime, endTime, endTime]) contains necerray data to revoke scheduled warns when  time is over
 * @property {Object.<string, Number>} count - ([userId]: number) countains count of warns for each user
 * @property {Number} limit - number of warns after wich should be applyed a punishment
 * @property {2|3|4} punishment - punishment when limit is hit [2:kick/3:mute/4:ban]
 * @property {Number|null} PTime - avaiable if punishment is set to warn/mute/ban, contains seconds of punishment
 */

//welcome
/**
 * @typedef {Object} LGHWelcome - welcome.js settings Object.
 * @property {boolean} state - True if welcome is enabled (default false).
 * @property {boolean} once - True if should be sent only at first user join (default false).
 * @property {boolean} clean - True if last welcome message on the group should be (default false).
 * @property {Array.<string|number>} joinList - cronology of users that joined the group over time.
 * @property {string|number|boolean} lastWelcomeId - MessageId of last welcome message sent, useful if clean is enabled, false if never sent one before.
 * @property {customMessage} message - CustomMessage object.
 */

//antiflood
/**
 * @typedef {Object} LGHFloodAdds - antiflood.js settings additional Object elements.
 * @property {Number} messages - Number of messages needed to trigger the Antiflood.
 * @property {Number} time - Seconds within the specified message should be sent to trigger the Antiflood.
 * @property {Boolean} edit - True if antiflood should count also edited messages
 */
/**
 * @typedef {LGHFloodAdds & LGHPunish} LGHFlood - antiflood.js settings Object.
 */

//antispam
/**
 * @typedef {Object} LGHSpamTgLinksAdds - antispam.js settings Object additional items.
 * @property {Boolean} usernames - True if usernames should be considered as spam.
 * @property {Boolean} bots - True if bots should be considered as spam.
 * @property {Array<String>} exceptions - Array of Telegram exceptions, may contain "Name:Id", `Name:|hidden` (for hidden users), or t.me link, or @username, "Name"
 */
/**
 * @typedef {LGHSpamTgLinksAdds & LGHPunish} LGHSpamTgLinks - antispam.js settings about Telegram Links Object.
 */
/**
 * @typedef {Object} LGHSpamLinksAdds - antispam.js spam links Object additional items.
 * @property {Array<String>} exceptions - Array of strings of allowed links or hostnames.
 */
/**
 * @typedef {LGHSpamLinksAdds & LGHPunish} LGHSpamLinks - antispam.js settings about Links Object.
 */
/**
 * @typedef {LGHChatBasedPunish} LGHSpamForward - antispam.js settings about foward.
 */
/**
 * @typedef {LGHChatBasedPunish} LGHSpamQuote - antispam.js settings about quote.
 */
/**
 * @typedef {Object} LGHSpam - antispam.js settings Object.
 * @property {LGHSpamTgLinks} tgLinks - rules and exceptions for telegram links considered as spam
 * @property {LGHSpamLinks} links - rules and exceptions for all links considered as spam
 * @property {LGHSpamForward} forward - rules and exceptions for all forwarded messages considered as spam
 * @property {LGHSpamQuote} quote - rules and exceptions for all quoted messages considered as spam
 */

//goodbye
/**
 * @typedef {Object} LGHGoodbye - goodbye.js settings
 * @property {Boolean} group - True if goodbye should be sent on group
 * @property {Boolean} clear - True if last goodbye message should be deleted before sending a new one
 * @property {TelegramBot.MessageId} lastId - messageId of last goodbye message sent on group
 * @property {CustomMessage} gMsg - Goodbye message to send on group
 * @property {Boolean} private - True if goodbye should be sent on private chat
 * @property {CustomMessage} pMsg - Goodbye message to send on private chat
 */

//captcha
/**
 * @typedef {Object} LGHCaptcha - captcha.js settings
 * @property {Boolean} state - True if welcome is enabled (default false).
 * @property {string} mode - Type of captcha, can be "image" (default "image").
 * @property {Number} time - Time limit to solve the captcha
 * @property {boolean} once - True if should be sent only at first user join (from welcome.js) (default false).
 * @property {boolean} fails - True if captcha should notify on group that someone failed the captcha (default false).
 * @property {Punishment} punishment - Punishment to apply [1:warn/2:kick/3:mute/4:ban].
 * @property {Number} PTime - Available if punishment is set to warn/mute/ban, contains seconds of punishment.
 */

//media
/**
 * @typedef {Object} LGHMedia - media.js settings, if LGHPunish is disabled the object will be deleted (undefinied)
 * @property {LGHPunish|undefined} photo
 * @property {LGHPunish|undefined} video
 * @property {LGHPunish|undefined} album
 * @property {LGHPunish|undefined} gif
 * @property {LGHPunish|undefined} voice
 * @property {LGHPunish|undefined} audio
 * @property {LGHPunish|undefined} sticker
 * @property {LGHPunish|undefined} sticker_video
 * @property {LGHPunish|undefined} dice
 * @property {LGHPunish|undefined} emoji_video
 * @property {LGHPunish|undefined} emoji_premium
 * @property {LGHPunish|undefined} video_note
 * @property {LGHPunish|undefined} file
 * @property {LGHPunish|undefined} game
 * @property {LGHPunish|undefined} contact
 * @property {LGHPunish|undefined} poll
 * @property {LGHPunish|undefined} location
 * @property {LGHPunish|undefined} capital
 * @property {LGHPunish|undefined} payment
 * @property {LGHPunish|undefined} via_bot
 * @property {LGHPunish|undefined} story
 * @property {LGHPunish|undefined} spoiler
 * @property {LGHPunish|undefined} spoiler_media
 * @property {LGHPunish|undefined} giveaway
 * @property {LGHPunish|undefined} mention
 * @property {LGHPunish|undefined} text_mention
 * @property {LGHPunish|undefined} hashtag
 * @property {LGHPunish|undefined} cashtag
 * @property {LGHPunish|undefined} command
 * @property {LGHPunish|undefined} url
 * @property {LGHPunish|undefined} email
 * @property {LGHPunish|undefined} number
 * @property {LGHPunish|undefined} bold
 * @property {LGHPunish|undefined} italic
 * @property {LGHPunish|undefined} underline
 * @property {LGHPunish|undefined} striketrough
 * @property {LGHPunish|undefined} quoteblock
 * @property {LGHPunish|undefined} closed_blockquote
 * @property {LGHPunish|undefined} code
 * @property {LGHPunish|undefined} pre_code
 * @property {LGHPunish|undefined} textlink
 * @property {LGHPunish|undefined} scheduled
 * @property {LGHPunish|undefined} effect
 */


// LGHCHAT COMPLETING
/**
 * @typedef {Object} CustomChat - Additional chat elements for chat object by LibreGroupHelp
 * @property {LGHAdminList|null} admins - array with known admins objects (user data anonymized)
 * @property {String|null} lang - current chat lang
 * @property {String|null} currency - currency of chat, default to USD
 * @property {string|null} link - group access link
 * @property {Boolean} isGroup - temporary item, result of `(chat.type == "supergroup" || chat.type == "group")`
 * @property {Object.<string, userStatus>|null} users - Object-IdName based data about every user in the group (ex. users[643547] access data of userId 643547)
 * @property {Object.<string, LGHRole>|null} roles - data about a specific role, full role Object if it's a custom role (key with a number)
 * @property {LGHPerms} basePerms - base permissions applyed to every user
 * @property {LGHPerms} adminPerms - base permissions applyed to admin
 * @property {LGHWarns|null} warns - warns.js plugin related data
 * @property {customMessage|null} rules - rules.js plugin related data
 * @property {LGHWelcome|null} welcome - welcome.js plugin related data
 * @property {LGHFlood|null} flood - antiflood.js plugin related data
 * @property {LGHSpam|null} spam - antispam.js plugin related data
 * @property {LGHCaptcha|null} captcha - captcha.js plugin related data
 * @property {LGHGoodbye|null} goodbye - goodbye.js plugin related data
 * @property {LGHAlphabetBasedPunish|null} alphabets - alphabets.js plugin related data
 * @property {LGHMedia|null} media - media.js plugin related data
 */
/**
 * @typedef {TelegramBot.Chat & CustomChat} LGHChat - Full LGH chat object given by LGHBot events, custom items avaiable if working about a group
 */

/**
* @returns {LGHChat} testing jsdoc advices
*/
function testObject() {
   return ""
}
testObject()


//CUSTOM USER DECLARATIONS
/**
 * @typedef {Object} CustomUser
 * @property {LGHPerms|null} perms - temporary object with summary of user permissions
 * @property {String} lang - current user lang
 * @property {String} waitingReply - set to true if the bot is expecting a message from the user
 */
/**
 * @typedef {TelegramBot.User & CustomUser} LGHUser - Custom chat object given by LGHBot events, custom items avaiable if working about a group
 */


//CUSTOM MESSAGE DECLARATIONS
/**
 * @typedef {Object} ParsedCommand - ParsedCommand Object.
 * @property {string} text - The original text input.
 * @property {string} prefix - The prefix used in the command (e.g., "/", "!", ".").
 * @property {string} botCommand - The command with bot name (e.g., "start@usernamebot").
 * @property {string} name - The name of the command.
 * @property {string} bot - The bot name (if available).
 * @property {(string|boolean)} args - The arguments of the command (optional).
 * @property {(Array.<string>|boolean)} splitArgs - The split arguments of the command (optional).
 */
/**
 * @typedef {Object} CustomCommand - Additional items to command for LGH
 * @property {TargetUser|null} target - Optional temporary object with data about a target LGH user in the command, false if no target found
 */
/**
 * @typedef {Object} CustomMessage
 * @property {LGHChat} chat - Always original chat object where the message is coming from
 * @property {ParsedCommand & CustomCommand} command - result of message text parsed with parseCommand()
 * @property {TargetUser|null} target - Optional temporary object with data about a command target
 * @property {string|null} waitingReply - Optional temporary object with waitingReply data for the selected chat
 * @property {TargetUser|null} waitingReplyTarget - Optional temporary object with data about a target LGH user, false if no target found
 */
/**
 * @typedef {TelegramBot.Message & CustomMessage} LGHMessage - Custom chat object given by LGHBot events, custom items avaiable if working about a group
 */


//CUSTOM CALLBACK DECLARTIONS
/**
 * @typedef {Object} CustomCallback
 * @property {LGHChat} chat - Always original chat object where the callback is coming from
 * @property {TargetUser} target - Optional temporary object with data about a target LGH user in the command, false if no target found
 */
/**
 * @typedef {TelegramBot.CallbackQuery & CustomCallback} LGHCallback - Custom callback object given by LGHBot events, custom items may be avaiable
 */


//DATABASE
/**
 * @typedef {Object} chatsDatabase - Object containing chat-related database functions.
 * @property {function(TelegramBot.Chat): boolean} add - Function to add a new chat to the database. ------------------------------------ `function(TelegramBot.Chat): boolean`
 * @property {function(TelegramBot.ChatId): boolean} delete - Function to delete a chat from the database. ------------------------------------ `function(TelegramBot.ChatId): boolean`
 * @property {function(TelegramBot.ChatId): boolean} exhist - Function to check if a chat exhists in the database. ------------------------------------ `function(TelegramBot.ChatId): boolean`
 * @property {function(TelegramBot.ChatId): LGHChat} get - Function to retrieve a chat from the database. ------------------------------------ `function(LGHChat): boolean`
 * @property {function(LGHChat): boolean} update - Function to update a chat in the database. ------------------------------------ `function(LGHChat): boolean`
 * @property {function(TelegramBot.ChatId): boolean} save - Function to save a chat to the database. ------------------------------------ `function(TelegramBot.ChatId): boolean`
 */
/**
 * @typedef {Object} usersDatabase - Object containing user-related database functions.
 * @property {function(TelegramBot.User): boolean} add - Function to add a new user to the database. ------------------------------------ `function(TelegramBot.User): boolean`
 * @property {function(TelegramBot.ChatId): boolean} delete - Function to delete a user from the database. ------------------------------------ `function(TelegramBot.ChatId): boolean`
 * @property {function(TelegramBot.ChatId): boolean} exhist - Function to check if a user exhists in the database. ------------------------------------ `function(TelegramBot.ChatId): boolean`
 * @property {function(TelegramBot.ChatId): LGHUser} get - Function to retrieve a user from the database. ------------------------------------ `function(TelegramBot.ChatId): LGHUser`
 * @property {function(LGHUser): boolean} update - Function to update a user in the database. ------------------------------------ `function(LGHUser): boolean`
 */
/**
 * @typedef {Object} LGHDatabase - Type returned by the getDatabase function.
 * @property {string} innerDir - Location where the database folder should be placed (and/or generated).
 * @property {string} dir - Full path to the database folder.
 * @property {string} chatsDir - Full path to the chats folder within the database.
 * @property {string} usersDir - Full path to the users folder within the database.
 * @property {chatsDatabase} chats - Object containing chat-related database functions.
 * @property {usersDatabase} users - Object containing user-related database functions.
 * @property {Function} unload - Function to unload chats from memory.
 */


//TEMPLATE DECLARATION
/**
 * @typedef {Object} LibreGHelp
 * @property {LGHInterface} GHbot - Public interface for LGH Functions
 * @property {TelegramBot} TGbot - Raw telegram bot api
 * @property {LGHDatabase} db - Database interface
 */

/**
 * @class
 * @classdesc
 * @param {LibreGHelp} LibreGHelp - Libre Group Help telegram bot handler
 */
class LGHInterface {
    constructor(LibreGHelp) {

        /**
        * @type {LGHInterface}
        */
        this.GHbot = LibreGHelp.GHbot;

        /**
         * @type {TelegramBot}
         */
        this.TGbot = LibreGHelp.TGbot;

        /**
         * @type {LGHDatabase}
         */
        this.db = LibreGHelp.db;


        /**
         * @type {Object}
         */
        this.config = LibreGHelp.config;

    }

    /**
     * LGHbot message event handler
     * @param {function(LGHMessage, LGHChat, LGHUser): void} handler - handler function
     */
    onMessage(handler) {
        this.GHbot.on("message", handler);
    }

    /**
     * LGHbot edited_message event handler
     * @param {function(LGHMessage, LGHChat, LGHUser): void} handler - handler function
     */
    onEditedMessage(handler) {
        this.GHbot.on("edited_message", handler);
    }

    /**
     * LGHbot edited_message event handler
     * @param {function(LGHMessage, LGHChat, LGHUser): void} handler - handler function
     */
    onEditedMessageText(handler) {
        this.GHbot.on("edited_message_text", handler);
    }

    /**
     * LGHbot callback_query event handler
     * @param {function(LGHCallback, LGHChat, LGHUser): void} handler - handler function
     */
    onCallback(handler) {
        this.GHbot.on("callback_query", handler);
    }

    //undocumented for retrocompatibility
    on(eventName, handler) {
        this.GHbot.on(eventName, handler);
    }

    /**
     * LGHbot safely send message under user request limit
     * @param {number|string} userId - id of user that's the cause of your request
     * @param {number|string} chatId - chat where message should be sent
     * @param {String} text - text of message
     * @param {TelegramBot.SendMessageOptions} options - additional telegram options
     * @returns {Boolean|Promise<TelegramBot.Message>} - returns true on success, false if request has been dropped out
     */
    sendMessage(userId, chatId, text, options)
    {return new Promise( async (resolve, reject) => {
        try {
            var result = await pushUserRequest(this.TGbot, "sendMessage", userId, chatId, text, options);
            resolve(result);
        } catch (error) {
            reject(error);
        }
        return;
    } )}

    /**
     * LGHbot safely send message under user request limit
     * @param 
     * @param {number|string} chatId - chat where message should be sent
     * @param {TelegramBot.InputMediaPhoto} photo - photo
     * @param {TelegramBot.SendPhotoOptions} options - additional telegram options
     * @param {TelegramBot.FileOptions} fileOptions - file metadata
     * @returns {Boolean|Promise<TelegramBot.Message>} - returns true on success, false if request has been dropped out
     */
    sendPhoto(userId, chatId, photo, options, fileOptions)
    {return new Promise( async (resolve, reject) => {
        try {
            var result = await pushUserRequest(this.TGbot, "sendPhoto", userId, chatId, photo, options, fileOptions);
            resolve(result);
        } catch (error) {
            reject(error);
        }
        return;
    } )}

    /**
     * @param {number|string} userId - id of user that's the cause of your request
     * @param {TelegramBot.InputMedia} media - input media
     * @param {TelegramBot.EditMessageMediaOptions} options 
     * @returns {Boolean|Promise<TelegramBot.Message>} - returns true on success, false if request has been dropped out
     */
    editMessageMedia(userId, media, options)
    {return new Promise( async (resolve, reject) => {
        try {
            var result = await pushUserRequest(this.TGbot, "editMessageMedia", userId, media, options);
            resolve(result);
        } catch (error) {
            reject(error);
        }
        return;
    } )}

    /**
     * LGHbot safely edit message under user request limit
     * @param {number|string} userId - id of user that's the cause of your request
     * @param {String} text - text of message
     * @param {TelegramBot.EditMessageTextOptions} options - additional telegram options
     * @returns {Promise<Boolean>} - returns true on success, false if request has been dropped out
     */
    editMessageText(userId, text, options)
    {return new Promise( async (resolve, reject) => {
        try {
            var result = await pushUserRequest(this.TGbot, "editMessageText", userId, text, options);
            resolve(result);
        } catch (error) {
            reject(error);
        }
        return;
    } )}

    /**
     * LGHbot safely answerCallbackQuert under user request limit
     * @param {number|string} userId - id of user that's the cause of your request
     * @param {number|string} callbackId - id of user that's the cause of your request
     * @param {TelegramBot.AnswerCallbackQueryOptions} options - additional telegram options
     * @returns {Promise<Boolean>} - returns true on success, false if request has been dropped out
     */
    answerCallbackQuery(userId, callbackId, options)
    {return new Promise( async (resolve, reject) => {
        try {
            var result = await pushUserRequest(this.TGbot, "answerCallbackQuery", userId, callbackId, options);
            resolve(result);
        } catch (error) {
            reject(error);
        }
        return;
    } )}

    /**
     * LGHbot safely answerCallbackQuert under user request limit
     * @param {number|string} userId - id of user that's the cause of your request
     * @param {number|string} chatId - - chat where message should be sent
     * @param {number|string} targetId - id of user that should be banned
     * @param {TelegramBot.BanOptions} options - additional telegram options
     * @returns {Promise<Boolean>} - returns true on success, false if request has been dropped out
     */
    banChatMember(userId, chatId, targetId, options)
    {return new Promise( async (resolve, reject) => {
        try {
            var result = await pushUserRequest(this.TGbot, "banChatMember", userId, chatId, targetId, options);
            resolve(result);
        } catch (error) {
            reject(error);
        }
        return;
    } )}

    /**
     * LGHbot safely answerCallbackQuert under user request limit
     * @param {number|string} userId - id of user that's the cause of your request
     * @param {number|string} chatId - - chat where message should be sent
     * @param {number|string} targetId - id of user that should be unbanned
     * @param {TelegramBot.UnbanOptions} options - additional telegram options
     * @returns {Promise<Boolean>} - returns true on success, false if request has been dropped out
     */
    unbanChatMember(userId, chatId, targetId, options)
    {return new Promise( async (resolve, reject) => {
        try {
            var result = await pushUserRequest(this.TGbot, "unbanChatMember", userId, chatId, targetId, options);
            resolve(result);
        } catch (error) {
            reject(error);
        }
        return;
    } )}

    /**
     * LGHbot safely answerCallbackQuert under user request limit
     * @param {number|string} userId - id of user that's the cause of your request
     * @param {number|string} chatId - - chat where message should be sent
     * @param {number|string} targetId - id of user to restrict
     * @param {TelegramBot.RestrictChatMemberOptions} options - additional telegram options
     * @returns {Promise<Boolean>} - returns true on success, false if request has been dropped out
     */
    restrictChatMember(userId, chatId, targetId, options)
    {return new Promise( async (resolve, reject) => {
        try {
            var result = await pushUserRequest(this.TGbot, "restrictChatMember", userId, chatId, targetId, options);
            resolve(result);
        } catch (error) {
            reject(error);
        }
        return;
    } )}
}

module.exports = LGHInterface;
