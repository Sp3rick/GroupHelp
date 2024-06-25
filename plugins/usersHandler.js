var LGHelpTemplate = require("../GHbot.js");
var RM = require("../api/rolesManager.js");
var {genPermsReport, genMemberInfoText, getUnixTime, handleTelegramGroupError, isAdminOfChat, isChatAllowed, sendCommandReply, telegramErrorToText} = require ("../api/utils.js");
var { silentPunish } = require("../api/punishment.js");
const { getAdmins } = require("../api/tagResolver.js");
const GHCommand = require("../api/LGHCommand.js");

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    //founder role is automatically set from /reload command
    var founderCommands = ["COMMAND_SETTINGS", "COMMAND_PIN",
    "COMMAND_BAN", "COMMAND_MUTE", "COMMAND_KICK", "COMMAND_WARN","COMMAND_DELETE",
    "COMMAND_UNBAN", "COMMAND_UNMUTE", "COMMAND_UNWARN",
    "COMMAND_FREE", "COMMAND_HELPER", "COMMAND_CLEANER", "COMMAND_MUTER", "COMMAND_MODERATOR", "COMMAND_COFOUNDER", "COMMAND_ADMINISTRATOR",
    "COMMAND_UNFREE", "COMMAND_UNHELPER", "COMMAND_UNCLEANER", "COMMAND_UNMUTER", "COMMAND_UNMODERATOR", "COMMAND_UNCOFOUNDER", "COMMAND_UNADMINISTRATOR",
    "COMMAND_TITLE", "COMMAND_UNTITLE", "COMMAND_FORGOT"]
    var founderPerms = RM.newPerms(founderCommands, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    var modCommands = ["COMMAND_RULES", "COMMAND_INFO", "COMMAND_PIN", "COMMAND_BAN", "COMMAND_MUTE", "COMMAND_KICK", "COMMAND_WARN",
    "COMMAND_DELETE","COMMAND_UNBAN", "COMMAND_UNMUTE", "COMMAND_UNWARN",]
    var modPerms = RM.newPerms(modCommands, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);
    var muterPerms = RM.newPerms(["COMMAND_RULES", "COMMAND_MUTE", "COMMAND_UNMUTE"]);
    var cleanerPerms = RM.newPerms(["COMMAND_RULES", "COMMAND_DELETE"]);
    var helperPerms = RM.newPerms(["COMMAND_RULES", "COMMAND_INFO"]);
    var freePerms = RM.newPerms([], 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);

    global.roles = {
        founder : RM.newRole("FOUNDER", "👑", 100, founderPerms),
        cofounder : RM.newRole("COFOUNDER", "⚜️", 90, founderPerms),
        moderator : RM.newRole("MODERATOR", "👷🏻‍♂️", 60, modPerms),
        muter : RM.newRole("MUTER", "🙊", 40, muterPerms),
        cleaner : RM.newRole("CLEANER", "🛃", 20, cleanerPerms),
        helper : RM.newRole("HELPER", "⛑", 0, helperPerms),
        free : RM.newRole("FREE", "🔓", 0, freePerms),
    }

    var commandsList = ["COMMAND_RELOAD", "COMMAND_STAFF", "COMMAND_INFO", "COMMAND_ME", "COMMAND_PERMS", "COMMAND_FORGOT"];
    GHCommand.registerCommands(commandsList, async (msg, chat, user, private, lang, key, keyLang) => {
        var command = msg.command;
        var lang = msg.chat.lang;
        var target = msg.target;

        if( key == "COMMAND_RELOAD")
        {
            var options = {
                parse_mode : "HTML",
                reply_parameters: {message_id:msg.message_id}
            }
            
            var text = "";

            //TODO: add a token based bot complete restart

            var adminList = await getAdmins(TGbot, msg.chat.id, db);
            msg.chat = RM.reloadAdmins(msg.chat, adminList);
            db.chats.update(msg.chat);

            msg.chat.admins.forEach((admin)=>{if(admin.user.id==TGbot.me.id){
                if(!admin.can_delete_messages)
                    text+=l[lang].CANT_DELETE+"\n";
                if(!admin.can_pin_messages)
                    text+=l[lang].CANT_PIN+"\n";
                if(!admin.can_restrict_members)
                    text+=l[lang].CANT_BAN+"\n";
                if(!admin.can_promote_members)
                    text+=l[lang].CANT_PROMOTE+"\n";
                if(!admin.can_invite_users)
                    text+=l[lang].CANT_INVITE+"\n";
            }})

            text+="✅ "+l[lang].ADMINS_UPDATED;

            GHbot.sendMessage(user.id, msg.chat.id, text, options);
        }

        if(key == "COMMAND_STAFF")
        {
            var options = {
                parse_mode : "HTML",
                reply_parameters: {chat_id:msg.chat.id, message_id: msg.message_id, allow_sending_without_reply:true},
                disable_notification : true //TODO: bot still send notification sto staffers, to-fix
            }

            if(msg.reply_to_message)
            {
                options.reply_parameters.message_id = msg.reply_to_message.message_id;
                options.reply_parameters.chat_id = msg.chat.id;
            } 

            var func = (id) => {return GHbot.sendMessage(user.id, id, RM.genStaffListMessage(msg.chat.lang, msg.chat, db), options)};
            sendCommandReply(private, lang, GHbot, user.id, msg.chat.id, func);
        }

        if(key == "COMMAND_INFO")
        {    
            var options = {
                parse_mode : "HTML",
                reply_parameters: {chat_id:msg.chat.id, message_id: msg.message_id, allow_sending_without_reply:true},
                reply_markup: {inline_keyboard:[]}
            }

            var isUserAdmin = msg.chat.admins.some((admin)=>{return admin.user.id == target.id});
            if(isUserAdmin)
                options.reply_markup.inline_keyboard.push([{text:l[lang].ADMIN_PERMS_BUTTON,callback_data:"ADMINPERM_MENU:"+msg.chat.id+"?"+target.id}])

            if(msg.reply_to_message)
            {
                options.reply_parameters.message_id = msg.reply_to_message.message_id;
                options.reply_parameters.chat_id = msg.chat.id;
            }

            try {
                var member = await TGbot.getChatMember(msg.chat.id, target.id);
                var memberAndUser = Object.assign({}, member.user, msg.chat.users[target.id]);
                var func = (id) => {return GHbot.sendMessage(user.id, id, genMemberInfoText(msg.chat.lang, msg.chat, memberAndUser, member), options)};
                sendCommandReply(private, lang, GHbot, user.id, msg.chat.id, func);
            } catch (error) {
                handleTelegramGroupError(GHbot, user.id, msg.chat.id, lang, error);
            }
        }

        if(key == "COMMAND_ME")
        {
            var options = {
                parse_mode : "HTML",
                reply_parameters: {chat_id:msg.chat.id, message_id: msg.message_id, allow_sending_without_reply:true},
                reply_markup: {inline_keyboard:[]}
            }

            if(msg.reply_to_message)
            {
                options.reply_parameters.message_id = msg.reply_to_message.message_id;
                options.reply_parameters.chat_id = msg.chat.id;
            }   

            try {
                var member = await TGbot.getChatMember(msg.chat.id, user.id);
                var memberAndUser = Object.assign({}, member.user, msg.chat.users[user.id]);
                
                var func = (id) => {return GHbot.sendMessage(user.id, id, genMemberInfoText(msg.chat.lang, msg.chat, memberAndUser, member), options)};
                await sendCommandReply(private, lang, GHbot, user.id, msg.chat.id, func);
            } catch (error) {
                handleTelegramGroupError(GHbot, user.id, msg.chat.id, lang, error);
            }
        }

        if(key == "COMMAND_PERMS")
        {
            if(!target)
            {
                GHbot.sendMessage(user.id, msg.chat.id, l[lang].INVALID_TARGET);
                return;
            }

            var options = {
                parse_mode : "HTML",
                reply_parameters: {chat_id:msg.chat.id, message_id: msg.message_id, allow_sending_without_reply:true},
                reply_markup: {inline_keyboard:[]}
            }

            if(msg.reply_to_message)
            {
                options.reply_parameters.message_id = msg.reply_to_message.message_id;
                options.reply_parameters.chat_id = msg.chat.id;
            } 

            var isUserAdmin = msg.chat.admins.some((admin)=>{return admin.user.id == target.id});
            if(isUserAdmin)
                options.reply_markup.inline_keyboard.push([{text:l[lang].ADMIN_PERMS_BUTTON,callback_data:"ADMINPERM_MENU:"+msg.chat.id+"?"+target.id}])
            options.reply_markup.inline_keyboard.push([{text:l[lang].COMMAND_PERMS_BUTTON2,callback_data:"S_#CMDPERMS_MENU:"+msg.chat.id}]);

            var text = target.name+" "+l[lang].PERMISSIONS+": \n"+
            genPermsReport(msg.chat.lang, target.perms)+"\n\n"+
            "🫧"+l[lang].USER_LEVEL+": "+RM.getUserLevel(msg.chat, target.id);


            var func = (id) => {return GHbot.sendMessage(user.id, id, text, options)};
            sendCommandReply(private, lang, GHbot, user.id, msg.chat.id, func);
        }

        if(key == "COMMAND_FORGOT")
        {
            if(!target)
            {
                GHbot.sendMessage(user.id, msg.chat.id, l[lang].INVALID_TARGET);
                return;
            }

            var options = {
                parse_mode : "HTML",
                reply_parameters: {message_id:msg.message_id},
                reply_markup: {inline_keyboard:[[
                    {text:l[lang].CANCEL_BUTTON,callback_data:"S_CLOSE_BUTTON"},
                    {text:l[lang].CONFIRM_BUTTON,callback_data:"FORGOT?"+target.id}
                ]]}
            }

            var text = l[lang].CONFIRM_FORGOT.replaceAll("{user}",target.name)

            GHbot.sendMessage(user.id, msg.chat.id, text, options);
        }
    })

    GHbot.onMessage( async (msg, chat, user) => {

        if(!msg.chat.isGroup) return;
        if(!msg.waitingReply) return;
        if(!msg.chat.users[user.id].firtJoin)
        {
            msg.chat.users[user.id].firtJoin = getUnixTime();
            db.chats.update(msg.chat);
        }

    } )

    GHbot.onCallback( async (cb, chat, user) => {

        var lang = chat.lang;
        var target = cb.target;
        var msg = cb.message;

        if(cb.data.startsWith("FORGOT") && target && chat.isGroup)
        {
            if(!user.perms.commands.includes("COMMAND_FORGOT"))
            {
                GHbot.answerCallbackQuery(user.id, cb.id, {text:l[lang].MISSING_PERMISSION, show_alert:true})
                return;
            }
            if(isAdminOfChat(chat, target.id))
            {
                GHbot.answerCallbackQuery(user.id, cb.id, {text:l[lang].USER_IS_ADMIN, show_alert:true})
                return;
            }
            try {
                await silentPunish(GHbot, user.id, chat, target.id, 2); //kick
            } catch (error) {
                var errText = telegramErrorToText(user.lang, error);
                GHbot.answerCallbackQuery(user.id, cb.id, {text:errText, show_alert:true})
                return;
            }

            chat = RM.forgotUser(chat, target.id);
            db.chats.update(chat);

            GHbot.editMessageText(user.id, l[lang].SUCCESSFULL_FORGOT, {chat_id:cb.chat.id,message_id:msg.message_id});
        }

    })

    //handle promotions or unpromotions
    TGbot.on("chat_member", async (e) => {

        if(!isChatAllowed(config, e.chat.id)) return;

        if(!db.chats.exhist(e.chat.id)) return;

        var chat = db.chats.get(e.chat.id);

        var adminList = await getAdmins(TGbot, chat.id, db);
        chat = RM.reloadAdmins(chat, adminList);
        db.chats.update(chat);

    })

}

module.exports = main;
