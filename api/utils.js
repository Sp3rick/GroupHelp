const chrono = require('chrono-node');
const TelegramBot = require('node-telegram-bot-api');
const GH = require("../GHbot.js");
l = global.LGHLangs;

function cleanHTML(text)
{
    text = String(text).replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    return text;
}
function bold(text)
{
    return "<b>"+cleanHTML(text)+"</b>";
}
function code(text)
{
    return "<code>"+cleanHTML(text)+"</code>";
}
function tag(text, userId)
{
    return "<a href=\"tg://user?id="+userId+"\">"+cleanHTML(text)+"</a>";
}
function link(text, link)
{
    return "<a href=\""+link+"\">"+cleanHTML(text)+"</a>";
}

let isObject = function(a) {
    return (!!a) && (a.constructor === Object);
};
let isArray = function(a) {
    return (!!a) && (a.constructor === Array);
};
function isString(v) {
    return typeof v === "string";
}
const replaceLast = (str, pattern, replacement) => {
    const match =
      typeof pattern === 'string'
        ? pattern
        : (str.match(new RegExp(pattern.source, 'g')) || []).slice(-1)[0];
    if (!match) return str;
    const last = str.lastIndexOf(match);
    return last !== -1
      ? `${str.slice(0, last)}${replacement}${str.slice(last + match.length)}`
      : str;
};
const isValidUrl = urlString=> {
    var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
  '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
return !!urlPattern.test(urlString);
}

function isNumber(str) {
    if (typeof str != "string") return false
    return !isNaN(str) && !isNaN(parseFloat(str)) 
}

function is8BitNumber(num)
{
    if(isNumber(num) && num >= 0 && num <= 255)
        return true;
    return false;
}

/**
 * @param {Number} min 
 * @param {Number} max 
 * @returns {Number}
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @param {Array} array 
 * @returns {Object}
 */
function keysArrayToObj(array)
{
    var obj = {};
    array.forEach(key=>{obj[key]=true});
    return obj;
}

/**
 * @param {Array} arr 
 * @param {Number} chunkSize 
 * @returns {Array<Array>}
 */
function chunkArray(arr, chunkSize) {
    var result = [];

    for (var i = 0; i < arr.length; i += chunkSize) {
        var chunk = arr.slice(i, i + chunkSize);
        result.push(chunk);
    }

    return result;
}

/**
 * @returns {Number}
 */
function getUnixTime() {
    const currentTimeMillis = new Date().getTime();
    const currentTimeSeconds = Math.floor(currentTimeMillis / 1000);
    return currentTimeSeconds;
}

/**
 * @param {string} host 
 * @returns {Boolean}
 */
function isValidHost(host) {
    host = host.toLowerCase();
    var hostRegex = /^(((?!-))(xn--|_)?[a-z0-9-]{0,61}[a-z0-9]{1,1}\.)*(xn--)?([a-z0-9][a-z0-9\-]{0,60}|[a-z0-9-]{1,30}\.[a-z]{2,})$/;
    return hostRegex.test(host);
}

/**
 * @param {string} host 
 * @returns {Boolean}
 */
function isIpAddress(host)
{
    var doms = host.split(".");
    if(doms.length == 4 && is8BitNumber(doms[0]) && is8BitNumber(doms[1]) && is8BitNumber(doms[2]) && is8BitNumber(doms[3]))
        return true
    return false;
}

/**
 * @param {TelegramBot.ChatId} id 
 * @returns {Boolean}
 */
function isValidId(id)
{
    return isNumber(id) && (id > 99999 || id < -9999) && id != Infinity;
}

//TODO: add translation system that replaces any word to english (like dictionary translation)
/**
 * @param {string} text 
 * @returns {Number} - error if returns 0 or 1, 2 and more seconds only allowed
 */
function parseHumanTime(text) {
    text = text+" from now";
    const parsedDate = chrono.parseDate(text);
    if (!parsedDate) return 0;
    const now = new Date();
    var millisecondsDifference = parsedDate.getTime() - now.getTime();
    var totalSeconds = Math.floor(millisecondsDifference / 1000);
    return ++totalSeconds;
}
/**
 * @param {Number} seconds 
 * @returns 
 */
function secondsToTime(seconds) {
    const days = Math.floor(seconds / 86400);
    const remainingHours = seconds % 86400;
    const hours = Math.floor(remainingHours / 3600);
    const remainingMinutes = remainingHours % 3600;
    const minutes = Math.floor(remainingMinutes / 60);
    const remainingSeconds = remainingMinutes % 60;

    return {
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: remainingSeconds
    };
}
/**
 * @param {string} lang 
 * @param {Number} seconds 
 * @returns {string}
 */
function secondsToHumanTime(lang, seconds)
{
    var l = global.LGHLangs;

    if(seconds == 0)
        return "✖️";

    var time = secondsToTime(seconds);

    var text = "";

    if(time.days == 1)
        text+="1 "+l[lang].DAY;
    if(time.days > 1)
        text+=time.days+" "+l[lang].DAYS;
    
    if(time.hours != 0 && (time.days != 0)) text+=", ";
    if(time.hours == 1)
        text+="1 "+l[lang].HOUR;
    if(time.hours > 1)
        text+=time.hours+" "+l[lang].HOURS;

    if(time.minutes != 0 && (time.days != 0 || time.hours != 0)) text+=", ";
    if(time.minutes == 1)
        text+="1 "+l[lang].MINUTE;
    if(time.minutes > 1)
        text+=time.minutes+" "+l[lang].MINUTES;

    if(time.seconds != 0 && (time.days != 0 || time.hours != 0 || time.minutes != 0)) text+=", ";
    if(time.seconds == 1)
        text+="1 "+l[lang].SECOND;
    if(time.seconds > 1)
        text+=time.seconds+" "+l[lang].SECONDS;

    return text;

}


/** 
 * @typedef {Object} Command
 * @property {String} text - Full raw command text
 * @property {String} prefix - Prefix, example: / ! . , ;
 * @property {String} botCommand - Command and bot specifier (ex. "start@usernamebot")
 * @property {String} name - Command name (ex. "start")
 * @property {String|false} bot - Specified bot name (ex. "usernamebot")
 * @property {String|false} args - Raw arguments text after the command
 * @property {Array|false} splitArgs - Array of arguments split by space
 */


/** 
 * @param  {string} text - Raw message text.
 * @return {Command|false} - Parsed command object, false if is not a command
 */
function parseCommand(text){

    //TODO: add optional argument for a string with all symbols considered prefix for command

    var prefix = text[0];
    if( prefix == "/" || prefix == "!" || prefix == "." || prefix == "," || prefix == ";" ){

        var temp = text.replace( prefix, "" );

        var botCommand = temp.split(" ")[0];    // "start@usernamebot"
        var name = botCommand.split("@")[0]; // "start"
        var bot = botCommand.split("@")[1];     // "usernamebot"
        if(bot == undefined) bot = false;

        var args;
        var splitArgs;
        if( temp.split(" ").length > 1)
        {
            args = temp.replace(botCommand+" ","");
            splitArgs = args.split(" ");
        }
        else
        {
            args = false;
            splitArgs = false;
        }


        var cmd = {
            text : text,
            prefix : prefix,
            botCommand : botCommand,
            name : name,
            bot: bot,
            args : args,
            splitArgs : splitArgs,
        }

        return cmd;


    }
    else{

        return false //is not a command

    }

}

/**
 * @param {string} lang 
 * @param {TelegramBot.ChatId} chatId 
 * @returns {Array<Array<TelegramBot.KeyboardButton>>}
 */
function genSettingsKeyboard(lang, chatId)
{
    var l = global.LGHLangs;

    var keyboard =
    [
        [{text: l[lang].S_RULES_BUTTON, callback_data: "S_RULES_BUTTON:"+chatId},
        {text: l[lang].S_ANTISPAM_BUTTON, callback_data: "S_ANTISPAM_BUTTON:"+chatId}],

        [{text: l[lang].S_WELCOME_BUTTON, callback_data: "S_WELCOME_BUTTON:"+chatId},
        {text: l[lang].S_ANTIFLOOD_BUTTON, callback_data: "S_FLOOD_M_:"+chatId}],

        [{text: l[lang].S_GOODBYE_BUTTON, callback_data: "S_GOODBYE_BUTTON:"+chatId},
        {text: l[lang].S_ALPHABETS_BUTTON, callback_data: "S_ALPHABETS#ABP:"+chatId}],

        [{text: l[lang].S_CAPTCHA_BUTTON, callback_data: "S_CAPTCHA_BUTTON:"+chatId},
        {text: l[lang].S_CHECKS_BUTTON, callback_data: "S_CHECKS_BUTTON:"+chatId}],

        [{text: l[lang].S_ADMIN_BUTTON, callback_data: "S_ADMIN_BUTTON:"+chatId},
        {text: l[lang].S_BLOCKS_BUTTON, callback_data: "S_BLOCKS_BUTTON:"+chatId}],

        [{text: l[lang].S_MEDIA_BUTTON, callback_data: "S_MEDIA_PAGE1:"+chatId},
        {text: l[lang].S_PORN_BUTTON, callback_data: "S_PORN_BUTTON:"+chatId}],

        [{text: l[lang].S_WARN_BUTTON, callback_data: "S_WARN_BUTTON:"+chatId},
        {text: l[lang].S_NIGHT_BUTTON, callback_data: "S_NIGHT_BUTTON:"+chatId}],

        [{text: l[lang].S_TAG_BUTTON, callback_data: "S_TAG_BUTTON:"+chatId},
        {text: l[lang].S_LINK_BUTTON, callback_data: "S_LINK_BUTTON:"+chatId}],

        [{text: l[lang].S_APPROVEMODE_BUTTON, callback_data: "S_APPROVEMODE_BUTTON:"+chatId}],

        [{text: l[lang].S_MESSAGESDELETION_BUTTON, callback_data: "S_MESSAGESDELETION_BUTTON:"+chatId}],

        [{text: l[lang].FLAG + "Lang", callback_data: "LANGS_BUTTON:"+chatId},
        {text: l[lang].S_CLOSE_BUTTON, callback_data: "S_CLOSE_BUTTON:"+chatId},
        {text: l[lang].OTHER_BUTTON, callback_data: "SETTINGS_PAGE2:"+chatId}],
    ] 

    return keyboard;

}

/**
 * @param {string} lang 
 * @param {TelegramBot.ChatId} chatId 
 * @returns {string}
 */
function genSettingsText(lang, chat)
{
    return bold(l[lang].SETTINGS.toUpperCase())+"\n"+
    bold(l[lang].GROUP+": ")+code(chat.title)+"\n"+
    bold(l[lang].GROUP_LANGUAGE+": ")+"<i>"+l[chat.lang].LANG_SELECTOR+"</i>\n\n"+
    l[lang].SETTINGS_SELECT;
}

/**
 * @param {string} lang 
 * @param {TelegramBot.ChatId} chatId 
 * @returns {Array<Array<TelegramBot.KeyboardButton>>}
 */
function genSettings2Keyboard(lang, chatId)
{
    var l = global.LGHLangs;

    var keyboard =
    [
        [{text: l[lang].S_TOPIC_BUTTON, callback_data: "S_TOPIC_BUTTON:"+chatId}],
        [{text: l[lang].S_WORDSBAN_BUTTON, callback_data: "S_WORDSBAN_BUTTON:"+chatId}],
        [{text: l[lang].S_RECURRING_BUTTON, callback_data: "S_RECURRING_BUTTON:"+chatId}],
        [{text: l[lang].S_MEMBERS_BUTTON, callback_data: "S_MEMBERS_BUTTON:"+chatId}],
        [{text: l[lang].S_MASKED_BUTTON, callback_data: "S_MASKED_BUTTON:"+chatId}],
        [{text: l[lang].S_CHANNEL_BUTTON, callback_data: "S_CHANNEL_BUTTON:"+chatId}],
        [{text: l[lang].S_CUSTOMCMD_BUTTON, callback_data: "S_CUSTOMCMD_BUTTON:"+chatId}],
        [{text: l[lang].S_MAGICCMD_BUTTON, callback_data: "S_MAGICCMD_BUTTON:"+chatId}],
        [{text: l[lang].S_LENGTH_BUTTON, callback_data: "S_LENGTH_BUTTON:"+chatId}],

        [{text: l[lang].S_PERMS_BUTTON, callback_data: "S_PERMS_BUTTON:"+chatId},
        {text: l[lang].S_LOGC_BUTTON, callback_data: "S_LOGC_BUTTON:"+chatId}],

        [{text: l[lang].BACK2_BUTTON, callback_data: "SETTINGS_HERE:"+chatId},
        {text: l[lang].S_CLOSE_BUTTON, callback_data: "S_CLOSE_BUTTON:"+chatId},
        {text: l[lang].FLAG + "Lang", callback_data: "LANGS_BUTTON:"+chatId}],
    ] 

    return keyboard;

}

/**
 * @param {string} cb_prefix 
 * @param {TelegramBot.ChatId} settingsChatId 
 * @returns {Array<Array<TelegramBot.KeyboardButton>>}
 */
function genSetNumKeyboard(cb_prefix, settingsChatId)
{

    var line1 =
    [
        {text: "2", callback_data: cb_prefix+"#SNUM_MENU_N_2:"+settingsChatId},
        {text: "3", callback_data: cb_prefix+"#SNUM_MENU_N_3:"+settingsChatId},
        {text: "4", callback_data: cb_prefix+"#SNUM_MENU_N_4:"+settingsChatId},
        {text: "5", callback_data: cb_prefix+"#SNUM_MENU_N_5:"+settingsChatId},
    ]
    var line2 =
    [
        {text: "6", callback_data: cb_prefix+"#SNUM_MENU_N_6:"+settingsChatId},
        {text: "7", callback_data: cb_prefix+"#SNUM_MENU_N_7:"+settingsChatId},
        {text: "8", callback_data: cb_prefix+"#SNUM_MENU_N_8:"+settingsChatId},
        {text: "9", callback_data: cb_prefix+"#SNUM_MENU_N_9:"+settingsChatId},
    ]
    var line3 =
    [
        {text: "10", callback_data: cb_prefix+"#SNUM_MENU_N_10:"+settingsChatId},
        {text: "12", callback_data: cb_prefix+"#SNUM_MENU_N_12:"+settingsChatId},
        {text: "15", callback_data: cb_prefix+"#SNUM_MENU_N_15:"+settingsChatId},
        {text: "20", callback_data: cb_prefix+"#SNUM_MENU_N_20:"+settingsChatId},
    ]
    var line4 =
    [
        {text: "➖1️⃣", callback_data: cb_prefix+"#SNUM_MENU_DEC:"+settingsChatId},
        {text: "📝", callback_data: cb_prefix+"#SNUM_MENU_WRITE:"+settingsChatId},
        {text: "➕1️⃣", callback_data: cb_prefix+"#SNUM_MENU_INC:"+settingsChatId},
    ]

    return [line1, line2, line3, line4];

}

/**
 * @param {string} lang 
 * @param {GH.LGHAdmin} admin 
 * @param {TelegramBot.Chat} chat 
 * @returns {Array<Array<TelegramBot.KeyboardButton>>}
 */
function genGroupAdminPermsKeyboard(lang, admin, chat)
{
    var prefix = "ADMINPERM_";
    var userId = admin.user.id;
    var topicsAvaiable = chat.is_forum;
    var chatId = chat.id;

    var deletion = admin.can_delete_messages ? "✅" : "❌";
    var videochat = admin.can_manage_video_chats ? "✅" : "❌";
    var restrict = admin.can_restrict_members ? "✅" : "❌";
    var promote = admin.can_promote_members ? "✅" : "❌";
    var modify = admin.can_change_info ? "✅" : "❌";
    var invite = admin.can_invite_users ? "✅" : "❌";
    var stories = admin.can_post_stories ? "✅" : "❌";
    var storyedit = admin.can_edit_stories ? "✅" : "❌";
    var storydel = admin.can_delete_stories ? "✅" : "❌";
    var pin = admin.can_pin_messages ? "✅" : "❌";
    var topics = admin.can_manage_topics ? "✅" : "❌";

    var line1 =
    [
        {text: deletion+" "+l[lang].DELETE_MESSAGES, callback_data: prefix+"DELETE:"+chatId+"?"+userId},
    ]
    
    var line2 =
    [
        {text: videochat+" "+l[lang].MANAGE_VIDEOCHAT, callback_data: prefix+"VIDEOCHAT:"+chatId+"?"+userId},
        {text: restrict+" "+l[lang].RESTRICT_MEMBERS, callback_data: prefix+"RESTRICT:"+chatId+"?"+userId},
    ]
    var line3 =
    [
        {text: promote+" "+l[lang].PROMOTE_MEMBERS, callback_data: prefix+"PROMOTE:"+chatId+"?"+userId},
        {text: modify+" "+l[lang].MODIFY_GROUP, callback_data: prefix+"MODIFY:"+chatId+"?"+userId},
    ]
    var line4 =
    [
        {text: invite+" "+l[lang].INVITE_MEMBERS, callback_data: prefix+"INVITE:"+chatId+"?"+userId},
        {text: stories+" "+l[lang].MANAGE_STORIES, callback_data: prefix+"STORIES:"+chatId+"?"+userId},
    ]

    var line5 =
    [
        {text: storyedit+" "+l[lang].EDIT_STORIES, callback_data: prefix+"STORYEDIT:"+chatId+"?"+userId},
        {text: storydel+" "+l[lang].DELETE_STORIES, callback_data: prefix+"STORYDEL:"+chatId+"?"+userId},
    ]

    var line6 =
    [
        {text: pin+" "+l[lang].CAN_PIN, callback_data: prefix+"PIN:"+chatId+"?"+userId},
    ]

    var line7 =
    [
        {text: l[lang].EDIT_ADMIN_TITLE_BUTTON, callback_data: "ADMINTITLE:"+chatId+"?"+userId},
    ]

    var line8 =
    [
        {text: l[lang].CLOSE_MENU_BUTTON, callback_data: "S_CLOSE_BUTTON"},
    ]

    if(topicsAvaiable)
        line6.push({text: topics+" "+l[lang].MANAGE_TOPICS, callback_data: prefix+"TOPICS:"+chatId+"?"+userId})

    return [line1, line2, line3, line4, line5, line6, line7, line8];
}

/**
 * @param {string} lang 
 * @param {GH.LGHChat} chat 
 * @param {TelegramBot.ChatId} userId 
 * @returns {string}
 */
function genGroupAdminPermsText(lang, chat, userId)
{
    var text = 
    (chat.users[userId].title ? ("\n"+bold(l[lang].ADMIN_TITLE)+": "+code(chat.users[userId].title)) : "")+"\n\n"+
    l[lang].PROMOTED_DESCRIPTION;

    return text;
}

/**
 * @param {Array<TelegramBot.ChatId>} userIds 
 * @param {GH.LGHChat} chat 
 * @param {GH.LGHDatabase} db 
 * @returns {string}
 */
function genUserList(userIds, chat, db)
{
    var text = "";

    userIds.forEach((userId, index)=>{
        if(index+1 != userIds.length)
            text+=" ├ ";
        else
            text+=" └ ";

        var userStatus = chat.users[userId];
        var userData = db.users.get(userId);
        if(userData)
            text += tag(usernameOrFullName(userData), userId);
        else
            text += tag(userId, userId)

        text += (userStatus.title && userStatus.title.length > 0) ? " » <i>"+userStatus.title+"</i>" : "";

        text+="\n";
    })


    return text;
}

/**
 * @param {GH.LGHChat} chat
 * @param {TelegramBot.ChatMember} member
 * @returns {string}
 */
function memberToChatStatus(lang, member)
{
    var l = global.LGHLangs;

    var text = "";

    if(member.status == "creator")
        text+=l[lang].FOUNDER;
    if(member.status == "administrator")
        text+=l[lang].ADMINISTRATOR
    if(member.status == "member")
        text+=l[lang].MEMBER
    if(member.status == "left")
        text+=l[lang].LEFT_OUT;
    if(member.status == "kicked")
        text+=l[lang].BANNED;

    if(member.status == "restricted")
    {
        if(!member.can_send_messages)
            text+=l[lang].MUTED
        else if( !(member.can_send_audios || member.can_send_documents || member.can_send_photos || member.can_send_videos ||
        member.can_send_video_notes || member.can_send_voice_notes || member.can_send_polls || member.can_send_other_messages || 
        member.can_add_web_page_previews) )
            text+=l[lang].RESTRICTED+" ("+l[lang].MEDIA+")";
        else
            text+=l[lang].RESTRICTED;
    }

    return text;
}

/**
 * @typedef {GH.LGHUser} LGHUser
 */
/**
 * @param {GH.LGHChat} chat
 * @param {GH.LGHUser} user
 * @param {TelegramBot.ChatMember} member
 */
function genMemberInfoText(lang, chat, user, member)
{
    var l = global.LGHLangs;

    var text = "";

    var status = memberToChatStatus(lang, member);
    var warns = getUserWarns(chat, user.id);
    var joinDate = chat.users[user.id] ? chat.users[user.id].firtJoin : false; //TODO: translate to date based on group UTC data

    text+=bold("🆔 ID: ")+code(user.id)+"\n";
    text+=bold("👱 "+l[lang].NAME+": ")+tag(user.first_name, user.id)+"\n";
    if(user.hasOwnProperty("last_name"))
        text+=bold("👪 "+l[lang].SURNAME+": ")+tag(user.last_name, user.id)+"\n";
    if(user.hasOwnProperty("username"))
        text+=bold("🌐 Username: ")+"@"+user.username+"\n";
    text+=bold("👀 "+l[lang].SITUATION+": ")+status+"\n";
    text+=bold("❕ "+l[lang].WARNS+": ")+warns+"/"+chat.warns.limit+"\n";
    text+=bold("⤵️ "+l[lang].JOIN_WHEN+": ")+(joinDate ? joinDate : l[lang].UNKNOWN)+"\n";

    return text;
}

/**
 * @param {GH.LGHPerms} perm 
 * @returns {"✅"|"➖"|"❌"}
 */
function stateToEmoji(perm)
{
    switch(perm)
    {
        case 1: return "✅";
        case 0: return "➖";
        case -1: return "❌";
    }
}

/**
 * @param {string} lang 
 * @param {string} commandKey 
 * @returns {string} - translated command
 */
function tradCommand(lang, commandKey)
{
    var translated = "";
    if(commandKey.startsWith("COMMAND_")) //if is language-depenent command translate it to the acutal command
        translated = l[lang][commandKey];
    if(commandKey.startsWith("@COMMAND_"))
        translated = l[lang][commandKey.replace("@","")];
    if(commandKey.startsWith("*COMMAND_"))
        translated = l[lang][commandKey.replace("*","")];

    return translated;
}

//TODO due to code here, we should force every custom command alias to be characters/numbers only, or it may inflict with html formatting or "COMMAND_" could search for unexhisting command
/**
 * @param {string} lang 
 * @param {GH.LGHPerms} perms 
 * @returns {string}
 */
function genPermsReport(lang, perms)
{

    var l = global.LGHLangs;

    var text=bold(l[lang].COMMANDS+": ");
    perms.commands.forEach(commandName => {
        var command = tradCommand(lang, commandName);

        text+="/"+command;
        if(commandName.startsWith("*"))
            text+="(🔏) ";
        else if(commandName.startsWith("@"))
            text+="(👥) ";
        else
            text+=" ";

        if(command == undefined || command.length == 0)
            console.log("LGH: Undefined command key " + commandName);
    });

    text+="\n\n"+
    bold(l[lang].IMMUNE+": ")+stateToEmoji(perms.immune)+"\n"+
    bold(l[lang].FLOOD+": ")+stateToEmoji(perms.flood)+"\n"+
    bold(l[lang].LINKS+": ")+stateToEmoji(perms.link)+"\n"+
    bold(l[lang].TGLINKS+": ")+stateToEmoji(perms.tgLink)+"\n"+
    bold(l[lang].FORWARD+": ")+stateToEmoji(perms.forward)+"\n"+
    bold(l[lang].QUOTE+": ")+stateToEmoji(perms.quote)+"\n"+
    bold(l[lang].PORN+": ")+stateToEmoji(perms.porn)+"\n"+
    bold(l[lang].NIGHT+": ")+stateToEmoji(perms.night)+"\n"+
    bold(l[lang].MEDIA+": ")+stateToEmoji(perms.media)+"\n"+
    bold(l[lang].ALPHABETS+": ")+stateToEmoji(perms.media)+"\n"+
    bold(l[lang].BAN_WORDS+": ")+stateToEmoji(perms.media)+"\n"+
    bold(l[lang].LONG_MESSAGES+": ")+stateToEmoji(perms.media)+"\n"+
    bold(l[lang].ROLES+": ")+stateToEmoji(perms.roles)+"\n"+
    bold(l[lang].SETTINGS+": ")+stateToEmoji(perms.settings)+"\n";

    return text;

}

/**
 * @param {GH.LGHAdminList} admins 
 * @param {TelegramBot.ChatId} userId 
 * @returns {Boolean}
 */
function isAdmin(admins, userId)
{
    for(var i=0; i < admins.length; i++)
    {
        var admin = admins[i];
        if(admin.user.id == userId) return true;
    }

    return false;
}

/**
 * @param {GH.LGHChat} chat 
 * @param {TelegramBot.ChatId} userId 
 * @returns {Boolean}
 */
function isAdminOfChat(chat, userId)
{if(chat.hasOwnProperty("admins")){
    return isAdmin(chat.admins, userId);
}else return false;}

/**
 * @param {GH.LGHAdminList} admins 
 * @param {TelegramBot.ChatId} userId 
 * @param {GH.LGHPerms} perm 
 * @returns {Boolean}
 */
function hasAdminPermission(admins, userId, perm)
{
    if(!isAdmin(admins, userId)) return false;

    var hasPermission = false;
    admins.forEach((admin)=>{
        if(admin.user.id == userId && admin.hasOwnProperty(perm) && admin[perm])
            hasPermission = true;
        if(admin.status == "creator")
            hasPermission = true;
    })

    return hasPermission;
}

/**
 * @param {Object} chat 
 * @returns {Boolean}
 */
function isValidChat(chat){

    if ( !chat.hasOwnProperty("id") || !chat.hasOwnProperty("title") || !chat.hasOwnProperty("type")){

        return false;

    }
    return true

}

/**
 * @param {Object} user 
 * @returns {Boolean}
 */
function isValidUser(user){

    if ( !user.hasOwnProperty("id") || user.hasOwnProperty("type") ){

        return false;

    }
    return true

}

/**
 * @param {string} string - supports also links
 * @returns {string|false} -returns the username without link and "@"
 */
function isValidUsername(string)
{
    var username = false;
    if(string.includes("t.me/"))
        username = string.split("t.me/")[1];
    if(string.includes("telegram.me/"))
        username = string.split("telegram.me/")[1];
    if(string.startsWith("@"))
        username = string.replace("@","");

    if(!username) username = string;

    //NFT usernames may be 4 chars long
    if(/^[a-zA-Z0-9]+$/.test(username) && username.length > 3 && username.length < 33)
        return username;
    return false;
}

/**
 * @param {string} optionName 
 * @returns {Boolean}
 */
function exhistInsideAnyLanguage(optionName)
{
    var l = global.LGHLangs;

    var caseSensitive = caseSensitive || false;

    langKeys = Object.keys(l);
    loadedLangs = Object.keys(l).length;


    for( var langIndex = 0; langIndex < loadedLangs; langIndex++ )
    {
        var curLang = l[langKeys[langIndex]]
        if(curLang.hasOwnProperty(optionName))
            return true
    }

    return false;
}

/**
 * @param {string} text 
 * @param {string} optionName 
 * @param {Boolean} caseSensitive 
 * @returns {string|false}
 */
function getCommandMatchLang(text, optionName, caseSensitive)
{
    var l = global.LGHLangs;

    var caseSensitive = caseSensitive || false;

    langKeys = Object.keys(l);
    loadedLangs = Object.keys(l).length;

    if(!text) return false;

    for( var langIndex = 0; langIndex < loadedLangs; langIndex++ )
    {
        if(!l[langKeys[langIndex]].hasOwnProperty(optionName)) continue;
        
        var curLangText = l[langKeys[langIndex]][optionName]

        if( caseSensitive && curLangText == text )
            return langKeys[langIndex];
        else if( !caseSensitive && curLangText.toUpperCase() == text.toUpperCase() )
            return langKeys[langIndex];
    }

    return false;
}

/**
 * @param {string} text 
 * @param {string} optionName - option to check if a specific option key exhist in any language
 * @param {Boolean} caseSensitive
 * @returns {Boolean}
 */
function IsEqualInsideAnyLanguage(text, optionName, caseSensitive)
{
    var match = getCommandMatchLang(text, optionName, caseSensitive);
    if(match) return true;
    return false;
}

/**
 * @param {string} text 
 * @returns {Array<Array<TelegramBot.KeyboardButton>>}
 */
function parseTextToInlineKeyboard(text)
{

    var culumnsLimit = 8;
    var rowsLimit = 14; //tg limit 16
    var totalButtonsLimit = 92; //tg limit 100
    var buttonNameLimit = 64;

    /*Group - t.me/username && Channel - @username
    Group regulation - rules */


    var board = [];
    var totalButtons = 0;
    
    var rows = text.split("\n");
    for( var rowIndex=0; rowIndex < rows.length; rowIndex++)
    {
        if(rowIndex+1 > rowsLimit) return {error:"ROWS_LIMIT", row: rowIndex+1, culumn: 0};
        board.push([]);

        var row = rows[rowIndex];
        var buttons = row.split(" &&") //forcing space+&& because links may contain double &
        for( var culumnIndex=0; culumnIndex < buttons.length; culumnIndex++ )
        {
            if(culumnIndex+1 > culumnsLimit) return {error:"CULUMNS_LIMIT", row: rowIndex+1, culumn: culumnIndex+1};
            totalButtons++;
            if(totalButtons > totalButtonsLimit) return {error:"TOTAL_LIMIT", row: rowIndex+1, culumn: culumnIndex+1};

            var button = buttons[culumnIndex];

            if(!button.includes("-")) return {error:"MISSING_LINK", row: rowIndex+1, culumn: culumnIndex+1};

            //this code should be able to accept also things like "This - is -https://google.com"
            var rawLink = button.split(" -").slice(-1)[0]; //forcing space+dash because links may contain double &
            var buttonName = replaceLast(button, " -"+rawLink, "").replace(/\s+/g, ' ').trim();
            var link = rawLink.replaceAll(" ","");

            if(buttonName.length > buttonNameLimit) return {error:"NAME_LIMIT", row: rowIndex+1, culumn: culumnIndex+1};
            if(buttonName.length == 0) return {error:"NAME_TOO_SHORT", row: rowIndex+1, culumn: culumnIndex+1};

            if(link.startsWith("@")) link = link.replace("@","t.me/");
            else if(!link.startsWith("http://") && !link.startsWith("https://"))
            {

                link = "https://"+link;
                if(!isValidUrl(link) || !link.includes(".")) return {error:"INVALID_LINK", row: rowIndex+1, culumn: culumnIndex+1};
                
            }
            else if(!isValidUrl(link) || !link.includes(".")) return {error:"INVALID_LINK", row: rowIndex+1, culumn: culumnIndex+1};
            

            board[rowIndex].push( {text:buttonName, url: link} );

        }

    }

    return board;
    
}

/**
 * @typedef {Object} extractMediaReturn
 * @property {TelegramBot.MessageType} type
 * @property {string} fileId
 * @property {TelegramBot.FileOptions} options
 */
/**
 * @param {string} msg 
 * @returns {extractMediaReturn}
 */
function extractMedia(msg)
{

    var type = false;
    var fileId = false;
    var thumbFileId = false;

    if( msg.hasOwnProperty("document") && !msg.hasOwnProperty("animation"))
    {
        type = "document";
        fileId = msg.document.file_id
        if(msg.document.hasOwnProperty("thumbnail"))
            thumbFileId = msg.document.thumbnail.file_id
    }
    if( msg.hasOwnProperty("animation") )
    {
        type = "animation";
        fileId = msg.animation.file_id
        if(msg.document.hasOwnProperty("thumbnail"))
            thumbFileId = msg.document.thumbnail.file_id
    }
    if( msg.hasOwnProperty("audio") )
    {
        type = "audio";
        fileId = msg.audio.file_id
    }
    if( msg.hasOwnProperty("photo") )
    {
        type = "photo";
        fileId = msg.photo[0].file_id
    }
    if( msg.hasOwnProperty("video") )
    {
        type = "video";
        fileId = msg.video.file_id
        if(msg.video.hasOwnProperty("thumbnail"))
            thumbFileId = msg.video.thumbnail.file_id
    }
    if( msg.hasOwnProperty("video_note") )
    {
        type = "video_note";
        fileId = msg.video.file_id;
        if(msg.video_note.hasOwnProperty("thumbnail"))
            thumbFileId = msg.video_note.thumbnail.file_id
    }
    if( msg.hasOwnProperty("sticker") )
    {
        type = "sticker";
        fileId = msg.sticker.file_id
    }

    var options = {};

    if(thumbFileId)
        options.thumbnail = thumbFileId;
    if(msg.hasOwnProperty("has_media_spoiler"))
        options.has_spoiler = msg.has_media_spoiler

    return {type, fileId, options};
    

}

/**
 * @param {TelegramBot.MessageType} type 
 * @returns {string}
 */
function mediaTypeToMethod(type)
{

    switch (type) {
        case "document": return "sendDocument";
        case "animation": return "sendAnimation";
        case "audio": return "sendAudio";
        case "photo": return "sendPhoto";
        case "video": return "sendVideo";
        case "video_note": return "sendVideoNote";
        case "sticker": return "sendSticker";
    }

}

/**
 * @param {string} text 
 * @returns {0|1|2|3|4|-1}
 */
function textToPunishment(text)
{
    switch (text) {
        case "OFF": return 0;
        case "WARN": return 1;
        case "KICK": return 2;
        case "MUTE": return 3;
        case "BAN": return 4;
        default: return -1;
    }
}

/**
 * @param {string} lang 
 * @param {GH.Punishment} punishment 
 * @returns {string}
 */
function punishmentToText(lang, punishment)
{
    var l = global.LGHLangs;

    switch(punishment)
    {
        case 0: return l[lang].NOTHING;
        case 1: return l[lang].WARN;
        case 2: return l[lang].KICK;
        case 3: return l[lang].MUTE;
        case 4: return l[lang].BAN;
    }
}

/**
 * @param {string} lang 
 * @param {GH.Punishment} punishment 
 * @param {Number} time - time in seconds
 * @param {Boolean} deletion
 * @returns 
 */
function punishmentToFullText(lang, punishment, time, deletion)
{
    var l = global.LGHLangs;
    time = time || 0;

    var text = punishmentToText(lang, punishment);

    if((punishment == 1 || punishment == 3 || punishment == 4) && time != 0)
        text+=" "+l[lang].FOR_HOW_MUCH+" "+secondsToHumanTime(lang, time);

    if(deletion)
        text+=" + "+l[lang].DELETE;

    return text;
}

/**
 * @param {string} lang 
 * @param {GH.Punishment} punishment 
 * @returns {string}
 */
function punishmentToSetTimeButtonText(lang, punishment)
{
    var l = global.LGHLangs;

    var punishmentText = punishmentToText(lang, punishment);

    switch(punishment)
    {
        case 1: return "❕"+l[lang].SET_PUNISHMENT_TIME.replace("{punishment}",punishmentText);
        case 3: return "🔇"+l[lang].SET_PUNISHMENT_TIME.replace("{punishment}",punishmentText);
        case 4: return "🚷"+l[lang].SET_PUNISHMENT_TIME.replace("{punishment}",punishmentText);
    }
}

/**
 * Handles a punishment callback identified and splitted by "_P_"
 * @param {GH} GHbot 
 * @param {TelegramBot.CallbackQuery} cb 
 * @param {TelegramBot.ChatId} userId 
 * @param {GH.Punishment} punishment
 * @returns {GH.Punishment} - returns new punishment number
 */
function handlePunishmentCallback(GHbot, cb, userId, punishment)
{
    var toSetPunishment = punishment;
    if( cb.data.includes("_P_") )
        toSetPunishment = textToPunishment(cb.data.split("_P_")[1].split(":")[0]);
    if( toSetPunishment != -1 )
    {
        punishment = toSetPunishment;
        if(punishment == toSetPunishment)
            GHbot.answerCallbackQuery(userId, cb.id);
    }
    return punishment;
}

/**
 * @param {string} lang 
 * @param {GH.Punishment} punishment - [0:off|1:warn|2:kick|3:mute|4:ban]. 
 * @param {string} prefix
 * @param {TelegramBot.ChatId} chatId 
 * @returns {Array<TelegramBot.KeyboardButton>} - Returns buttons with callback data prefix+"#STIME":"+chatId;
 */
function genPunishmentTimeSetButton(lang, punishment, prefix, chatId)
{
    var timeButtonText = punishmentToSetTimeButtonText(lang, punishment);
    switch(punishment)
    {
        case 1: return [{text: timeButtonText, callback_data: prefix+"#STIME:"+chatId}];
        case 3: return [{text: timeButtonText, callback_data: prefix+"#STIME:"+chatId}];
        case 4: return [{text: timeButtonText, callback_data: prefix+"#STIME:"+chatId}];
    }
    return false;
}

/**
 * @param {string} lang 
 * @param {GH.Punishment} punishment - [0:off|1:warn|2:kick|3:mute|4:ban]. 
 * @param {string} prefix
 * @param {TelegramBot.ChatId} chatId 
 * @param {Boolean} deletion - generate a button for deletion? if true set also delState
 * @param {Boolean|null} delState - is deletion enabled?
 * @returns {Array<Array<TelegramBot.KeyboardButton>>} - Returns buttons with callback data prefix+"_P_"+punishmentText+":"+chatId;
 */
function genPunishButtons(lang, punishment, prefix, chatId, deletion, delState)
{

    var buttons = [
        [{text: l[lang].OFF2_BUTTON, callback_data: prefix+"_P_OFF:"+chatId},
        {text: l[lang].WARN_BUTTON, callback_data: prefix+"_P_WARN:"+chatId},
        {text: l[lang].KICK_BUTTON, callback_data: prefix+"_P_KICK:"+chatId}],

        [{text: l[lang].MUTE_BUTTON, callback_data: prefix+"_P_MUTE:"+chatId},
        {text: l[lang].BAN_BUTTON, callback_data: prefix+"_P_BAN:"+chatId}]
    ];

    var pTimeB = genPunishmentTimeSetButton(lang, punishment, prefix+"_PTIME", chatId);
    if(pTimeB) buttons.push(pTimeB);

    var deleteMessagesBText = l[lang].DELETE_MESSAGES_BUTTON + ( delState ? " ✔️" : " ✖️");
    if(deletion) buttons.push([{text: deleteMessagesBText, callback_data: prefix+"_DELETION:"+chatId}]);

    return buttons;
}

/**
 * @param {TelegramBot.User} user
 * @returns {string}
 */
function fullName(user)
{
    var text = user.first_name || "";
    if(user.hasOwnProperty("last_name"))
        text = " "+user.last_name;
    return text;
}

/**
 * @param {TelegramBot.User} user 
 * @returns {string} 
 */
function usernameOrFullName(user)
{
    if(user.hasOwnProperty("username"))
        return "@"+user.username

    var text = user.first_name || false;
    if(user.hasOwnProperty("last_name"))
        text = " "+user.last_name;

    return text;
}

/**
 * @param {TelegramBot.UnbanOptions} user - at least user.id needed
 * @param {GH.LGHDatabase|null} db - optional, may help if data are not avaiable on user object
 * @returns {user} - @UsernameOrFullname [Id923295] html formatted
 */
function LGHUserName(user, db)
{
    db = db || false;

    var fullName = usernameOrFullName(user);
    if(!fullName && db)
    {
        var tookUser = db.users.get(user.id);
        if(tookUser) fullName = usernameOrFullName(tookUser);
    }
    fullName = fullName ? fullName+" " : "";
    return fullName+"["+code(user.id)+"] ";
}

/**
 * @param {GH.LGHAdminList} adminList 
 * @returns {Array<TelegramBot.ChatAdministratorRights>}
 */
function anonymizeAdmins(adminList)
{
    for(var i=0; i < adminList.length; ++i)
    {
        adminList[i].id = adminList[i].user.id;
        delete adminList[i].user;
        adminList[i].user = {id : adminList[i].id} //re-enabling id only for compatibility
    }
    
    return adminList;
}

/**
 * 
 * @param {Boolean} private - true if reply should be sent on private chat, false for group chat
 * @param {string} lang 
 * @param {GH} GHbot 
 * @param {TelegramBot.ChatId} userId - user chatId and private chat
 * @param {TelegramBot.ChatId} chatId - group chatId
 * @param {Function} func - runs your function giving as parameter the wanted chat id, intentend to be here the sendMessage
 * @returns {Promise<TelegramBot.Message>|false} - result of your passed function if was not an error
 */
async function sendCommandReply(private, lang, GHbot, userId, chatId, func)
{return new Promise(async (resolve, reject)=>{

    var l = global.LGHLangs;

    var sendId = private ? userId : chatId;
    var privateLink = "https://t.me/"+GHbot.TGbot.me.username;
    if(sendId == chatId)
        try{resolve(func(sendId))}catch(error){reject(error)}
    else try {
        await func(sendId);
        var sentMsg = await GHbot.sendMessage(userId, chatId, link(l[lang].SENT_PRIVATE_CHAT, privateLink), {parse_mode:"HTML"});
        resolve(sentMsg);
    }catch(error) {
        if(error.code != "ETELEGRAM"){reject(error); return;}
        var errorDesc = error.response.body.description
        if(!errorDesc.includes("blocked") && !errorDesc.includes("can't initiate conversation")){reject(error); return;}
        try {
            var sentMsg = await GHbot.sendMessage(userId, chatId, link(l[lang].START_BOT_FIRST, privateLink), {parse_mode:"HTML"})
            resolve(sentMsg);
        } catch (error) {reject(error)}   
    }

})}

/**
 * @param {string} lang 
 * @param {Error} error 
 * @returns {string}
 */
function telegramErrorToText(lang, error)
{
    if(error.code != "ETELEGRAM")
    {
        console.log(error);
        return;
    }

    var l = global.LGHLangs;

    var text = l[lang].UNKNOWN_ERROR;
    var errDescription = error.response.body.description;
    if(errDescription.includes("user not found"))
        text = l[lang].USER_NOT_FOUND;
    else if(errDescription.includes("PARTICIPANT_ID_INVALID"))
        text = l[lang].USER_NOT_MEMBER;
    else if(errDescription.includes("user is an administrator"))
        text = l[lang].USER_IS_ADMIN;
    else if(errDescription.includes("not enough rights"))
        text = l[lang].MISSING_RIGHTS;
    else if(errDescription.includes("user is not an administrator"))
        text = l[lang].USER_NOT_ADMIN;
    else if(errDescription.includes("ADMIN_RANK_EMOJI_NOT_ALLOWED"))
        text = l[lang].ADMIN_TITLE_EMOJI_FOUND;
    else if(errDescription.includes("RIGHT_FORBIDDEN"))
        text = l[lang].MISSING_RIGHTS;
    else if(errDescription.includes("only creator can edit their custom title"))
        text = l[lang].OWNER_ONLY_TITLE
    else if(errDescription.includes("CHAT_ADMIN_REQUIRED"))
        text = l[lang].MISSING_RIGHT_OR_ALREADY_PROMOTED;
    else if(errDescription.includes("can't promote self"))
        text = l[lang].CANT_SELF_PROMOTE;
    else if(errDescription.includes("Too Many Requests"))
        text = "⚠️ "+errDescription;
    else
    {
        console.log("unknown error in telegramErrorToText(), logging it's description...")
        console.log(errDescription)
    }

    return text;
}

/**
 * @param {GH} GHbot 
 * @param {TelegramBot.ChatId} userId 
 * @param {TelegramBot.ChatId} chatId 
 * @param {string} lang 
 * @param {Error} error 
 * @description - send a message alerting about an error occurred on group about the bot
 */
function handleTelegramGroupError(GHbot, userId, chatId, lang, error)
{
    var text = telegramErrorToText(lang, error);
    GHbot.sendMessage(userId, chatId, text);
}

/**
 * @param {GH.LGHChat} chat 
 * @param {TelegramBot.ChatId} userId 
 * @returns {Number}
 */
function getUserWarns(chat, userId)
{
    if(!chat.warns.count.hasOwnProperty(userId)) return 0;
    else return chat.warns.count[userId];
}


/**
 * @param {GH.LGHChat} chat 
 * @param {TelegramBot.ChatId} userId 
 * @returns {GH.LGHChat}
 */
function warnUser(chat, userId)
{
    if(!chat.warns.count.hasOwnProperty(userId)) chat.warns.count[userId] = 0;
    ++chat.warns.count[userId];
    return chat;
}

/**
 * @param {GH.LGHChat} chat 
 * @param {TelegramBot.ChatId} userId 
 * @returns {GH.LGHChat}
 */
function unwarnUser(chat, userId)
{
    if(!chat.warns.count.hasOwnProperty(userId)) chat.warns.count[userId] = 0;
    if(chat.warns.count[userId] > 0)
        --chat.warns.count[userId];
    
    return chat;
}

/**
 * @param {GH.LGHChat} chat 
 * @param {TelegramBot.ChatId} userId 
 * @returns {GH.LGHChat}
 */
function clearWarns(chat, userId)
{
    chat.warns.count[userId] = 0;
    return chat;
}

/**
 * 
 * @param {TelegramBot} TGbot 
 * @param {TelegramBot.ChatId} chatId 
 * @param {TelegramBot.ChatId} userId 
 * @param {GH.LGHDatabase|null} db 
 * @returns 
 */
async function loadChatUserId(TGbot, chatId, userId, db)
{
    try {
        var user = await TGbot.getChatMember(chatId, userId).user;
        if(db) db.users.add(user);
        return user;
    } catch (error) {
        return false;
    }
}

/**
 * @param {Array<TelegramBot.ChatMember>} members 
 * @returns {TelegramBot.ChatMember}
 */
function getOwner(members)
{
    var creator = false;
    members.forEach((member)=>{
        if(member.status == "creator") creator = member;
    })
    return creator;
}

/**
 * @param {*} config - LGH Configuration object
 * @param {TelegramBot.ChatId} chatId 
 * @returns {Boolean}
 * @description - check if chat is allowed based on configuration whitelists and blacklists
 */
function isChatAllowed(config, chatId)
{
    var whitelist = config.chatWhitelist;
    var blacklist = config.chatBlacklist;

    var key = String(chatId);
    if(!config.privateWhitelist && !key.startsWith("-")) return true; //if private chat true
    
    if(Object.keys(whitelist).length > 0 && !whitelist[chatId])
        return false

    if(blacklist[chatId])
        return false

    return true;
}

/**
 * @param {GH} GHbot 
 * @param {TelegramBot.ChatId} userId 
 * @param {TelegramBot.ChatId} chatId - chat to use to send the test message
 * @param {string} text 
 * @returns {Promise<Boolean>}
 * @description - Check if a telegram HTML message is allowed by telegram
 */
async function validateTelegramHTML(GHbot, userId, chatId, text)
{return new Promise(async (resolve, reject)=>{
    try {
        var sentMsg = await GHbot.sendMessage(userId, chatId, text, {parse_mode:"HTML"});
        GHbot.TGbot.deleteMessages(chatId, [sentMsg.message_id]);
        resolve(true);
    } catch (error) {
        resolve(false);
    }
})}

/**
 * @param {Object} origin 
 * @returns {string|false}
 */
function originToUsername(origin)
{
    if(origin.sender_user && origin.sender_user.username)
        return origin.sender_user.username;
    if(origin.chat && origin.chat.username)
        return origin.chat.username;
    return false;
}

/**
 * @param {Array<string>} whitelist 
 * @param {TelegramBot.ChatId} chatId 
 * @returns {Boolean}
 */
function isChatWhitelisted(whitelist, chatId)
{
    var chatId = Number(chatId);
    for(var i = 0; i<whitelist.length; i++)
    {
        var element = whitelist[i];

        if(element == chatId) return true;
        if(isString(element) && isNumber(element.split(":").at(-1)))
        {
            var iteratedChat = Number(element.split(":").at(-1));
            if(iteratedChat == chatId) return true;
        }
    }
    return false;
}

/**
 * @param {Array<string>} whitelist 
 * @param {string} userName 
 * @returns {Boolean}
 */
function isHiddenUserWhitelisted(whitelist, userName)
{
    for(var i = 0; i<whitelist.length; i++)
    {
        var element = whitelist[i];
        if(!element.endsWith(":|hidden")) continue;
        if(element.split(":|hidden").slice(0, -1).join(":|hidden") == userName) return true;
    }
    return false;
}

/**
 * @param {Array<string>} whitelist 
 * @param {string} username 
 * @returns {Boolean}
 */
function isUsernameWhitelisted(whitelist, username)
{
    if(!isValidUsername(username))
        return false;

    for(var i = 0; i<whitelist.length; i++)
    {
        var element = whitelist[i];
        if(!element.startsWith("@") || isValidId(element.split(":").at(-1))) continue;
        if(element.replace("@","").toLowerCase() == username.toLowerCase()) return true;
    }
    return false;
}

/**
 * @param {Object} origin
 * @param {GH.LGHChatBasedPunish} punishments
 * @param {Array<string>} exceptions
 * 
 * @returns {"user"|"bot"|"group"|"channel"|boolean} - returns false or "user"/"bot"/"group"/"channel"
 */
function originIsSpam(origin, exceptions)
{

    var type = origin.type;

    var originUsername = originToUsername(origin);
    if(originUsername && isUsernameWhitelisted(exceptions, originUsername))
        return false;

    if(type == "user")
    {
        if(isChatWhitelisted(exceptions, origin.sender_user.id))
            return false;
        
        if(origin.sender_user.is_bot)
            return "bot";

        return "user";
    }
    if(type == "hidden_user")
    {
        if(isHiddenUserWhitelisted(exceptions, origin.sender_user_name))
            return false;
        return "user";
    }
    if(type == "chat")
    {
        if(isChatWhitelisted(exceptions, origin.sender_chat.id))
            return false;
        return "group";
    }
    if(type == "channel")
    {
        if(isChatWhitelisted(exceptions, origin.chat.id))
            return false;
        return "channel";
    }
    
}

/**
 * @param {Array<TelegramBot.MessageEntity>} entities 
 * @returns {Array<string>}
 */
function entitiesLinks(entities)
{
    var links = [];
    entities.forEach((entity)=>{
        if(entity.hasOwnProperty("url"))
            links.push(entity.url)
    })
    return links;
}

/**
 * 
 * @param {GH.LibreGHelp} GHbot 
 * @param {GH.LGHDatabase} db 
 * @param {Object} MSGMK - MessageMaker object
 * @param {GH.LGHChat} chat 
 * @param {TelegramBot.User} newUser 
 * @param {TelegramBot.SendMessageOptions|null} options
 * @returns 
 */
async function welcomeNewUser(GHbot, db, MSGMK, chat, newUser, options)
{
    options = options || {};
    if(newUser.is_bot) return;
    if(chat.welcome.once && chat.welcome.joinList.includes(newUser.id)) return;

    if(chat.welcome.clean && chat.welcome.lastWelcomeId != false)
        GHbot.TGbot.deleteMessages(chat.id, [chat.welcome.lastWelcomeId]);

    var sentMessage = await MSGMK.sendMessage(GHbot, newUser, chat, chat.welcome.message, false, options);
    if(sentMessage)
    {
        chat.welcome.joinList.push(newUser.id);
        chat.welcome.lastWelcomeId = sentMessage.message_id;
    }
    db.chats.update(chat);
}

/**
 * 
 * @param {GH.LGHDatabase} db 
 * @param {string} callback 
 * @param {GH.LGHUser} user 
 * @param {GH.LGHChat} chat 
 * @param {boolean} onGroup 
 */
function waitReplyForChat(db, callback, user, chat, onGroup)
{
    onGroup = onGroup || false;

    if(onGroup)
    {
        callback = callback.split("?")[0].split(":")[0]+
        (callback.split("?").length>1 ? ("?"+callback.split("?")[1]) : "");
        chat.users[user.id].waitingReply = callback;
        db.chats.update(chat);
    }
    else
    {
        callback = callback.split("?")[0].split(":")[0]+":"+chat.id+
        (callback.split("?").length>1 ? ("?"+callback.split("?")[1]) : "");
        user.waitingReply = callback;
        db.users.update(user);
    }

}

function unsetWaitReply(db, user, chat, onGroup)
{
    onGroup = onGroup || false;

    if(onGroup)
    {
        chat.users[user.id].waitingReply = false;
        db.chats.update(chat);
    }
    else
    {
        user.waitingReply = false;
        db.users.update(user);
    }
}

module.exports = 
{
    bold : bold,
    code : code,
    tag : tag,
    link : link,
    isObject : isObject,
    cleanHTML : cleanHTML,
    isArray : isArray,
    isString :isString,
    replaceLast : replaceLast,
    isNumber : isNumber,
    randomInt : randomInt,
    keysArrayToObj : keysArrayToObj,
    chunkArray : chunkArray,
    isValidId : isValidId,
    isValidHost : isValidHost,
    isIpAddress : isIpAddress,
    isValidChat : isValidChat,
    isValidUser : isValidUser,
    isValidUsername : isValidUsername,
    parseCommand : parseCommand,
    genSettingsKeyboard : genSettingsKeyboard,
    genSettingsText : genSettingsText,
    genSettings2Keyboard : genSettings2Keyboard,
    genSetNumKeyboard : genSetNumKeyboard,
    genGroupAdminPermsKeyboard : genGroupAdminPermsKeyboard,
    genGroupAdminPermsText : genGroupAdminPermsText,
    genUserList : genUserList,
    genMemberInfoText : genMemberInfoText,
    stateToEmoji : stateToEmoji,
    tradCommand :tradCommand,
    genPermsReport : genPermsReport,
    isAdminOfChat : isAdminOfChat,
    hasAdminPermission : hasAdminPermission,
    exhistInsideAnyLanguage : exhistInsideAnyLanguage,
    IsEqualInsideAnyLanguage : IsEqualInsideAnyLanguage,
    parseTextToInlineKeyboard : parseTextToInlineKeyboard,
    extractMedia : extractMedia,
    mediaTypeToMethod : mediaTypeToMethod,
    punishmentToSetTimeButtonText :punishmentToSetTimeButtonText,
    handlePunishmentCallback : handlePunishmentCallback,
    genPunishmentTimeSetButton :genPunishmentTimeSetButton,
    genPunishButtons : genPunishButtons,
    textToPunishment : textToPunishment,
    punishmentToText : punishmentToText,
    punishmentToFullText : punishmentToFullText,
    parseHumanTime : parseHumanTime,
    secondsToTime : secondsToTime,
    secondsToHumanTime : secondsToHumanTime,
    getUnixTime : getUnixTime,
    fullName : fullName,
    usernameOrFullName : usernameOrFullName,
    LGHUserName : LGHUserName,
    anonymizeAdmins : anonymizeAdmins,
    sendCommandReply : sendCommandReply,
    telegramErrorToText : telegramErrorToText,
    handleTelegramGroupError : handleTelegramGroupError,
    getUserWarns : getUserWarns,
    warnUser : warnUser,
    unwarnUser : unwarnUser,
    clearWarns : clearWarns,
    loadChatUserId :loadChatUserId,
    getOwner : getOwner,
    isChatAllowed : isChatAllowed,
    validateTelegramHTML : validateTelegramHTML,
    originToUsername : originToUsername,
    originIsSpam : originIsSpam,
    entitiesLinks : entitiesLinks,
    welcomeNewUser : welcomeNewUser,
    waitReplyForChat : waitReplyForChat,
    unsetWaitReply : unsetWaitReply,
}
