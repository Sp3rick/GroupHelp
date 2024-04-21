const { getUnixTime, secondsToHumanTime, bold, handleTelegramGroupError } = require("./utils");

l = global.LGHLangs;
var year = 31536000;
var unrestrictOpts = {can_send_messages:true,can_send_audios:true,can_send_documents:true,can_send_photos:true,can_send_videos:true,
    can_send_video_notes:true,can_send_voice_notes:true,can_send_polls:true,can_send_other_messages:true,can_add_web_page_previews:true,
    can_change_info:true,can_invite_users:true,can_pin_messages:true,can_manage_topics:true}

function clearExpiredUserWarns(chat, targetId)
{
    var now = getUnixTime();

    if(chat.warns.timed.hasOwnProperty(targetId))
    {
        chat.warns.timed[targetId].forEach((endTime, index)=>{
            if((now - endTime) >= 0)
            {
                chat.warns.timed[targetId].splice(index, 1);
                if(chat.users[targetId].warnCount > 0)
                    --chat.users[targetId].warnCount;
                updateChat = true;
            }
        })
    }

    return chat;
}


//punish related functions//
function genRevokePunishButton(lang, targetId, punishment)
{
    //warn
    if(punishment == 1)
        return [{text: l[lang].CANCEL_BUTTON, callback_data: "PUNISH_REVOKE_WARN#"+targetId}];

    //mute
    if(punishment == 3)
        return [{text: l[lang].UNMUTE_BUTTON, callback_data: "PUNISH_REVOKE_MUTE#"+targetId}];

    //ban
    if(punishment == 4)
        return [{text: l[lang].UNBAN_BUTTON, callback_data: "PUNISH_REVOKE_BAN#"+targetId}];
}
function genPunishText(lang, chat, targetUser, punishment, time, reason, db)
{
    time = time || -1;
    reason = reason || false;
    var validTime = time != -1 && time >= 30 && time < year+1;
    var targetId = targetUser.id;
    var text = targetUser.name;

    //warn
    if(punishment == 1)
    {
        if(!chat.users.hasOwnProperty(targetId))
            return false;
        text+=l[lang].HAS_BEEN_WARNED.replace("{emoji}","❕")+" ("+chat.users[targetId].warnCount+" "+l[lang].OF+" "+chat.warns.limit+")";
    }

    //kick
    if(punishment == 2)
        text+=l[lang].HAS_BEEN_KICKED.replace("{emoji}","❗️");

    //mute
    if(punishment == 3)
        text+=l[lang].HAS_BEEN_MUTED.replace("{emoji}","🔇");

    //ban
    if(punishment == 4)
        text+=l[lang].HAS_BEEN_BANNED.replace("{emoji}","🚷");

    if(validTime) text+=" "+l[lang].FOR_HOW_MUCH+" "+secondsToHumanTime(lang, time);
    text+=".";

    if(reason)
        text+="\n"+bold(l[lang].REASON+": ")+reason+".";

    return text;
}
//resolves in the applyed punishment number
async function silentPunish(GHbot, userId, chat, targetId, punishment, time)
{return new Promise(async (resolve, reject)=>{try{

    time = time || -1;
    var options = {};

    //warn
    if(punishment == 1)
    {
        if(!chat.users.hasOwnProperty(targetId))
            return;

        chat = clearExpiredUserWarns(chat, targetId);

        //apply warn
        chat.users[targetId].warnCount += 1;
        if(time != -1)
        {
            if(!chat.warns.timed.hasOwnProperty(targetId))
                chat.warns.timed[targetId] = [];
            chat.warns.timed[targetId].push(now + time);
        }

        //re-punish if limit is hit
        if(chat.users[targetId].warnCount >= chat.warns.limit)
        {
            punishment = await silentPunish(GHbot, userId, chat, targetId, chat.warns.punishment, chat.warns.PTime);
            chat.users[targetId].warnCount = 0;
            if(chat.warns.timed.hasOwnProperty(targetId));
                delete chat.warns.timed[targetId];
            resolve(punishment);
            return;
        }

    }

    //kick
    if(punishment == 2)
        await GHbot.unbanChatMember(userId, chat.id, targetId);

    //mute
    if(punishment == 3)
    {
        options.can_send_messages = false;
        await GHbot.restrictChatMember(userId, chat.id, targetId, options);
    }

    //ban
    if(punishment == 4)
        await GHbot.banChatMember(userId, chat.id, targetId, options);

    resolve(punishment);

}catch(error){reject(error);}})
}
async function punishUser(GHbot, userId, chat, targetUser, punishment, time, reason)
{

    console.log("Punishing user " + punishment)

    var lang = chat.lang;
    var targetId = targetUser.id;
    time = time || -1;
    reason = reason || false;

    if(punishment == 0) return;

    try {
        //warn
        if(punishment == 1)
        {
            if(!chat.users.hasOwnProperty(targetId))
            {
                GHbot.sendMessage(userId, chat.id, l[lang].USER_NEVER_BEEN_MEMBER);
                return;
            }

            //check if has been applyed a repunish
            punishment = await silentPunish(GHbot, userId, chat, targetId, punishment);
            if(punishment != 1)
            {
                var repunishReason = reason || "";repunishReason+=" ("+l[lang].REACHED_WARN_LIMIT+")";
                var text = genPunishText(lang, chat, targetUser, punishment, time, repunishReason);
                var buttons = [genRevokePunishButton(lang, targetId, punishment)];
                var options = {parse_mode: "HTML", reply_markup: {inline_keyboard: buttons}};
                GHbot.sendMessage(userId, chat.id, text, options);
                return;
            }

        }

        //kick
        if(punishment == 2)
            await silentPunish(GHbot, userId, chat, targetId, punishment);

        //mute
        if(punishment == 3)
            await silentPunish(GHbot, userId, chat, targetId, punishment);


        //ban
        if(punishment == 4)
            await silentPunish(GHbot, userId, chat, targetId, punishment);

        var text = genPunishText(lang, chat, targetUser, punishment, time, reason);
        var buttons = [genRevokePunishButton(lang, targetId, punishment)];
        var options = {parse_mode: "HTML", reply_markup: {inline_keyboard: buttons}};
        GHbot.sendMessage(userId, chat.id, text, options);
    } catch (error) {
        handleTelegramGroupError(GHbot, userId, chat.id, lang, error);
    }

}


//unpunish related functions//
function genUnpunishButtons(lang, chat, targetId, punishment)
{
    if(punishment == 1)
    {
        if(!chat.users.hasOwnProperty(targetId))
            return [];

        if(chat.users[targetId].warnCount == 0)
            return [[{text: "+1", callback_data: "PUNISH_WARN_INC#"+targetId}]];

        if(chat.users[targetId].warnCount > 0)
            return [
                [{text: "-1", callback_data: "PUNISH_WARN_DEC#"+targetId}, {text: "+1", callback_data: "PUNISH_WARN_INC#"+targetId}],
                [{text: l[lang].RESET_WARNS_BUTTON, callback_data: "PUNISH_WARN_ZERO#"+targetId}],
            ];
    }
    return [];
}
function genUnpunishText(lang, chat, targetUser, punishment, reason, db)
{
    var text = targetUser.name;
    var targetId = targetUser.id;

    //unwarn
    if(punishment == 1)
    {
        if(!chat.users.hasOwnProperty(targetId))
            return false;

        if(chat.users[targetId].warnCount == 0)
            text+=l[lang].NO_MORE_WARNS;
        if(chat.users[targetId].warnCount > 0)
            text+=l[lang].HAS_WARNS_OF.replaceAll("{number}",chat.users[targetId].warnCount).replaceAll("{max}",chat.warns.limit);
    }

    //unmute
    if(punishment == 3)
        text+=l[lang].UNMUTED;

    //unban
    if(punishment == 4)
        text+=l[lang].UNBANNED;

    text+=".";

    if(reason)
        text+="\n"+bold(l[lang].REASON+": ")+reason+".";

    return text;

}
//resolves true on success
async function silentUnpunish(GHbot, userId, chat, targetId, punishment)
{return new Promise(async (resolve, reject)=>{try{

    var options = {};
    //unwarn
    if(punishment == 1)
    {
        if(!chat.users.hasOwnProperty(targetId))
            return;

        chat = clearExpiredUserWarns(chat, targetId);

        //apply unwarn
        if(chat.users[targetId].warnCount > 0)
            chat.users[targetId].warnCount -= 1;
    }

    //unmute
    if(punishment == 3)
    {
        options = unrestrictOpts;
        await GHbot.restrictChatMember(userId, chat.id, targetId, options);
    }

    //unban
    if(punishment == 4)
    {
        options.only_if_banned = true;
        await GHbot.unbanChatMember(userId, chat.id, targetId, options);
    }

    resolve(true);

}catch(error){reject(error);}})
}
async function unpunishUser(GHbot, userId, chat, targetUser, punishment, reason)
{

    console.log("Unpunishing user " + punishment)

    var lang = chat.lang;
    var targetId = targetUser.id;
    reason = reason || false;

    if(punishment == 0) return;

    var options = {};

    try {
        //unwarn
        if(punishment == 1)
        {
            if(!chat.users.hasOwnProperty(targetId))
            {
                GHbot.sendMessage(userId, chat.id, l[lang].USER_NEVER_BEEN_MEMBER);
                return;
            }
            await silentUnpunish(GHbot, userId, chat, targetId, punishment);
        }

        //unmute
        if(punishment == 3)
            await silentUnpunish(GHbot, userId, chat, targetId, punishment);

        //unban
        if(punishment == 4)
            await silentUnpunish(GHbot, userId, chat, targetId, punishment);

        var text = genUnpunishText(lang, chat, targetUser, punishment, reason);
        var buttons = genUnpunishButtons(lang, chat, targetUser.id, punishment);
        options.reply_markup = {inline_keyboard:buttons};
        options.parse_mode = "HTML";
        GHbot.sendMessage(userId, chat.id, text, options);
    } catch (error) {
        handleTelegramGroupError(GHbot, userId, chat.id, lang, error);
    }

}

module.exports = {genRevokePunishButton, genPunishText, silentPunish, punishUser, genUnpunishButtons, genUnpunishText, silentUnpunish, unpunishUser}
