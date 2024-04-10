var LGHelpTemplate = require("../GHbot.js");
var RM = require("../api/rolesManager.js");
<<<<<<< Updated upstream
var {genPermsReport, IsEqualInsideAnyLanguage, checkCommandPerms, genStaffListMessage} = require ("../api/utils.js");
=======
var {genPermsReport, genMemberInfoText, checkCommandPerms, genStaffListMessage} = require ("../api/utils.js");
>>>>>>> Stashed changes

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    //founder role is automatically set from /reload command
<<<<<<< Updated upstream
    var founderCommands = ["COMMAND_SETTINGS", "COMMAND_PERMS", "COMMAND_STAFF", "COMMAND_RULES", "COMMAND_PIN", "COMMAND_BAN", "COMMAND_MUTE", "COMMAND_KICK", "COMMAND_WARN","COMMAND_DELETE"]
    var founderPerms = RM.newPerms(founderCommands, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    var modPerms = RM.newPerms(["COMMAND_RULES", "COMMAND_PIN", "COMMAND_BAN", "COMMAND_MUTE", "COMMAND_KICK", "COMMAND_WARN","COMMAND_DELETE"], 1, 1, 1, 1, 1, 1, 1, 1);
=======
    var founderCommands = ["COMMAND_SETTINGS", "COMMAND_RULES", "COMMAND_PERMS", "COMMAND_STAFF", "COMMAND_INFO", "COMMAND_PIN", "COMMAND_BAN", "COMMAND_MUTE", "COMMAND_KICK", "COMMAND_WARN","COMMAND_DELETE"]
    var founderPerms = RM.newPerms(founderCommands, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    var modPerms = RM.newPerms(["COMMAND_RULES", "COMMAND_INFO", "COMMAND_PIN", "COMMAND_BAN", "COMMAND_MUTE", "COMMAND_KICK", "COMMAND_WARN","COMMAND_DELETE"], 1, 1, 1, 1, 1, 1, 1, 1);
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
    GHbot.onMessage( (msg, chat, user) => {

        if(!chat.isGroup) return;

        if(!chat.users.hasOwnProperty(user.id))
        {
            chat.users[user.id] = RM.newUser(msg.from);
            db.chats.update(chat);
        }

=======
    GHbot.onMessage( async (msg, chat, user) => {

        if(!chat.isGroup) return;

>>>>>>> Stashed changes
        var command = msg.command;
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

            TGbot.sendMessage(chat.id, genStaffListMessage(chat.lang, chat), options);
        }

<<<<<<< Updated upstream
=======
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_INFO", user.perms, ["info"]))
        {
            var targetUser = user;
            if(msg.reply_to_message)
                targetUser = msg.reply_to_message.from;
    
            var options = {
                parse_mode : "HTML",
                reply_parameters: {message_id:msg.message_id}
            }

            var member = await TGbot.getChatMember(chat.id, targetUser.id);
            TGbot.sendMessage(chat.id, genMemberInfoText(chat.lang, chat, targetUser, member), options);
        }

>>>>>>> Stashed changes
    } )

}

module.exports = main;