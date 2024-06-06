var LGHelpTemplate = require("../GHbot.js");
const { punishUser, unpunishUser, silentPunish, silentUnpunish, genPunishText, genUnpunishButtons, genUnpunishText, genRevokePunishButton } = require("../api/punishment.js");
const { LGHUserNameByTarget } = require("../api/tagResolver.js");
const { checkCommandPerms, parseHumanTime, telegramErrorToText, unwarnUser, clearWarns, LGHUserName, bold, getUnixTime } = require("../api/utils.js");

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    GHbot.onMessage( (msg, chat, user) => {

        if(!msg.chat.isGroup) return;

        var command = msg.command;
        var lang = msg.chat.lang;
        var target = msg.target;

        var punishment = false;
        var removePunishment = false;
        var commandDelete = msg.chat.isGroup && checkCommandPerms(command, "COMMAND_DELETE", user.perms, ["del"]);
        var silentDelete = false;
        if(checkCommandPerms(command, "COMMAND_DELWARN", user.perms))
        {
            silentDelete = true;
            punishment = 1;
        }
        if(checkCommandPerms(command, "COMMAND_DELKICK", user.perms))
        {
            silentDelete = true;
            punishment = 2;
        }
        if(checkCommandPerms(command, "COMMAND_DELMUTE", user.perms))
        {
            silentDelete = true;
            punishment = 3;
        }
        if(checkCommandPerms(command, "COMMAND_DELBAN", user.perms))
        {
            silentDelete = true;
            punishment = 4;
        }

        if( commandDelete || silentDelete)
        {
            if(!msg.reply_to_message && !silentDelete)
            {
                GHbot.sendMessage(user.id, msg.chat.id, l[lang].INVALID_DELETE_TARGET, {parse_mode: "HTML"});
                return;
            }
            TGbot.deleteMessages(msg.chat.id, [msg.message_id, msg.reply_to_message.message_id]);
            var fullUsername = LGHUserNameByTarget(msg, target.id);
            if(!silentDelete && command.args && command.args.length > 0 && (getUnixTime() - msg.reply_to_message.date < 172800))
                GHbot.sendMessage(user.id, msg.chat.id, l[lang].MESSAGE_BEEN_DELETED_REASON
                .replace("{name}",fullUsername).replace("{reason}",bold(command.args)),
                {parse_mode: "HTML"});
        }

        if( msg.chat.isGroup && checkCommandPerms(command, "COMMAND_WARN", user.perms))
            punishment = 1;
        if( msg.chat.isGroup && checkCommandPerms(command, "COMMAND_UNWARN", user.perms))
            removePunishment = 1;

        if( msg.chat.isGroup && checkCommandPerms(command, "COMMAND_KICK", user.perms))
            punishment = 2;

        if( msg.chat.isGroup && checkCommandPerms(command, "COMMAND_MUTE", user.perms))
            punishment = 3;
        if( msg.chat.isGroup && checkCommandPerms(command, "COMMAND_UNMUTE", user.perms))
            removePunishment = 3;

        if( msg.chat.isGroup && checkCommandPerms(command, "COMMAND_BAN", user.perms))
            punishment = 4;
        if( msg.chat.isGroup && checkCommandPerms(command, "COMMAND_UNBAN", user.perms))
            removePunishment = 4;

        if((punishment || removePunishment) && !target)
        {
            GHbot.sendMessage(user.id, msg.chat.id, l[lang].INVALID_TARGET);
            return;
        }
        if(punishment)
        {
            var time = false;
            var reason = false;
            if(command.args) //TODO: send an error if user enter a time higher than 1 year
            {
                var identifiedTime = parseHumanTime(command.args);
                time = (punishment != 2 && identifiedTime >= 30) ? identifiedTime : false;
                if(!time) reason = command.args;
            }
            
            if(target.perms.immune == 1)
            {
                GHbot.sendMessage(user.id, msg.chat.id, l[lang].USER_IS_IMMUNE);
                return;
            }

            punishUser(GHbot, user.id, msg.chat, target, punishment, time, reason)
        }
        if(removePunishment)
            unpunishUser(GHbot, user.id, msg.chat, target, removePunishment, command.args)

    } )

    GHbot.onCallback( async (cb, chat, user) => {

        //security guards for settings
        if(!chat.isGroup) return;
        if(!cb.data.startsWith("PUNISH_")) return;
        if(!cb.target)
        {
            console.log("LGH Error: PUNISH_ target has not been identified");
            return;
        }

        var lang = chat.lang;
        var target = cb.target;
        
        if(cb.data.startsWith("PUNISH_REVOKE_"))
        {
            var punishment;
            var revokeText = cb.data.split("PUNISH_REVOKE_")[1].split("?")[0];
            var neededCommand;
            switch (revokeText) {
                case "WARN":{punishment = 1;neededCommand = "COMMAND_UNWARN";break;}
                case "MUTE":{punishment = 3;neededCommand = "COMMAND_UNMUTE";break;}
                case "BAN":{punishment = 4;neededCommand = "COMMAND_UNBAN";break;}
            }

            if(!user.perms.commands.includes(neededCommand))
            {
                GHbot.answerCallbackQuery(user.id, cb.id, {show_alert:true, text:l[user.lang].MISSING_PERMISSION});
                return;
            }

            try {
                await silentUnpunish(GHbot, user.id, chat, target.id, punishment);

                var text;
                var buttons;
                var options = {};
                if(revokeText == "WARN")
                {
                    text = genUnpunishText(lang, chat, target, punishment);
                    buttons = genUnpunishButtons(lang, chat, target.id, punishment);
                    options.parse_mode = "HTML";
                }
                if(revokeText == "MUTE")
                    text = cb.message.text+"\n\n ~ "+l[lang].USER_UNMUTED;
                if(revokeText == "BAN")
                    text = cb.message.text+"\n\n ~ "+l[lang].USER_UNBANNED;
                if(revokeText == "MUTE" || revokeText == "BAN")
                {
                    buttons = genUnpunishButtons(lang, chat, target.id, punishment);
                    if(cb.message.hasOwnProperty("entities")) options.entities = cb.message.entities;

                    //bold the additional text
                    options.entities.push({type:"bold", offset:cb.message.text.length, length:text.length-cb.message.text.length})
                }

                options.reply_markup = {inline_keyboard:buttons};
                options.message_id = cb.message.message_id;
                options.chat_id = chat.id;
                GHbot.editMessageText(user.id, text, options);
            } catch (error) {
                var errorText = telegramErrorToText(lang, error); 
                GHbot.answerCallbackQuery(user.id, cb.id, {show_alert:true, text:errorText});
            }

        }

        if(cb.data.startsWith("PUNISH_WARN_"))
        {
            var punishment = 1;
            var action = cb.data.split("PUNISH_WARN_")[1].split("?")[0];
            var neededCommand;
            var options = {parse_mode:"HTML"};
            switch (action) {
                case "INC":{neededCommand = "COMMAND_WARN";break;}
                case "DEC":{neededCommand = "COMMAND_UNWARN";break;}
                case "ZERO":{neededCommand = "COMMAND_UNWARN";break;}
            }

            if(!user.perms.commands.includes(neededCommand))
            {
                GHbot.answerCallbackQuery(user.id, cb.id, {show_alert:true, text:l[user.lang].MISSING_PERMISSION});
                return;
            }

            try {
                if(action == "DEC")
                    chat = unwarnUser(chat, target.id);
                if(action == "ZERO")
                    chat = clearWarns(chat, target.id);
                if(action == "INC")
                    punishment = await silentPunish(GHbot, user.id, chat, target.id, punishment);

                var text = genUnpunishText(lang, chat, target, punishment, undefined, db);
                var buttons = genUnpunishButtons(lang, chat, target.id, punishment);

                if(punishment != 1)
                {
                    text = genPunishText(lang, chat, target, punishment, undefined, undefined, db);
                    buttons = [genRevokePunishButton(lang, target.id, punishment)];
                }

                options.reply_markup = {inline_keyboard:buttons};
                options.message_id = cb.message.message_id;
                options.chat_id = chat.id;
                GHbot.editMessageText(user.id, text, options);
            } catch (error) {
                var errorText = telegramErrorToText(lang, error); 
                GHbot.answerCallbackQuery(user.id, cb.id, {show_alert:true, text:errorText});
            }

        }

    } )


}

module.exports = main;
