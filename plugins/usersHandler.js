var LGHelpTemplate = require("../GHbot.js");
var RM = require("../api/rolesManager.js");
var TR = require("../api/tagResolver.js");
var {genPermsReport, genMemberInfoText, checkCommandPerms, getUnixTime, LGHUserName} = require ("../api/utils.js");

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    //founder role is automatically set from /reload command
    var founderCommands = ["COMMAND_SETTINGS", "COMMAND_RULES", "COMMAND_PERMS", "COMMAND_STAFF", "COMMAND_INFO", "COMMAND_PIN",
    "COMMAND_BAN", "COMMAND_MUTE", "COMMAND_KICK", "COMMAND_WARN","COMMAND_DELETE",
    "COMMAND_FREE", "COMMAND_HELPER", "COMMAND_CLEANER", "COMMAND_MUTER", "COMMAND_MODERATOR", "COMMAND_COFOUNDER", "COMMAND_ADMIN",
    "COMMAND_UNFREE", "COMMAND_UNHELPER", "COMMAND_UNCLEANER", "COMMAND_UNMUTER", "COMMAND_UNMODERATOR", "COMMAND_UNCOFOUNDER", "COMMAND_UNADMIN"]
    var founderPerms = RM.newPerms(founderCommands, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    var modPerms = RM.newPerms(["COMMAND_RULES", "COMMAND_INFO", "COMMAND_PIN", "COMMAND_BAN", "COMMAND_MUTE", "COMMAND_KICK", "COMMAND_WARN","COMMAND_DELETE"], 1, 1, 1, 1, 1, 1, 1, 1);
    var muterPerms = RM.newPerms(["COMMAND_RULES", "COMMAND_MUTE"], 1, 1, 1, 1, 1, 1, 1, 1);
    var cleanerPerms = RM.newPerms(["COMMAND_RULES", "COMMAND_DELETE"]);
    var helperPerms = RM.newPerms(["COMMAND_RULES"]);
    var freePerms = RM.newPerms([], 1, 1, 1, 1, 1, 1, 1, 1);

    global.roles = {
        founder : RM.newRole("FOUNDER", "👑", 100, founderPerms),
        cofounder : RM.newRole("COFOUNDER", "⚜️", 90, founderPerms),
        moderator : RM.newRole("MODERATOR", "👷🏻‍♂️", 60, modPerms),
        muter : RM.newRole("MUTER", "🙊", 40, muterPerms),
        cleaner : RM.newRole("CLEANER", "🛃", 20, cleanerPerms),
        helper : RM.newRole("HELPER", "⛑", 0, helperPerms),
        free : RM.newRole("FREE", "🔓", 0, freePerms),
    }

    GHbot.onMessage( async (msg, chat, user) => {

        if(!chat.isGroup) return;

        if(!chat.users[user.id].firtJoin)
        {
            chat.users[user.id].firtJoin = getUnixTime();
            db.chats.update(chat);
        }

        var command = msg.command;
        var lang = chat.lang;
        if(checkCommandPerms(command, "COMMAND_PERMS", user.perms, ["perms"]))
        {
            if(!msg.hasOwnProperty("reply_to_message")) return;

            var target = msg.reply_to_message.from;
            var targetPerms = RM.sumUserPerms(chat, target.id);

            var options = {
                parse_mode : "HTML",
                reply_parameters: {message_id:msg.message_id}
            }

            var text = target.first_name+" permissions: \n"+genPermsReport(chat.lang, targetPerms);

            TGbot.sendMessage(chat.id, text, options);
        }

        if( chat.isGroup && checkCommandPerms(command, "COMMAND_STAFF", user.perms, ["staff"]))
        {
            var options = {
                parse_mode : "HTML",
                reply_parameters: {message_id:msg.message_id}
            }

            TGbot.sendMessage(chat.id, RM.genStaffListMessage(chat.lang, chat), options);
        }

        if( chat.isGroup && checkCommandPerms(command, "COMMAND_INFO", user.perms, ["info"]))
        {    
            var options = {
                parse_mode : "HTML",
                reply_parameters: {message_id:msg.message_id}
            }

            var targetUser = user;
            if(msg.reply_to_message)
            {
                targetUser = msg.reply_to_message.from;
                options.reply_parameters.message_id = msg.reply_to_message.message_id;
            }      

            var member = await TGbot.getChatMember(chat.id, targetUser.id);
            TGbot.sendMessage(chat.id, genMemberInfoText(chat.lang, chat, targetUser, member), options);
        }


        //set and unset roles
        var targetUserId = TR.getCommandTargetUserId(msg)
        if(!targetUserId || !user.perms.roles) return

        var text = false;
        var prefix = LGHUserName(user)+" ";
        var options = {parse_mode : "HTML"};
        var toSetRole = false;
        var toUnsetRole = false;

        if( chat.isGroup && checkCommandPerms(command, "COMMAND_FREE", user.perms) && user.perms.roles)
            toSetRole = "free";
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_UNFREE", user.perms) && user.perms.roles)
            toUnsetRole = "free";

        if( chat.isGroup && checkCommandPerms(command, "COMMAND_HELPER", user.perms))
            toSetRole = "helper";
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_UNHELPER", user.perms) && user.perms.roles)
            toUnsetRole = "helper";

        if( chat.isGroup && checkCommandPerms(command, "COMMAND_CLEANER", user.perms))
            toSetRole = "cleaner"
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_UNCLEANER", user.perms) && user.perms.roles)
            toUnsetRole = "cleaner";

        if( chat.isGroup && checkCommandPerms(command, "COMMAND_MUTER", user.perms))
            toSetRole = "muter";
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_UNMUTER", user.perms) && user.perms.roles)
            toUnsetRole = "muter";

        if( chat.isGroup && checkCommandPerms(command, "COMMAND_MODERATOR", user.perms, ["mod"]))
            toSetRole = "moderator";
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_UNMODERATOR", user.perms, ["unmod"]) && user.perms.roles)
            toUnsetRole = "moderator";

        if( chat.isGroup && checkCommandPerms(command, "COMMAND_COFOUNDER", user.perms))
            toSetRole = "cofounder"
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_UNCOFOUNDER", user.perms) && user.perms.roles)
            toUnsetRole = "cofounder";

        if(toSetRole != false)
        {
            if(RM.getUserRoles(chat, user.id).includes(toSetRole))
            {
                TGbot.sendMessage(chat.id, l[lang].ALREADY_IN_ROLE, options);
                return;
            }

            RM.setRole(chat, targetUserId, toSetRole);
            text=prefix+l[lang].HAS_BEEN_MADE+" "+RM.getFullRoleName(toSetRole, lang, chat);
            TGbot.sendMessage(chat.id, text, options);
        }

        if(toUnsetRole != false)
        {
            if(!RM.getUserRoles(chat, user.id).includes(toUnsetRole))
            {
                TGbot.sendMessage(chat.id, l[lang].NOT_IN_ROLE, options);
                return;
            }

            RM.unsetRole(chat, user.id, toUnsetRole);
            text=prefix+l[lang].IS_NO_LONGER+" "+RM.getFullRoleName(toUnsetRole, lang, chat);
            TGbot.sendMessage(chat.id, text, options);
        }

    } )

}

module.exports = main;
