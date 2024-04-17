var LGHelpTemplate = require("../GHbot.js");
var RM = require("../api/rolesManager.js");
var TR = require("../api/tagResolver.js");
var {genPermsReport, genMemberInfoText, checkCommandPerms, getUnixTime, LGHUserName, usernameOrFullName} = require ("../api/utils.js");

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    //founder role is automatically set from /reload command
    var founderCommands = ["COMMAND_SETTINGS", "COMMAND_RULES", "COMMAND_PERMS", "COMMAND_STAFF", "COMMAND_INFO", "COMMAND_PIN",
    "COMMAND_BAN", "COMMAND_MUTE", "COMMAND_KICK", "COMMAND_WARN","COMMAND_DELETE",
    "COMMAND_UNBAN", "COMMAND_UNMUTE", "COMMAND_UNWARN",
    "COMMAND_FREE", "COMMAND_HELPER", "COMMAND_CLEANER", "COMMAND_MUTER", "COMMAND_MODERATOR", "COMMAND_COFOUNDER", "COMMAND_ADMINISTRATOR",
    "COMMAND_UNFREE", "COMMAND_UNHELPER", "COMMAND_UNCLEANER", "COMMAND_UNMUTER", "COMMAND_UNMODERATOR", "COMMAND_UNCOFOUNDER", "COMMAND_UNADMINISTRATOR"]
    var founderPerms = RM.newPerms(founderCommands, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    var modCommands = ["COMMAND_RULES", "COMMAND_INFO", "COMMAND_PIN", "COMMAND_BAN", "COMMAND_MUTE", "COMMAND_KICK", "COMMAND_WARN",
    "COMMAND_DELETE","COMMAND_UNBAN", "COMMAND_UNMUTE", "COMMAND_UNWARN",]
    var modPerms = RM.newPerms(modCommands, 1, 1, 1, 1, 1, 1, 1, 1);
    var muterPerms = RM.newPerms(["COMMAND_RULES", "COMMAND_MUTE", "COMMAND_UNMUTE"], 1, 1, 1, 1, 1, 1, 1, 1);
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
        var target = command.target;
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_STAFF", user.perms, ["staff"]))
        {
            var options = {
                parse_mode : "HTML",
                reply_parameters: {message_id:msg.message_id}
            }

            TGbot.sendMessage(chat.id, RM.genStaffListMessage(chat.lang, chat, db), options);
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


        if(checkCommandPerms(command, "COMMAND_PERMS", user.perms, ["perms"]))
        {
            if(!target)
            {
                TGbot.sendMessage(chat.id, l[lang].INVALID_TARGET);
                return;
            }

            var options = {
                parse_mode : "HTML",
                reply_parameters: {message_id:msg.message_id}
            }

            var text = target.name+" "+l[lang].PERMISSIONS+": \n"+
            genPermsReport(chat.lang, target.perms)+"\n\n"+
            "🫧"+l[lang].USER_LEVEL+": "+RM.getUserLevel(chat, target.id);

            TGbot.sendMessage(chat.id, text, options);
        }

        var text = false;
        var options = {parse_mode : "HTML"};
        var toSetRole = false;
        var toUnsetRole = false;

        if( chat.isGroup && checkCommandPerms(command, "COMMAND_FREE", user.perms))
            toSetRole = "free";
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_UNFREE", user.perms))
            toUnsetRole = "free";

        if( chat.isGroup && checkCommandPerms(command, "COMMAND_HELPER", user.perms))
            toSetRole = "helper";
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_UNHELPER", user.perms))
            toUnsetRole = "helper";

        if( chat.isGroup && checkCommandPerms(command, "COMMAND_CLEANER", user.perms))
            toSetRole = "cleaner"
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_UNCLEANER", user.perms))
            toUnsetRole = "cleaner";

        if( chat.isGroup && checkCommandPerms(command, "COMMAND_MUTER", user.perms))
            toSetRole = "muter";
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_UNMUTER", user.perms))
            toUnsetRole = "muter";

        if( chat.isGroup && checkCommandPerms(command, "COMMAND_MODERATOR", user.perms, ["mod"]))
            toSetRole = "moderator";
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_UNMODERATOR", user.perms, ["unmod"]))
            toUnsetRole = "moderator";

        if( chat.isGroup && checkCommandPerms(command, "COMMAND_COFOUNDER", user.perms))
            toSetRole = "cofounder"
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_UNCOFOUNDER", user.perms))
            toUnsetRole = "cofounder";

        if( chat.isGroup && checkCommandPerms(command, "COMMAND_ADMINISTRATOR", user.perms, ["admin"]))
            toSetRole = "admin"
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_UNADMINISTRATOR", user.perms, ["unadmin"]))
            toUnsetRole = "admin";

        //check if user can change a role and if he can apply it to target
        if(toSetRole || toUnsetRole)
        {
            if(!user.perms.roles)
            {
                TGbot.sendMessage(chat.id, l[lang].MISSING_ROLE_PERM)
                return;
            }
            if(!target)
            {
                TGbot.sendMessage(chat.id, l[lang].INVALID_TARGET);
                return;
            }

            var role = toSetRole ? toSetRole : toUnsetRole;

            var userLevel = RM.getUserLevel(chat, user.id);
            var roleLevel = RM.getRoleLevel(role, chat);
            var targetLevel = RM.getUserLevel(chat, target.id);

            if(userLevel < roleLevel+1)
            {
                TGbot.sendMessage(chat.id, l[lang].TOO_LOW_LEVEL_SET_ROLE)
                return;
            }
            if(userLevel < targetLevel)
            {
                TGbot.sendMessage(chat.id, l[lang].TOO_LOW_LEVEL_SET_USER)
                return;
            }

        }
        if(toSetRole)
        {
            if(RM.getUserRoles(chat, user.id).includes(toSetRole))
            {
                TGbot.sendMessage(chat.id, l[lang].ALREADY_IN_ROLE, options);
                return;
            }

            var oldUserLevel = RM.getUserLevel(chat, target.id);
            var oldPerms = JSON.stringify(target.perms);
            RM.setRole(chat, target.id, toSetRole);

            //check if this new role is useless to user permissions
            var newPerms = JSON.stringify(RM.sumUserPerms(chat, target.id));
            var newUserLevel = RM.getUserLevel(chat, target.id);
            if(config.preventSetUselessRoles && oldPerms == newPerms && oldUserLevel == newUserLevel)
            {
                RM.unsetRole(chat, target.id, toSetRole);
                TGbot.sendMessage(chat.id, l[lang].USELESS_ROLE);
                return;
            }

            text=target.name+" "+l[lang].HAS_BEEN_MADE+" "+RM.getFullRoleName(toSetRole, lang, chat);
            TGbot.sendMessage(chat.id, text, options);
        }
        if(toUnsetRole)
        {
            if(!RM.getUserRoles(chat, target.id).includes(toUnsetRole))
            {
                TGbot.sendMessage(chat.id, l[lang].NOT_IN_ROLE, options);
                return;
            }

            RM.unsetRole(chat, target.id, toUnsetRole);
            text=target.name+" "+l[lang].IS_NO_LONGER+" "+RM.getFullRoleName(toUnsetRole, lang, chat);
            TGbot.sendMessage(chat.id, text, options);
        }

    } )

}

module.exports = main;
