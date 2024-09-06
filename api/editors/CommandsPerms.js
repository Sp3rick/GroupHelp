const TelegramBot = require("node-telegram-bot-api");
const { tradCommand } = require("../utils/utils.js");
const GH = require("../../GHbot.js");
const { checkCommandPerms, delPermsCommand, addPermsCommand } = require("../utils/rolesManager.js");

/** 
 * @param  {GH.LGHChat} chat
 */
function genCommandButtonsLine(chat, commandKey, prefix, settingsChatId)
{

    var baseCommandPerms = checkCommandPerms(chat.basePerms.commands, commandKey)
    var all = baseCommandPerms.group ? "👥 ☑️" : "👥";
    var pAll = baseCommandPerms.private ? "🤖 ☑️" : "🤖";

    var adminCommandPerms = checkCommandPerms(chat.adminPerms.commands, commandKey);
    var adm = adminCommandPerms.group ? "👮🏻 ☑️" : "👮🏻";
    var pAdm = adminCommandPerms.private ? "🥷 ☑️" : "🥷";

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
 * @param  {TelegramBot.CallbackQuery} cb
 * @param  {TelegramBot.Chat} chat
 * @param  {GH.LGHUser} user
 * @param  {String} cb_prefix
 * @param  {TelegramBot.KeyboardButton} returnButtons
 * 
 * @return {customMessage|false} - returns new customMessage, false if unchanged
 */
function callbackEvent(GHbot, db, cb, chat, user, cb_prefix, returnButtons)
{

    var l = global.LGHLangs;
    var TGbot = GHbot.TGbot;
    var updateChat=false;
    var prefix = cb_prefix+"#CMDPERMS";

    returnButtons=returnButtons||[];

    var msg = cb.message;
    var lang = user.lang;
    var chatId = chat.id;


    console.log(cb.data)
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

        var commandsB = chat.basePerms.commands;
        var commandsA = chat.adminPerms.commands;
        if(who == "ALL")
        {
            var {group} = checkCommandPerms(commandsB, commandKey)
            if(group)commandsB = delPermsCommand(commandsB, "@"+commandKey)
            else commandsB = addPermsCommand(commandsB, "@"+commandKey)
        }
        if(who == "PALL")
        {
            var {private} = checkCommandPerms(commandsB, commandKey)
            if(private)commandsB = delPermsCommand(commandsB, "*"+commandKey)
            else commandsB = addPermsCommand(commandsB, "*"+commandKey)
        }
        if(who == "ADM")
        {
            var {group} = checkCommandPerms(commandsA, commandKey)
            if(group)commandsA = delPermsCommand(commandsA, "@"+commandKey)
            else commandsA = addPermsCommand(commandsA, "@"+commandKey);
        }
        if(who == "PADM")
        {
            var {private} = checkCommandPerms(commandsA, commandKey)
            if(private)commandsA = delPermsCommand(commandsA, "*"+commandKey)
            else commandsA = addPermsCommand(commandsA, "*"+commandKey)
        }
        updateChat = true;
    }

    //this menu has already commands intended for every user, admin commands should be in separate panel still in CommandsPerms
    if(cb.data.startsWith(prefix+"_MENU"))
    {
        var opts = {parse_mode:"HTML", chat_id:cb.chat.id, message_id:msg.message_id};

        text = l[lang].COMMAND_PERMS_DESCRIPTION;
        
        var staffL = genCommandButtonsLine(chat, "COMMAND_STAFF", prefix, chatId);
        var rulesL = genCommandButtonsLine(chat, "COMMAND_RULES", prefix, chatId);
        var meL = genCommandButtonsLine(chat, "COMMAND_ME", prefix, chatId);
        var infoL = genCommandButtonsLine(chat, "COMMAND_INFO", prefix, chatId);
        var permsL = genCommandButtonsLine(chat, "COMMAND_PERMS", prefix, chatId);
        var linkL = genCommandButtonsLine(chat, "COMMAND_LINK", prefix, chatId);
        buttons = [staffL, rulesL, meL, infoL, permsL, linkL];
        //TODO: this below is going to include all commands, it's going to be added with custom roles, the return button will be avaiable also there
        //buttons.push([{text:l[lang].COMMAND_PERMS_ADMINS, callback_data:prefix+"_ROLES:"+chatId}])
        returnButtons.forEach((line) => {buttons.push(line)});
        opts.reply_markup = {inline_keyboard:buttons};

        GHbot.editMessageText(user.id, text, opts);
    }


    if(updateChat) return chat;
    return false;

}

/** 
 * @param  {GH} GHbot
 * @param {GH.LGHDatabase} db - database
 * @param  {TelegramBot.Message} msg
 * @param  {GH.LGHChat} chat
 * @param  {GH.LGHUser} user
 * @param  {String} cb_prefix
 * 
 * @return {customMessage|false}
 */
function messageEvent(GHbot, db, msg, chat, user, cb_prefix)
{

    var l = global.LGHLangs;
    var updateChat=false;
    
    if(updateChat) return chat;
    return false;

}

module.exports = {
    callbackEvent : callbackEvent,
    messageEvent : messageEvent,
}
