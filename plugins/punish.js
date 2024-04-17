var LGHelpTemplate = require("../GHbot.js");
const { punishUser, unpunishUser } = require("../api/punishment.js");
const { checkCommandPerms, parseHumanTime } = require("../api/utils.js");

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    GHbot.onMessage( (msg, chat, user) => {

        if(!chat.isGroup) return;

        var command = msg.command;
        var lang = chat.lang;
        var target = command.target;

        if( chat.isGroup && checkCommandPerms(command, "COMMAND_DELETE", user.perms, ["del"]))
            TGbot.deleteMessages(chat.id, [msg.message_id, msg.reply_to_message.message_id]);


        var punishment = false;
        var removePunishment = false;
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_WARN", user.perms))
            punishment = 1;
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_UNWARN", user.perms))
            removePunishment = 1;

        if( chat.isGroup && checkCommandPerms(command, "COMMAND_KICK", user.perms))
            punishment = 2;

        if( chat.isGroup && checkCommandPerms(command, "COMMAND_MUTE", user.perms))
            punishment = 3;
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_UNMUTE", user.perms))
            removePunishment = 3;

        if( chat.isGroup && checkCommandPerms(command, "COMMAND_BAN", user.perms))
            punishment = 4;
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_UNBAN", user.perms))
            removePunishment = 4;

        var targetUser = false;
        if((punishment || removePunishment) && !target)
        {
            TGbot.sendMessage(chat.id, l[lang].INVALID_TARGET);
            return;
        }
        if(punishment || removePunishment) targetUser = target.user ? target.user : {id:target.id};
        if(punishment)
        {
            var time = false;
            var reason = false;
            if(command.args)
            {
                var identifiedTime = parseHumanTime(command.args);
                time = (punishment != 2 && identifiedTime >= 30) ? identifiedTime : false;
                if(!time) reason = command.args;
            }
            //TODO: send an error if user enter a time higher than 1 year
            punishUser(TGbot, chat, targetUser, punishment, time, reason)
        }
        if(removePunishment)
            unpunishUser(TGbot, chat, targetUser, removePunishment, command.args)

    } )


}

module.exports = main;
