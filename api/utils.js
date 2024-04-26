const chrono = require('chrono-node');
const TelegramBot = require('node-telegram-bot-api');
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

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function keysArrayToObj(array)
{
    var obj = {};
    array.forEach(key=>{obj[key]=true});
    return obj;
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
 * @param  {string} text
 *         Raw message text.
 * @return {Command|false} 
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

        [{text: l[lang].S_WARN_BUTTON, callback_data: "S_WARN_BUTTON:"+chatId},
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

function genSettingsText(lang, chat)
{
    return bold(l[lang].SETTINGS.toUpperCase())+"\n"+
    bold(l[lang].GROUP+": ")+code(chat.title)+"\n"+
    bold(l[lang].GROUP_LANGUAGE+": ")+"<i>"+l[chat.lang].LANG_SELECTOR+"</i>\n\n"+
    l[lang].SETTINGS_SELECT;
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

function genGroupAdminPermsKeyboard(lang, admin, topicsAvaiable)
{
    var prefix = "ADMINPERM_";
    var userId = admin.user.id;

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
        {text: deletion+" "+l[lang].DELETE_MESSAGES, callback_data: prefix+"DELETE?"+userId},
    ]
    
    var line2 =
    [
        {text: videochat+" "+l[lang].MANAGE_VIDEOCHAT, callback_data: prefix+"VIDEOCHAT?"+userId},
        {text: restrict+" "+l[lang].RESTRICT_MEMBERS, callback_data: prefix+"RESTRICT?"+userId},
    ]
    var line3 =
    [
        {text: promote+" "+l[lang].PROMOTE_MEMBERS, callback_data: prefix+"PROMOTE?"+userId},
        {text: modify+" "+l[lang].MODIFY_GROUP, callback_data: prefix+"MODIFY?"+userId},
    ]
    var line4 =
    [
        {text: invite+" "+l[lang].INVITE_MEMBERS, callback_data: prefix+"INVITE?"+userId},
        {text: stories+" "+l[lang].MANAGE_STORIES, callback_data: prefix+"STORIES?"+userId},
    ]

    var line5 =
    [
        {text: storyedit+" "+l[lang].EDIT_STORIES, callback_data: prefix+"STORYEDIT?"+userId},
        {text: storydel+" "+l[lang].DELETE_STORIES, callback_data: prefix+"STORYDEL?"+userId},
    ]

    var line6 =
    [
        {text: pin+" "+l[lang].CAN_PIN, callback_data: prefix+"PIN?"+userId},
    ]

    var line7 =
    [
        {text: l[lang].EDIT_ADMIN_TITLE_BUTTON, callback_data: "ADMINTITLE?"+userId},
    ]

    var line8 =
    [
        {text: l[lang].CLOSE_MENU_BUTTON, callback_data: "S_CLOSE_BUTTON"},
    ]

    if(topicsAvaiable)
        line6.push({text: topics+" "+l[lang].MANAGE_TOPICS, callback_data: prefix+"TOPICS?"+userId})

    return [line1, line2, line3, line4, line5, line6, line7, line8];
}

function genGroupAdminPermsText(lang, chat, userId)
{
    var text = 
    (chat.users[userId].title ? ("\n"+bold(l[lang].ADMIN_TITLE)+": "+code(chat.users[userId].title)) : "")+"\n\n"+
    l[lang].PROMOTED_DESCRIPTION;

    return text;
}

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
 * @param {LGHChat} chat
 * @param {TelegramBot.ChatMember} member
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
 * @typedef {import('../GHbot.js').LGHUser} LGHUser
 */
/**
 * @param {LGHChat} chat
 * @param {LGHUser} user
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

function tradCommand(lang, commandKey)
{
    var translated = "";
    if(commandKey.startsWith("COMMAND_")) //if is language-depenent command translate it to the acutal command
        translated = l[lang][commandKey];
    if(commandKey.startsWith("@COMMAND_"))
        translated = l[lang][commandKey.replace("@","")];

    return translated;
}

//TODO due to code here, we should force every custom command alias to be characters/numbers only, or it may inflict with html formatting or "COMMAND_" could search for unexhisting command
function genPermsReport(lang, perms)
{

    var l = global.LGHLangs;

    var text=bold(l[lang].COMMANDS+": ");
    perms.commands.forEach(commandName => {
        var command = tradCommand(lang, commandName);

        text+="/"+command;
        if(commandName.startsWith("@"))
            text+="(🔏) ";
        else
            text+=" ";

        if(command == undefined)console.log("LGH: Undefined command key " + commandName)
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
    bold(l[lang].ROLES+": ")+stateToEmoji(perms.roles)+"\n"+
    bold(l[lang].SETTINGS+": ")+stateToEmoji(perms.settings)+"\n";

    return text;

}

function isAdmin(admins, userId)
{
    for(var i=0; i < admins.length; i++)
    {
        var admin = admins[i];
        if(admin.user.id == userId) return true;
    }

    return false;
}

function isAdminOfChat(chat, userId)
{if(chat.hasOwnProperty("admins")){
    return isAdmin(chat.admins, userId);
}else return false;}

function hasAdminPermission(admins, userId, perm)
{
    if(!isAdmin(admins, userId)) return false;

    var hasPermission = false;
    admins.forEach((admin)=>{
        if(admin.user.id == userId && admin.hasOwnProperty(perm) && admin[perm])
            hasPermission = true;
    })

    return hasPermission;
}

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

function IsEqualInsideAnyLanguage(text, optionName, caseSensitive)
{
    var match = getCommandMatchLang(text, optionName, caseSensitive);
    if(match) return true;
    return false;
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

function punishmentToTextAndTime(lang, punishment, time)
{
    var l = global.LGHLangs;
    time = time || 0;

    var punishmentText = punishmentToText(lang, punishment);

    var text = bold(l[lang].PUNISHMENT)+": "+punishmentText;
    if((punishment == 1 || punishment == 3 || punishment == 4) && time != 0)
        text+=" "+l[lang].FOR_HOW_MUCH+" "+secondsToHumanTime(lang, time);
    return text;
}

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

function genPunishmentTimeSetButton(lang, punishment, prefix, chatId)
{
    var l = global.LGHLangs;

    var timeButtonText = punishmentToSetTimeButtonText(lang, punishment);
    switch(punishment)
    {
        case 1: return [{text: timeButtonText, callback_data: prefix+"#STIME:"+chatId}];
        case 3: return [{text: timeButtonText, callback_data: prefix+"#STIME:"+chatId}];
        case 4: return [{text: timeButtonText, callback_data: prefix+"#STIME:"+chatId}];
    }
    return false;
}

function usernameOrFullName(user)
{
    if(user.hasOwnProperty("username"))
        return "@"+user.username

    var text = user.first_name || false;
    if(user.hasOwnProperty("last_name"))
        text = " "+user.last_name;

    return text;
}

//return @UsernameOrName [Id923295] html formatted, needs at least user.id, db to allow take things from database if not avaiable
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

//currently not use GHbot, getAdmins seems to be already safe
async function getAdmins(TGbot, chatId, db)
{
    var adminList = await TGbot.getChatAdministrators( chatId );

    //remove deleted accounts
    for(var i=0; i < adminList.length; ++i)
        if(adminList[i].user.first_name.length == 0)
            adminList.splice(i, 1)

    if(db) storeMembers(adminList, db);

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

//check if it's a valid command and if the user has a specific permission to run that
function checkCommandPerms(command, commandKey, perms, literalNames)
{
    literalNames = literalNames || [];

    if(command &&
        ( IsEqualInsideAnyLanguage(command.name, commandKey) || literalNames.some(ln=>{return command.name == ln}))&&
        ( perms.commands.includes(commandKey) || perms.commands.includes("@"+commandKey) || literalNames.some(ln=>{return perms.commands.includes(ln)}) )
    ) return true;
    else return false;
}

function replyCommandChat(commandPerm, chatId, userId)
{
    return commandPerm.startsWith("@") ? userId : chatId;
}

async function sendCommandReply(commandKey, lang, GHbot, user, chatId, func)
{return new Promise(async (resolve, reject)=>{

    var l = global.LGHLangs;
    var userId = user.id;

    var commandIndex = user.perms.commands.indexOf(commandKey);
    if(commandIndex == -1) commandIndex = user.perms.commands.indexOf("@"+commandKey);

    var commandPerm = user.perms.commands[commandIndex];

    var sendId = replyCommandChat(commandPerm, chatId, userId);
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
        if(!errorDesc.includes("blocked")){reject(error); return;}
        try {
            var sentMsg = await GHbot.sendMessage(userId, chatId, link(l[lang].START_BOT_FIRST, privateLink), {parse_mode:"HTML"})
            resolve(sentMsg);
        } catch (error) {reject(error)}   
    }

})}

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
        text = l[lang].USER_NOT_ADMIN
    else if(errDescription.includes("ADMIN_RANK_EMOJI_NOT_ALLOWED"))
        text = l[lang].ADMIN_TITLE_EMOJI_FOUND
    else if(errDescription.includes("Too Many Requests"))
        text = "⚠️ "+errDescription;
    else
    {
        console.log("unknown error in telegramErrorToText(), logging it's description...")
        console.log(errDescription)
    }

    return text;
}

function handleTelegramGroupError(GHbot, userId, chatId, lang, error)
{
    var text = telegramErrorToText(lang, error);
    GHbot.sendMessage(userId, chatId, text);
}

function getUserWarns(chat, userId)
{
    if(!chat.warns.count.hasOwnProperty(userId)) return 0;
    else return chat.warns.count[userId];
}

function warnUser(chat, userId)
{
    if(!chat.warns.count.hasOwnProperty(userId)) chat.warns.count[userId] = 0;
    ++chat.warns.count[userId];
    return chat;
}

function unwarnUser(chat, userId)
{
    if(!chat.warns.count.hasOwnProperty(userId)) chat.warns.count[userId] = 0;
    if(chat.warns.count[userId] > 0)
        --chat.warns.count[userId];
    
    return chat;
}

function clearWarns(chat, userId)
{
    chat.warns.count[userId] = 0;
    return chat;
}

async function loadChatUserId(TGbot, chatId, userId, db)
{
    try {
        var user = await TGbot.getChatMember(chatId, userId).user;
        db.users.add(user);
        return user;
    } catch (error) {
        return false;
    }
}

function storeMembers(members, db)
{
    members.forEach((member)=>{
        if(!db.users.exhist(member.user.id))
            db.users.add(member.user)
    })
}

function getOwner(members)
{
    var creator = false;
    members.forEach((member)=>{
        if(member.status == "creator") creator = member;
    })
    return creator;
}

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

module.exports = 
{

    bold : bold,
    code : code,
    tag : tag,
    isObject : isObject,
    cleanHTML : cleanHTML,
    isArray : isArray,
    isString :isString,
    replaceLast : replaceLast,
    isNumber : isNumber,
    randomInt : randomInt,
    keysArrayToObj : keysArrayToObj,
    isValidChat : isValidChat,
    isValidUser : isValidUser,
    parseCommand : parseCommand,
    genSettingsKeyboard : genSettingsKeyboard,
    genSettingsText : genSettingsText,
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
    genPunishmentTimeSetButton :genPunishmentTimeSetButton,
    punishmentToText : punishmentToText,
    punishmentToTextAndTime : punishmentToTextAndTime,
    parseHumanTime : parseHumanTime,
    secondsToTime : secondsToTime,
    secondsToHumanTime : secondsToHumanTime,
    getUnixTime : getUnixTime,
    usernameOrFullName : usernameOrFullName,
    LGHUserName : LGHUserName,
    getAdmins : getAdmins,
    anonymizeAdmins : anonymizeAdmins,
    checkCommandPerms : checkCommandPerms,
    replyCommandChat : replyCommandChat,
    sendCommandReply : sendCommandReply,
    telegramErrorToText : telegramErrorToText,
    handleTelegramGroupError : handleTelegramGroupError,
    getUserWarns : getUserWarns,
    warnUser : warnUser,
    unwarnUser : unwarnUser,
    clearWarns : clearWarns,
    loadChatUserId :loadChatUserId,
    storeMembers : storeMembers,
    getOwner : getOwner,
    isChatAllowed : isChatAllowed,
}
