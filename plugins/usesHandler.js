var LGHelpTemplate = require("../GHbot.js");
var RM = require("../api/rolesManager.js");

function main(args)
{

    var {GHbot, TGbot, db, config} = new LGHelpTemplate(args);
    l = global.LGHLangs; //importing langs object

    var modPerms = RM.newPerms(["COMMAND_RULES", "COMMAND_BAN", "COMMAND_MUTE", "COMMAND_WARN","COMMAND_DEL"], 1, 1, 1, 1, 1, 1, 1, 1);
    var muterPerms = RM.newPerms(["COMMAND_RULES", "COMMAND_MUTE"], 1, 1, 1, 1, 1, 1, 1, 1);
    var cleanerPerms = RM.newPerms(["COMMAND_RULES", "COMMAND_DEL"]);
    var helperPerms = RM.newPerms(["COMMAND_RULES"]);
    var freePerms = RM.newPerms([], 1, 1, 1, 1, 1, 1, 1, 1)

    global.roles = {
        moderator : RM.newRole("MODERATOR", modPerms),
        muter : RM.newRole("MUTER", muterPerms),
        cleaner : RM.newRole("CLEANER", cleanerPerms),
        helper : RM.newRole("HELPER", helperPerms),
        free : RM.newRole("FREE", freePerms),
    }

    GHbot.on( "message", (msg, chat, user) => {

        if(!chat.isGroup) return;

        if(!chat.users.hasOwnProperty(user.id))
        {
            chat.users[user.id] = RM.newUser();
            db.chats.update(chat);
        } 

    } )

}

module.exports = main;
