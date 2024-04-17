const { getUnixTime, secondsToHumanTime, bold, LGHUserName } = require("./utils");

l = global.LGHLangs;
var year = 31536000;
var unrestrictOpts = {can_send_messages:true,can_send_audios:true,can_send_documents:true,can_send_photos:true,can_send_videos:true,
    can_send_video_notes:true,can_send_voice_notes:true,can_send_polls:true,can_send_other_messages:true,can_add_web_page_previews:true,
    can_change_info:true,can_invite_users:true,can_pin_messages:true,can_manage_topics:true}

function clearExpiredUserWarns(chat, userId)
{
    var now = getUnixTime();

    if(chat.warns.timed.hasOwnProperty(userId))
    {
        chat.warns.timed[userId].forEach((endTime, index)=>{
            if((now - endTime) >= 0)
            {
                chat.warns.timed[userId].splice(index, 1);
                if(chat.users[userId].warnCount > 0)
                    --chat.users[userId].warnCount;
                updateChat = true;
            }
        })
    }

    return chat;
}

async function punishUser(TGbot, chat, user, punishment, time, reason)
{

    console.log("Punishing user " + punishment)

    var lang = chat.lang;
    var userId = user.id;
    var now = getUnixTime();
    time = time || -1;
    reason = reason || false;
    var validTime = time != -1 && time >= 30 && time < year+1;

    if(punishment == 0) return;

    var text = LGHUserName(user);
    var buttons = [];
    var options = {};
    if(validTime) options.until_date = now+time+5;
    //warn
    if(punishment == 1)
    {

        chat = clearExpiredUserWarns(chat, userId);

        //apply warn
        chat.users[userId].warnCount += 1;
        if(time != -1)
        {
            if(!chat.warns.timed.hasOwnProperty(userId))
                chat.warns.timed[userId] = [];
            chat.warns.timed[userId].push(now + time);
        }

        //re-punish if limit is hit
        if(chat.users[userId].warnCount >= chat.warns.limit)
        {
            var repunishReason = reason || "";repunishReason+=" ("+l[lang].REACHED_WARN_LIMIT+")"
            punishUser(TGbot, chat, user, chat.warns.punishment, chat.warns.PTime, repunishReason);
            chat.users[userId].warnCount = 0;
            if(chat.warns.timed.hasOwnProperty(userId));
                delete chat.warns.timed[userId];
            updateChat = true;
            return;
        }
        else{
            text+=l[lang].HAS_BEEN_WARNED.replace("{emoji}","❕")+" ("+chat.users[userId].warnCount+" "+l[lang].OF+" "+chat.warns.limit+")";
            buttons.push([{text: l[lang].CANCEL_BUTTON, callback_data: "WARN_REVOKE#"+userId}]);
        }

    }

    //kick
    if(punishment == 2)
    {
        text+=l[lang].HAS_BEEN_KICKED.replace("{emoji}","❗️");
        await TGbot.unbanChatMember(chat.id, userId);
    }

    //mute
    if(punishment == 3)
    {
        text+=l[lang].HAS_BEEN_MUTED.replace("{emoji}","🔇");
        buttons.push([{text: l[lang].CANCEL_BUTTON, callback_data: "MUTE_REVOKE#"+userId}]);
        options.can_send_messages = false;
        await TGbot.restrictChatMember(chat.id, userId, options);
    }

    //ban
    if(punishment == 4)
    {
        text+=l[lang].HAS_BEEN_BANNED.replace("{emoji}","🚷");
        buttons.push([{text: l[lang].CANCEL_BUTTON, callback_data: "BAN_REVOKE#"+userId}]);
        await TGbot.banChatMember(chat.id, userId, options);
    }

    if(validTime) text+=" "+l[lang].FOR_HOW_MUCH+" "+secondsToHumanTime(lang, time);
    text+=".";

    if(reason)
        text+="\n"+bold(l[lang].REASON+": ")+reason+".";

    TGbot.sendMessage(chat.id, text, {parse_mode: "HTML", reply_markup: {inline_keyboard: buttons}});

    //TODO: plugin that manages punishment commands and their cancel buttons

}

async function unpunishUser(TGbot, chat, user, punishment, reason)
{

    console.log("Unpunishing user " + punishment)

    var lang = chat.lang;
    var userId = user.id;
    var now = getUnixTime();
    reason = reason || false;

    if(punishment == 0) return;

    var text = LGHUserName(user);
    var options = {};
    var buttons = [];
    //unwarn
    if(punishment == 1)
    {
        chat = clearExpiredUserWarns(chat, userId);

        //apply unwarn
        if(chat.users[userId].warnCount > 0)
            chat.users[userId].warnCount -= 1;

        if(chat.users[userId].warnCount == 0)
        {
            text+=l[lang].NO_MORE_WARNS;
            buttons = [[{text: "+1", callback_data: "WARN_INC#"+userId}]];
        }
        if(chat.users[userId].warnCount > 0)
        {
            text+=l[lang].HAS_WARNS_OF.replaceAll("{number}",chat.users[userId].warnCount).replaceAll("{max}",chat.warns.limit);
            buttons = [
                [{text: "-1", callback_data: "WARN_DEC#"+userId}, {text: "+1", callback_data: "WARN_INC#"+userId}],
                [{text: l[lang].RESET_WARNS_BUTTON, callback_data: "WARN_ZERO#"+userId}],
            ];
        }
 
    }

    //unmute
    if(punishment == 3)
    {
        text+=l[lang].UNMUTED;
        options = unrestrictOpts;
        await TGbot.restrictChatMember(chat.id, userId, options);
    }

    //unban
    if(punishment == 4)
    {
        text+=l[lang].UNBANNED;
        options.only_if_banned = true;
        await TGbot.unbanChatMember(chat.id, userId, options);
    }

    text+=".";

    if(reason)
        text+="\n"+bold(l[lang].REASON+": ")+reason+".";

    options.parse_mode = "HTML";
    options.reply_markup = {inline_keyboard:buttons};
    TGbot.sendMessage(chat.id, text, options);

}

module.exports = {punishUser, unpunishUser}
