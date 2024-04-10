const chrono = require('chrono-node');
const TelegramBot = require('node-telegram-bot-api');

function bold(text)
{
    return "<b>"+text+"</b>";
}
function tag(text, userId)
{
    return "<a href=\"tg://user?id="+userId+"\">"+text+"</a>";
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

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


/** 
 * @typedef {Object} Command
 * @property {String} text - Full raw command text
 * @property {String} prefix - Prefix, example: / ! . , ;
 * @property {String} botCommand - Command and bot specifier (ex. "start@usernamebot")
 * @property {String} name - Command name (ex. "start")
 * @property {String} bot - Specified bot name (ex. "usernamebot")
 * @property {String} args - Raw arguments text after the command
 * @property {Array} splitArgs - Array of arguments split by space
 */


/** 
 * @param  {string} text
 *         Raw message text.
 * @return {Command|Boolean} 
 *         Parsed command object, false if is not a command
 */
function parseCommand(text){

    //TODO: add optional argument for a string with all symbols considered prefix for command

    var prefix = text[0];
    if( prefix == "/" || prefix == "!" || prefix == "." || prefix == "," || prefix == ";" ){

        var temp = text.replace( prefix, "" );

        var botCommand = temp.split(" ")[0];    // "start@usernamebot"
        var name = botCommand.split("@")[0]; // "start"
        var bot = botCommand.split("@")[1];     // "usernamebot"

        var args;
        var splitArgs;
        if( temp.split(" ").lentgh > 1)
        {
            args = temp.split(" ")[1];
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

function genSettingsKeyboard(lang, chatId)
{

    var l = global.LGHLangs;

    var keyboard =
    [
        [{text: l[lang].S_RULES_BUTTON, callback_data: "S_RULES_BUTTON:"+chatId},
        {text: l[lang].S_ANTISPAM_BUTTON, callback_data: "S_ANTISPAM_BUTTON:"+chatId}],

        [{text: l[lang].S_WELCOME_BUTTON, callback_data: "S_WELCOME_BUTTON:"+chatId},
        {text: l[lang].S_ANTIFLOOD_BUTTON, callback_data: "S_FLOOD_M_:"+chatId}],

        [{text: l[lang].S_CAPTCHA_BUTTON, callback_data: "S_CAPTCHA_BUTTON:"+chatId},
        {text: l[lang].S_CHECKS_BUTTON, callback_data: "S_CHECKS_BUTTON:"+chatId}],

        [{text: l[lang].S_ADMIN_BUTTON, callback_data: "S_ADMIN_BUTTON:"+chatId},
        {text: l[lang].S_BLOCKS_BUTTON, callback_data: "S_BLOCKS_BUTTON:"+chatId}],

        [{text: l[lang].S_MEDIA_BUTTON, callback_data: "S_MEDIA_BUTTON:"+chatId},
        {text: l[lang].S_PORN_BUTTON, callback_data: "S_PORN_BUTTON:"+chatId}],

        [{text: l[lang].S_WARN_BUTTON, callback_data: "S_RULESS_WARN_BUTTONBUTTON:"+chatId},
        {text: l[lang].S_NIGHT_BUTTON, callback_data: "S_NIGHT_BUTTON:"+chatId}],

        [{text: l[lang].S_TAG_BUTTON, callback_data: "S_TAG_BUTTON:"+chatId},
        {text: l[lang].S_LINK_BUTTON, callback_data: "S_LINK_BUTTON:"+chatId}],

        [{text: l[lang].S_APPROVEMODE_BUTTON, callback_data: "S_APPROVEMODE_BUTTON:"+chatId}],

        [{text: l[lang].S_MESSAGESDELETION_BUTTON, callback_data: "S_MESSAGESDELETION_BUTTON:"+chatId}],

        [{text: l[lang].FLAG + "Lang", callback_data: "LANGS_BUTTON:"+chatId},
        {text: l[lang].S_CLOSE_BUTTON, callback_data: "S_CLOSE_BUTTON:"+chatId},
        {text: l[lang].OTHER_BUTTON, callback_data: "S_OTHER_BUTTON:"+chatId}],
    ] 

    return keyboard;

}

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

function genUserList(userIds, chat)
{
    var text = "";

    userIds.forEach((userId, index)=>{
        if(index+1 != userIds.length)
            text+=" ├";
        else
            text+=" └";

        var userData = chat.users[userId];
        var fullName = userData.fullName;
<<<<<<< Updated upstream
        text += "<a href=\"tg://user?id="+userId+"\">"+fullName+"</a>";
=======
        text += tag(fullName, userId);
>>>>>>> Stashed changes

        text += (userData.title && userData.title.length > 0) ? " » <i>"+userData.title+"</i>" : "";

        text+="\n";
    })


    return text;
}

/**
 * @typedef {import('../GHbot.js').LGHChat} LGHChat
 */
/**
 * @param {LGHChat} chat
 */
function genStaffListMessage(lang, chat)
{

    var text = bold(l[lang].GROUP_STAFF.toUpperCase())+"\n\n";

    var rolesList = Object.keys(chat.roles);
    rolesList.forEach(roleKey=>{
        var isPremade = !isNumber(roleKey);
        var roleData = chat.roles[roleKey];

        if(roleData.users.length == 0) return;

        var roleEmoji = isPremade ? global.roles[roleKey].emoji : roleData.emoji;
        text += roleEmoji+" ";
        var roleName = isPremade ? l[lang][global.roles[roleKey].name] : roleData.name;
        text += bold(roleName);

        text+="\n";

        var userIds = roleData.users;
        text += genUserList(userIds, chat);

        text+="\n";
        
    })

    var adminIds = [];
    chat.admins.forEach(admin=>{
        adminIds.push(admin.user.id);
    })
    if(adminIds.length != 0)
    {
        text+="👮🏼"+bold(l[lang].ADMINISTRATOR)+"\n";
        text += genUserList(adminIds, chat);
    }

    return text;

}

<<<<<<< Updated upstream
=======
/**
 * @param {LGHChat} chat
 * @param {TelegramBot.ChatMember} member
 */
function memberToChatStatus(lang, member)
{
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
 * @typedef {import('../GHbot.js').LGHUser} LGHUser
 */
/**
 * @param {LGHChat} chat
 * @param {LGHUser} user
 * @param {TelegramBot.ChatMember} member
 */
function genMemberInfoText(lang, chat, user, member)
{
    var text = "";

    var status = memberToChatStatus(lang, member);
    var warns = chat.users[user.id] ? chat.users[user.id].warnCount : 0;
    var joinDate = chat.users[user.id] ? chat.users[user.id].firtJoin : false; //TODO: translate to date based on group UTC data

    text+=bold("🆔 ID: ")+"<code>"+user.id+"</code>\n";
    text+=bold("👱 "+l[lang].NAME+": ")+tag(user.first_name, user.id)+"\n";
    if(user.hasOwnProperty("last_name"))
        text+=bold("👪 "+l[lang].SURNAME+": ")+tag(user.last_name, user.id)+"\n";
    if(user.hasOwnProperty("username"))
        text+=bold("🌐 Username: ")+"@"+user.username+"\n";
    text+=bold("👀 "+l[lang].SITUATION+": ")+status+"\n";
    text+=bold("❕ "+l[lang].WARNS+": ")+warns+"/"+chat.warns.limit+"\n";
    text+=bold("⤵️ "+l[lang].JOIN_WHEN+" ")+(joinDate ? joinDate : l[lang].UNKNOWN)+"\n";

    return text;
}

>>>>>>> Stashed changes
function getSetTimeMessage()
{
    
}

function stateToEmoji(perm)
{
    switch(perm)
    {
        case 1: return "✅";
        case 0: return "➖";
        case -1: return "❌";
    }
}

//TODO due to code here, we should force every custom command alias to be characters/numbers only, or it may inflict with html formatting or "COMMAND_" could search for unexhisting command
function genPermsReport(lang, perms)
{

    var text=bold(l[lang].COMMANDS+": ");
    perms.commands.forEach(commandName => {
        var command = commandName;
        if(commandName.startsWith("COMMAND_")) //if is language-depenent command translate it to the acutal command
            command = l[lang][commandName];

        text+="/"+command+" ";
    });

    text+="\n\n"+
    bold(l[lang].FLOOD+": ")+stateToEmoji(perms.flood)+"\n"+
    bold(l[lang].LINKS+": ")+stateToEmoji(perms.link)+"\n"+
    bold(l[lang].TGLINKS+": ")+stateToEmoji(perms.tgLink)+"\n"+
    bold(l[lang].FORWARD+": ")+stateToEmoji(perms.forward)+"\n"+
    bold(l[lang].QUOTE+": ")+stateToEmoji(perms.quote)+"\n"+
    bold(l[lang].PORN+": ")+stateToEmoji(perms.porn)+"\n"+
    bold(l[lang].NIGHT+": ")+stateToEmoji(perms.night)+"\n"+
    bold(l[lang].MEDIA+": ")+stateToEmoji(perms.media)+"\n"+
    bold(l[lang].ROLES+": ")+stateToEmoji(perms.media)+"\n"+
    bold(l[lang].SETTINGS+": ")+stateToEmoji(perms.settings)+"\n";

    return text;

}

function isAdminOfChat(chat, userId)
{if(chat.hasOwnProperty("admins")){

    for(var i=0; i < chat.admins.length; i++)
    {
        var admin = chat.admins[i];
        if(admin.user.id == userId) return true;
    }

    return false;

}else return false;}

function isValidChat(chat){

    if ( !chat.hasOwnProperty("id") || !chat.hasOwnProperty("title") || !chat.hasOwnProperty("type")){

        return false;

    }
    return true

}

function isValidUser(user){

    if ( !user.hasOwnProperty("id") || user.hasOwnProperty("type") ){

        return false;

    }
    return true

}

function exhistInsideAnyLanguage(optionName)
{
    var caseSensitive = caseSensitive || false;

    var l = global.LGHLangs;
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

function IsEqualInsideAnyLanguage(text, optionName, caseSensitive)
{

    var caseSensitive = caseSensitive || false;

    var l = global.LGHLangs;
    langKeys = Object.keys(l);
    loadedLangs = Object.keys(l).length;


    for( var langIndex = 0; langIndex < loadedLangs; langIndex++ )
    {
        var curLangText = l[langKeys[langIndex]][optionName]

        if( caseSensitive && curLangText == text )
            return true;
        else if( !caseSensitive && curLangText.toUpperCase() == text.toUpperCase() )
            return true;

    }

    return false;


}


function sendParsingError(TGbot, chatId, lang, callback_data)
{

    var l = global.LGHLangs;

    TGbot.sendMessage( chatId, l[lang].PARSING_ERROR, {
        parse_mode : "HTML",
        reply_markup : 
        {
            inline_keyboard :
            [
                [{text: l[lang].CANCEL_BUTTON, callback_data: callback_data}],
            ] 
        } 
    } )

}

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

function punishmentToText(lang, punishment)
{
    switch(punishment)
    {
        case 0: return l[lang].NOTHING;
        case 1: return l[lang].WARN;
        case 2: return l[lang].KICK;
        case 3: return l[lang].MUTE;
        case 4: return l[lang].BAN;
    }
}

//TODO: add translation system that replaces any word to english (like dictionary translation)
//ATTENTION HERE: for error he may return both 0 or 1
function parseHumanTime(text) {
    text = text+" from now";
    const parsedDate = chrono.parseDate(text);
    if (!parsedDate) return 0;
    const now = new Date();
    var millisecondsDifference = parsedDate.getTime() - now.getTime();
    var totalSeconds = Math.floor(millisecondsDifference / 1000);
    return ++totalSeconds;
}
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
function secondsToHumanTime(lang, seconds)
{
    var l = global.LGHLangs;

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

function getUnixTime() {
    const currentTimeMillis = new Date().getTime();
    const currentTimeSeconds = Math.floor(currentTimeMillis / 1000);
    return currentTimeSeconds;
}

function usernameOrFullName(user)
{
    if(user.hasOwnProperty("username"))
        return "@"+user.username

    var text = user.first_name;
    if(user.hasOwnProperty("last_name"))
        text = " "+user.last_name;

    return text;
}

async function getAdmins(TGbot, chatId)
{
    var adminList = await TGbot.getChatAdministrators( chatId );

    //remove deleted accounts
    for(var i=0; i < adminList.length; ++i)
        if(adminList[i].user.first_name.length == 0)
            adminList.splice(i, 1)

    return adminList
}

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

//check if it's a valid command and if the user has the permission to run that
function checkCommandPerms(command, commandKey, perms, literalNames)
{
    literalNames = literalNames || [];

    if(command &&
        ( IsEqualInsideAnyLanguage(command.name, commandKey) || literalNames.some(ln=>{return command.name == ln}))&&
        ( perms.commands.includes(commandKey) || literalNames.some(ln=>{return perms.commands.includes(ln)}) )
    ) return true;
    else return false;
}

module.exports = 
{

    bold : bold,
    isObject : isObject,
    isArray : isArray,
    isString :isString,
    replaceLast : replaceLast,
    isNumber : isNumber,
    randomInt : randomInt,
    isValidChat : isValidChat,
    isValidUser : isValidUser,
    parseCommand : parseCommand,
    genSettingsKeyboard : genSettingsKeyboard,
    genSetNumKeyboard : genSetNumKeyboard,
    genStaffListMessage : genStaffListMessage,
<<<<<<< Updated upstream
=======
    genMemberInfoText : genMemberInfoText,
>>>>>>> Stashed changes
    stateToEmoji : stateToEmoji,
    genPermsReport : genPermsReport,
    isAdminOfChat : isAdminOfChat,
    exhistInsideAnyLanguage : exhistInsideAnyLanguage,
    IsEqualInsideAnyLanguage : IsEqualInsideAnyLanguage,
    sendParsingError : sendParsingError,
    parseTextToInlineKeyboard : parseTextToInlineKeyboard,
    extractMedia : extractMedia,
    mediaTypeToMethod : mediaTypeToMethod,
    punishmentToText : punishmentToText,
    parseHumanTime : parseHumanTime,
    secondsToTime : secondsToTime,
    secondsToHumanTime : secondsToHumanTime,
    getUnixTime : getUnixTime,
    usernameOrFullName : usernameOrFullName,
    getAdmins : getAdmins,
    anonymizeAdmins : anonymizeAdmins,
    checkCommandPerms : checkCommandPerms
}
