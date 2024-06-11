const TelegramBot = require("node-telegram-bot-api");
const { tradCommand } = require("./utils.js");
const GH = require("../GHbot.js");

/** 
 * @param  {GH.LGHChat} chat
 */
function genCommandButtonsLine(chat, commandKey, prefix, settingsChatId)
{
    var all = !chat.basePerms.commands.includes(commandKey) ? "👥" : "👥 ☑️";
    var pAll = !chat.basePerms.commands.includes("@"+commandKey) ? "🤖" : "🤖 ☑️";
    var adm = !chat.adminPerms.commands.includes(commandKey) ? "👮🏻" : "👮🏻 ☑️";
    var pAdm = !chat.adminPerms.commands.includes("@"+commandKey) ? "🥷" : "🥷 ☑️";
    var line = [
        {text: "/"+tradCommand(chat.lang, commandKey), callback_data: prefix+"_MENU_INFO|"+commandKey+":"+settingsChatId},
        {text: all, callback_data: prefix+"_MENU_ALL|"+commandKey+":"+settingsChatId},
        {text: pAll, callback_data: prefix+"_MENU_PALL|"+commandKey+":"+settingsChatId},
        {text: adm, callback_data: prefix+"_MENU_ADM|"+commandKey+":"+settingsChatId},
        {text: pAdm, callback_data: prefix+"_MENU_PADM|"+commandKey+":"+settingsChatId},
    ];
    return line;
}

/** 
 * @param  {GH} GHbot
 * @param {GH.LGHDatabase} db - database
 * @param  {GH.LGHChat} settingsChat
 * @param  {TelegramBot.CallbackQuery} cb
 * @param  {TelegramBot.Chat} chat
 * @param  {GH.LGHUser} user
 * @param  {String} cb_prefix
 * @param  {TelegramBot.KeyboardButton} returnButtons
 * 
 * @return {customMessage|false} - returns new customMessage, false if unchanged
 */
function callbackEvent(GHbot, db, settingsChat, cb, chat, user, cb_prefix, returnButtons)
{

    var l = global.LGHLangs;
    var TGbot = GHbot.TGbot;
    var updateChat=false;
    var prefix = cb_prefix+"#CMDPERMS";

    returnButtons=returnButtons||[];

    var msg = cb.message;
    var lang = user.lang;
    var settingsChatId = settingsChat.id;


    if(cb.data.startsWith(prefix+"_MENU_"))
    {
        var commandKey = cb.data.split("|")[1].split(":")[0];
        var who = cb.data.split(prefix+"_MENU_")[1].split("|")[0];

        if(who == "INFO")
        {
            var descKey = commandKey.replace("COMMAND","CMDDESC");
            var text = l[lang][descKey].replace("{name}",tradCommand(lang, commandKey));
            GHbot.answerCallbackQuery(user.id, cb.id, {text:text,show_alert:true});
            return;
        }

        var commandsB = settingsChat.basePerms.commands;
        var commandsA = settingsChat.adminPerms.commands;
        if(who == "ALL")
        {
            var commandIndex = commandsB.indexOf(commandKey);
            if(commandIndex != -1)
                settingsChat.basePerms.commands.splice(commandIndex,1);
            else
                settingsChat.basePerms.commands.push(commandKey);
        }
        if(who == "PALL")
        {
            var commandIndex = commandsB.indexOf("@"+commandKey);
            if(commandIndex != -1)
                settingsChat.basePerms.commands.splice(commandIndex,1);
            else
                settingsChat.basePerms.commands.push("@"+commandKey);
        }
        if(who == "ADM")
        {
            var commandIndex = commandsA.indexOf(commandKey);
            if(commandIndex != -1)
                settingsChat.adminPerms.commands.splice(commandIndex,1);
            else
                settingsChat.adminPerms.commands.push(commandKey);
        }
        if(who == "PADM")
        {
            var commandIndex = commandsA.indexOf("@"+commandKey);
            if(commandIndex != -1)
                settingsChat.adminPerms.commands.splice(commandIndex,1);
            else
                settingsChat.adminPerms.commands.push("@"+commandKey);
        }
        updateChat = true;
    }

    //this menu has already commands intended for every user, admin commands should be in separate panel still in CommandsPerms
    if(cb.data.startsWith(prefix+"_MENU"))
    {
        var opts = {parse_mode:"HTML", chat_id:chat.id, message_id:msg.message_id};

        text = l[lang].COMMAND_PERMS_DESCRIPTION;
        
        var staffL = genCommandButtonsLine(settingsChat, "COMMAND_STAFF", prefix, settingsChatId);
        var rulesL = genCommandButtonsLine(settingsChat, "COMMAND_RULES", prefix, settingsChatId);
        var meL = genCommandButtonsLine(settingsChat, "COMMAND_ME", prefix, settingsChatId);
        var infoL = genCommandButtonsLine(settingsChat, "COMMAND_INFO", prefix, settingsChatId);
        var permsL = genCommandButtonsLine(settingsChat, "COMMAND_PERMS", prefix, settingsChatId);
        buttons = [staffL, rulesL, meL, infoL, permsL];
        //TODO: this below is going to include all commands, it's going to be added with custom roles, the return button will be avaiable also there
        //buttons.push([{text:l[lang].COMMAND_PERMS_ADMINS, callback_data:prefix+"_ROLES:"+settingsChatId}])
        returnButtons.forEach((line) => {buttons.push(line)});
        opts.reply_markup = {inline_keyboard:buttons};

        GHbot.editMessageText(user.id, text, opts);
    }


    if(updateChat) return settingsChat;
    return false;

}

/** 
 * @param  {GH} GHbot
 * @param {GH.LGHDatabase} db - database
 * @param  {GH.LGHChat} settingsChat
 * @param  {TelegramBot.Message} msg
 * @param  {GH.LGHChat} chat
 * @param  {GH.LGHUser} user
 * @param  {String} cb_prefix
 * 
 * @return {customMessage|false}
 */
function messageEvent(GHbot, db, settingsChatId, msg, chat, user, cb_prefix)
{

    var l = global.LGHLangs;
    var updateChat=false;
    var settingsChatId = settingsChatId.id;

    
    if(updateChat) return chat;
    return false;

}

module.exports = {
    callbackEvent : callbackEvent,
    messageEvent : messageEvent,
}
