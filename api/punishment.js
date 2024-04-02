const { usernameOrFullName, getUnixTime, secondsToHumanTime, bold } = require("./utils");

l = global.LGHLangs;
var year = 31536000;

async function punishUser(TGbot, chat, user, punishment, time, reason)
{

    console.log("Punishing user " + punishment)

    var updateChat = false;
    var lang = chat.lang;
    var userId = user.id;
    var now = getUnixTime();
    time = time || -1;
    reason = reason || false;
    var validTime = time != -1 && time >= 30 && time < year+1;

    if(punishment == 0) return;

    var text = usernameOrFullName(user)+" [<code>"+userId+"</code>] ";
    var buttons = [];
    var options = {};
    if(validTime) options.until_date = now+time+5;
    //warn
    if(punishment == 1)
    {

        //remove expired warns
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
            text+=l[lang].WARNED+" ("+chat.users[userId].warnCount+" "+l[lang].OF+" "+chat.warns.limit+")";
            buttons.push([{text: l[lang].CANCEL_BUTTON, callback_data: "REVOKE_WARN:"+userId}]);
        }

    }

    //kick
    if(punishment == 2)
    {
        text+=l[lang].HAS_BEEN+" ❗️"+l[lang].KICKED;
        await TGbot.banChatMember(chat.id, userId);
        await TGbot.unbanChatMember(chat.id, userId);
    }

    //mute
    if(punishment == 3)
    {
        text+=l[lang].HAS_BEEN+" 🔇"+l[lang].MUTED;
        buttons.push([{text: l[lang].CANCEL_BUTTON, callback_data: "REVOKE_MUTE:"+userId}]);
        options.can_send_messages = false;
        await TGbot.restrictChatMember(chat.id, userId, options);
    }

    //ban
    if(punishment == 4)
    {
        text+=l[lang].HAS_BEEN+" 🚷"+l[lang].BANNED;
        buttons.push([{text: l[lang].CANCEL_BUTTON, callback_data: "REVOKE_BAN:"+userId}]);
        await TGbot.banChatMember(chat.id, userId, options);
    }

    if(validTime) text+=" "+l[lang].FOR_HOW_MUCH+" "+secondsToHumanTime(lang, time);
    text+=".";

    if(reason)
        text+="\n"+bold(l[lang].REASON+": ")+reason+".";

    TGbot.sendMessage(chat.id, text, {parse_mode: "HTML", reply_markup: {inline_keyboard: buttons}});

    //TODO: plugin that manages punishment commands and their cancel buttons

}

module.exports = {punishUser}
