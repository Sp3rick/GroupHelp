const { parse } = require("querystring");

let isObject = function(a) {
    return (!!a) && (a.constructor === Object);
};
let isArray = function(a) {
    return (!!a) && (a.constructor === Array);
};
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
        {text: l[lang].S_ANTIFLOOD_BUTTON, callback_data: "S_ANTIFLOOD_BUTTON:"+chatId}],

        [{text: l[lang].S_CAPTCHA_BUTTON, callback_data: "S_CAPTCHA_BUTTON:"+chatId},
        {text: l[lang].S_CHECKS_BUTTON, callback_data: "S_CHECKS_BUTTON:"+chatId}],

        [{text: l[lang].S_ADMIN_BUTTON, callback_data: "S_ADMIN_BUTTON:"+chatId},
        {text: l[lang].S_BLOCKS_BUTTON, callback_data: "S_BLOCKS_BUTTON:"+chatId}],

        [{text: l[lang].S_MEDIA_BUTTON, callback_data: "S_MEDIA_BUTTON:"+chatId},
        {text: l[lang].S_PORN_BUTTON, callback_data: "S_PORN_BUTTON:"+chatId}],

        [{text: l[lang].S_WARN_BUTTON, callback_data: "S_RULESS_WARN_BUTTONBUTTON:"+chatId},
        {text: l[lang].S_NIGTH_BUTTON, callback_data: "S_NIGTH_BUTTON:"+chatId}],

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

module.exports = 
{

    isObject : isObject,
    isArray : isArray,
    replaceLast : replaceLast,
    isNumber : isNumber,
    randomInt : randomInt,
    isValidChat : isValidChat,
    isValidUser : isValidUser,
    parseCommand : parseCommand,
    genSettingsKeyboard : genSettingsKeyboard,
    isAdminOfChat : isAdminOfChat,
    IsEqualInsideAnyLanguage : IsEqualInsideAnyLanguage,
    sendParsingError : sendParsingError,
    parseTextToInlineKeyboard : parseTextToInlineKeyboard

}
