const GH = require("../../GHbot.js");
l = global.LGHLangs;
/**
 * @typedef {Object} resolveCommandKeyReturn
 * @property {string} key - Command permission key
 * @property {string} lang - Identified command lang
 */
/**
 * @param {string} name 
 * @returns {resolveCommandKeyReturn|false}
 */
function resolveCommandKey(name)
{
    var langKeys = Object.keys(l);
    for(var i = 0; i < langKeys.length; i++)
    {
        var lang = l[langKeys[i]];
        if(lang.hasOwnProperty("/"+name))
            return {key: lang["/"+name], lang};
    }
    return false;
}

///////////


// COMMAND_NAME : function()
var runTable = {}; //there are stored registered commands

//list of commands that should alert when permission is missing
var missingPermsAlertList = {};

/**
 * Registers a list of commands with various specified key permission to a function.
 *
 * @param {Array<string>} keys - A list of keys that an user permissions should meet to run the command
 * @param {(msg: GH.LGHMessage, chat: GH.LGHChat, user: GH.LGHUser, private: boolean, lang: string, key: string, keyLang: string ) => void} func - The function to be executed if any key is identified
 * func.msg, func.chat and func.user contains the GHbot.onMessage event parameters
 * func.private is true if user permissions allows private only command reply
 * func.lang contains the lang of the chat where message should be sent
 * func.key contain the trigghered key
 * func.keyLang contain in what language the key has been found in
 * @example
 * registerCommand(['COMMAND_RULES'], function(msg, chat, user, key, lang, private) {
 *      console.log(key) //COMMAND_RULES
 * });
 */
function registerCommands(keys, func)
{
    keys.forEach((key)=>{
        runTable[key] = func;
    });
};

/**
 * Run eventual registered commands that user has permission to run
 * @param {GH.LGHMessage} msg 
 * @param {GH.LGHChat} chat 
 * @param {GH.LGHUser} user 
 */
function messageEvent(msg, chat, user)
{
    if(msg.waitingReply) return;

    var command = msg.command;
    if(!command) return;
    if(!chat.isGroup) return; //currently this is intended for groups only

    var forcesPrivate = command.name.startsWith("*");
    if(forcesPrivate) command.name = command.name.replace("*","");

    var commandInfo = resolveCommandKey(command.name);
    if(!commandInfo) return; //unknown command in any language
    var key = commandInfo.key;
    var keyLang = commandInfo.lang;

    var hasPermission = false;
    var hasPrivatePermission = false;
    if(user.perms.commands.includes(key))
        {hasPermission = true; hasPrivatePermission = true;}
    if(user.perms.commands.includes("@"+key))
        hasPermission = true;
    if(user.perms.commands.includes("*"+key))
        hasPrivatePermission = true;

    if( runTable[key] && !forcesPrivate && hasPermission)
        runTable[key](msg, chat, user, false, chat.lang, key, keyLang);
    if( runTable[key] && (!hasPermission || forcesPrivate) && hasPrivatePermission )
        runTable[key](msg, chat, user, true, user.lang, key, keyLang);

    if( forcesPrivate && hasPermission && !hasPrivatePermission )
    {
        //let know the user that he can use the command only on group chat
        console.log("LGHCommand.js: let know the user that he can use the command only on group chat");
    }

    if( !hasPermission && !hasPermission )
    {
        //let know the user that he have not enough permissions to run the command
    }
}

module.exports = {
    registerCommands,
    messageEvent
}