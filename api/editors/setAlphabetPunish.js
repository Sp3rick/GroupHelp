const TelegramBot = require("node-telegram-bot-api");
const ST = require("./setTime.js");
const {handlePunishmentCallback, genPunishButtons, punishmentToFullText, punishmentToText} = require("../utils.js");
const GH = require("../../GHbot.js");

/** 
 * @param  {GH} GHbot
 * @param  {GH.LGHDatabase} db - database
 * @param  {GH.LGHAlphabetBasedPunish} ABP - 
 * @param  {TelegramBot.CallbackQuery} cb
 * @param  {TelegramBot.Chat} chat
 * @param  {TelegramBot.User} user
 * @param  {String} cb_prefix
 * @param  {TelegramBot.KeyboardButton} returnButtons
 * @param  {String} title - custom title avaiable editing the message
 * @return {GH.LGHAlphabetBasedPunish|false} - returns a modified version of passed ABP, false if shouldn't be updated
 */
function callbackEvent(GHbot, db, ABP, cb, chat, user, cb_prefix, returnButtons, title)
{

    title = title || "Set chat based punish"

    var settingsChatId = cb.data.split(":")[1].split("?")[0];
    var lang = user.lang;
    var msg = cb.message;

    var update = false;
    var prefix = cb_prefix+"#ABP";

    var toEdit = false; //set what we are going to edit
    var pData = false; //punishment data about what we are editing
    var PObjName = false;
    if( cb.data.startsWith(prefix+"_ARABIC") )
        toEdit = "ARABIC";
    if( cb.data.startsWith(prefix+"_CYRILLIC") )
        toEdit = "CYRILLIC";
    if( cb.data.startsWith(prefix+"_CHINESE") )
        toEdit = "CHINESE";
    if( cb.data.startsWith(prefix+"_LATIN") )
        toEdit = "LATIN";
    if(toEdit)
    {
        var PObjName = toEdit.toLowerCase();
        pData = ABP[PObjName];
    }

    if( toEdit && cb.data.startsWith(prefix+"_"+toEdit+"_P_") )
    {
        var toSetPunishment = handlePunishmentCallback(GHbot, cb, user.id, pData.punishment);
        if(toSetPunishment == pData.punishment) return false;
        else {ABP[PObjName].punishment = toSetPunishment; update = true};
    }
    if( toEdit && cb.data.startsWith(prefix+"_"+toEdit+"_PTIME#STIME") )
    {
        var currentTime = pData.PTime;
        var STReturnButtons = [[{text: l[lang].BACK_BUTTON, callback_data: prefix+"_"+toEdit+":"+settingsChatId}]]
        var STCbPrefix = prefix+"_"+toEdit+"_PTIME";
        var STTitle = l[lang].SEND_PUNISHMENT_DURATION.replace("{punishment}",punishmentToText(lang, pData.punishment));
        var time = ST.callbackEvent(GHbot, db, currentTime, cb, chat, user, STCbPrefix, STReturnButtons, STTitle)

        if(time != -1 && time != currentTime)
        {
            ABP[PObjName].PTime = time;
            update = true;
        }
        return update ? ABP : false;
    }
    if( toEdit && cb.data.startsWith(prefix+"_"+toEdit+"_DELETION") )
    {
        ABP[PObjName].delete = !pData.delete;
        update = true;
    }
    if( cb.data.startsWith(prefix) )
    {
        var punishment = pData.punishment;
        var arabic = ABP.arabic;
        var cyrillic = ABP.cyrillic;
        var chinese = ABP.chinese;
        var latin = ABP.latin;

        var arabicB = (toEdit == "ARABIC") ? "» "+l[lang].ALPHABETS_ARABIC_BUTTON+" «" : l[lang].ALPHABETS_ARABIC_BUTTON;
        var cyrillicB = (toEdit == "CYRILLIC") ? "» "+l[lang].ALPHABETS_CYRILLIC_BUTTON+" «" : l[lang].ALPHABETS_CYRILLIC_BUTTON;
        var chineseB = (toEdit == "CHINESE" )? "» "+l[lang].ALPHABETS_CHINESE_BUTTON+" «" : l[lang].ALPHABETS_CHINESE_BUTTON;
        var latinB = (toEdit == "LATIN") ? "» "+l[lang].ALPHABETS_LATIN_BUTTON+" «" : l[lang].ALPHABETS_LATIN_BUTTON;

        var arabicCB = (toEdit == "ARABIC") ? prefix+":"+settingsChatId : prefix+"_ARABIC:"+settingsChatId
        var cyrillicCB = (toEdit == "CYRILLIC") ? prefix+":"+settingsChatId : prefix+"_CYRILLIC:"+settingsChatId
        var chineseCB = (toEdit == "CHINESE" )? prefix+":"+settingsChatId : prefix+"_CHINESE:"+settingsChatId
        var latinCB = (toEdit == "LATIN") ? prefix+":"+settingsChatId : prefix+"_LATIN:"+settingsChatId

        var buttons = [
            [{text: arabicB, callback_data: arabicCB},
            {text: cyrillicB, callback_data: cyrillicCB}],

            [{text: chineseB, callback_data: chineseCB},
            {text: latinB, callback_data: latinCB}],
        ];

        if(toEdit)
        {
            buttons.push([{text: "➖➖➖➖➖➖➖➖➖➖", callback_data: "EMPTY"}]);
            genPunishButtons(lang, punishment, prefix+"_"+toEdit, settingsChatId, true, pData.delete).forEach((line)=>{buttons.push(line)});
        }

        returnButtons.forEach((line)=>{buttons.push(line)});

        var text = (title || l[lang].ALPHABETS_DESCRIPTION)
        .replace("{arabic}", punishmentToFullText(lang, arabic.punishment, arabic.PTime, arabic.delete))
        .replace("{cyrillic}", punishmentToFullText(lang, cyrillic.punishment, cyrillic.PTime, cyrillic.delete))
        .replace("{chinese}", punishmentToFullText(lang, chinese.punishment, chinese.PTime, chinese.delete))
        .replace("{latin}", punishmentToFullText(lang, latin.punishment, latin.PTime, latin.delete));
        GHbot.editMessageText( user.id, text, {
            message_id : msg.message_id,
            chat_id : chat.id,
            parse_mode : "HTML",
            reply_markup : {inline_keyboard: buttons},
            disable_web_page_preview: true,
        })
        GHbot.answerCallbackQuery(user.id, cb.id);
    }

    return update ? ABP : false;
}

/** 
 * @param  {GH} GHbot
 * @param  {GH.LGHAlphabetBasedPunish} ABP
 * @param  {TelegramBot.Message} msg
 * @param  {TelegramBot.Chat} chat
 * @param  {TelegramBot.User} user
 * @param  {String} cb_prefix
 * 
 * @return {GH.LGHAlphabetBasedPunish|false} returns a modified version of passed ABP, false if shouldn't be updated
 */
function messageEvent(GHbot, ABP, msg, chat, user, cb_prefix)
{

    var l = global.LGHLangs;

    var settingsChatId = user.waitingReplyType.split(":")[1].split("?")[0];
    var lang = user.lang;

    var update = false;
    var prefix = cb_prefix+"#ABP";
   

    var toEdit = false; //set what we are going to edit
    var pData = false; //punishment data about what we are editing
    var PObjName = false;
    if (user.waitingReplyType.startsWith(prefix+"_ARABIC"))
        toEdit = "ARABIC";
    if (user.waitingReplyType.startsWith(prefix+"_CYRILLIC"))
        toEdit = "CYRILLIC";
    if (user.waitingReplyType.startsWith(prefix+"_CHINESE"))
        toEdit = "CHINESE";
    if (user.waitingReplyType.startsWith(prefix+"_LATIN"))
        toEdit = "LATIN";
    if (toEdit) {
        var PObjName = toEdit.toLowerCase();
        pData = ABP[PObjName];
    }
    if (user.waitingReplyType.startsWith(prefix+"_"+toEdit+"_PTIME#STIME")) {
        var STReturnButtons = [[{ text: l[user.lang].BACK_BUTTON, callback_data: prefix+"_"+toEdit+":"+settingsChatId }]];
        var STCbPrefix = prefix+"_"+toEdit+"_PTIME";
        var STTitle = l[user.lang].SEND_PUNISHMENT_DURATION.replace("{punishment}", punishmentToText(user.lang, pData.punishment));
        var time = ST.messageEvent(GHbot, pData.PTime, msg, chat, user, STCbPrefix, STReturnButtons, STTitle);

        if (time != -1 && time != pData.PTime) {
            ABP[PObjName].PTime = time;
            update = true;
        }
    }

    return update ? ABP : false;

}

module.exports = {
    callbackEvent : callbackEvent,
    messageEvent : messageEvent
}
