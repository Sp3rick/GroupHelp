const { prototype } = require("node-telegram-bot-api");
var LGHelpTemplate = require("../GHbot.js");
var RM = require("../api/rolesManager.js");
var TR = require("../api/tagResolver.js");
var {genPermsReport, genMemberInfoText, checkCommandPerms, getUnixTime, handleTelegramGroupError, IsEqualInsideAnyLanguage, getAdmins, code, genGroupAdminPermsKeyboard, bold, genGroupAdminPermsText, telegramErrorToText, isAdminOfChat, hasAdminPermission} = require ("../api/utils.js");
var removeAdminOpts = {can_manage_chat:false,can_delete_messages:false,can_manage_video_chats:false,can_restrict_members:false,
    can_promote_members:false,can_change_info:false,can_invite_users:false,can_post_stories:false,can_edit_stories:false,
    can_delete_stories:false,can_pin_messages:false,can_manage_topics:false};

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
    "COMMAND_UNFREE", "COMMAND_UNHELPER", "COMMAND_UNCLEANER", "COMMAND_UNMUTER", "COMMAND_UNMODERATOR", "COMMAND_UNCOFOUNDER", "COMMAND_UNADMINISTRATOR", "COMMAND_TITLE", "COMMAND_UNTITLE"]
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
        if(IsEqualInsideAnyLanguage(command.name, "COMMAND_RELOAD"))
        {
            var options = {
                parse_mode : "HTML",
                reply_parameters: {message_id:msg.message_id}
            }
            
            var text = "";

            //TODO: add a token based bot complete restart

            var adminList = await getAdmins(TGbot, chat.id);
            chat = RM.reloadAdmins(chat, adminList);
            db.chats.update(chat);

            chat.admins.forEach((admin)=>{if(admin.user.id==TGbot.me.id){
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

            TGbot.sendMessage(chat.id, text, options);
        }

        if(checkCommandPerms(command, "COMMAND_STAFF", user.perms, ["staff"]))
        {
            var options = {
                parse_mode : "HTML",
                reply_parameters: {message_id:msg.message_id}
            }

            TGbot.sendMessage(chat.id, RM.genStaffListMessage(chat.lang, chat, db), options);
        }

        if(checkCommandPerms(command, "COMMAND_INFO", user.perms, ["info"]))
        {    
            var options = {
                parse_mode : "HTML",
                reply_parameters: {message_id:msg.message_id},
                reply_markup: {inline_keyboard:[]}
            }

            var isUserAdmin = chat.admins.some((admin)=>{return admin.user.id == target.id});
            if(isUserAdmin)
                options.reply_markup.inline_keyboard.push([{text:l[lang].ADMIN_PERMS_BUTTON,callback_data:"ADMINPERM_MENU#"+target.id}])

            if(msg.reply_to_message)
            {
                options.reply_parameters.message_id = msg.reply_to_message.message_id;
            }      

            try {
                var member = await TGbot.getChatMember(chat.id, target.id);
                var memberAndUser = Object.assign({}, member.user, chat.users[target.id]);
                TGbot.sendMessage(chat.id, genMemberInfoText(chat.lang, chat, memberAndUser, member), options);
            } catch (error) {
                handleTelegramGroupError(TGbot, chat.id, lang, error);
            }
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
                reply_parameters: {message_id:msg.message_id},
                reply_markup: {inline_keyboard:[]}
            }

            var isUserAdmin = chat.admins.some((admin)=>{return admin.user.id == target.id});
            if(isUserAdmin)
                options.reply_markup.inline_keyboard.push([{text:l[lang].ADMIN_PERMS_BUTTON,callback_data:"ADMINPERM_MENU#"+target.id}])

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
        {
            if(!target)
            {
                TGbot.sendMessage(chat.id, l[lang].INVALID_TARGET);
                return;
            }

            try {
                
                await TGbot.promoteChatMember(chat.id, target.id, {can_manage_chat:true});
                if(command.args.length > 0)
                {
                    var title = command.args.substring(0,16);
                    try {
                        await TGbot.setChatAdministratorCustomTitle(chat.id, target.id, title);
                    } catch (error) {
                        handleTelegramGroupError(TGbot, chat.id, lang, error);
                    }
                }

                var adminList = await getAdmins(TGbot, chat.id);
                chat = RM.reloadAdmins(chat, adminList);
                db.chats.update(chat);

                var text = target.name+" "+bold(l[lang].HAS_BEEN_PROMOTED+"!");
                var buttons = [[{text:l[lang].ADMIN_PERMS_BUTTON, callback_data: "ADMINPERM_MENU#"+target.id}]];
                TGbot.sendMessage(chat.id, text, {parse_mode:"HTML", reply_markup:{inline_keyboard:buttons}});

            } catch (error) {
                handleTelegramGroupError(TGbot, chat.id, lang, error);
            }

        }
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_UNADMINISTRATOR", user.perms, ["unadmin"]))
        {
            if(!target)
            {
                TGbot.sendMessage(chat.id, l[lang].INVALID_TARGET);
                return;
            }

            try {
                await TGbot.promoteChatMember(chat.id, target.id, removeAdminOpts)

                var adminList = await getAdmins(TGbot, chat.id);
                chat = RM.reloadAdmins(chat, adminList);
                db.chats.update(chat);

                var text = target.name+" "+l[lang].IS_NO_LONGER+" 👮"+l[lang].ADMINISTRATOR;
                TGbot.sendMessage(chat.id, text, {parse_mode:"HTML"});
            } catch (error) {
                handleTelegramGroupError(TGbot, chat.id, lang, error);
            }

        }
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_TITLE", user.perms))
        {
            if(!target)
            {
                TGbot.sendMessage(chat.id, l[lang].INVALID_TARGET);
                return;
            }

            var title = command.args.length > 0 ? command.args.substring(0,16) : "";
            try {
                await TGbot.setChatAdministratorCustomTitle(chat.id, target.id, title);

                var adminList = await getAdmins(TGbot, chat.id);
                chat = RM.reloadAdmins(chat, adminList);
                db.chats.update(chat);

                var newTitle = chat.users[target.id].title;
                var text = target.name+bold(l[lang].TITLE_CHANGED_TO)+" "+code(newTitle);
                var changeTitleOpts = {parse_mode:"HTML", reply_markup: {inline_keyboard:[[{text:l[lang].ADMIN_PERMS_BUTTON,callback_data:"ADMINPERM_MENU#"+target.id}]]}};
                TGbot.sendMessage(chat.id, text, changeTitleOpts)
            } catch (error) {
                handleTelegramGroupError(TGbot, chat.id, lang, error);
            }

        }
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_UNTITLE", user.perms))
        {
            if(!target)
            {
                TGbot.sendMessage(chat.id, l[lang].INVALID_TARGET);
                return;
            }

            try {
                await TGbot.setChatAdministratorCustomTitle(chat.id, target.id, "");

                var adminList = await getAdmins(TGbot, chat.id);
                chat = RM.reloadAdmins(chat, adminList);
                db.chats.update(chat);

                var text = target.name+bold(l[lang].TITLE_REMOVED);
                TGbot.sendMessage(chat.id, text, {parse_mode:"HTML"});
            } catch (error) {
                handleTelegramGroupError(TGbot, chat.id, lang, error);
            }

        }

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




        //security guards
        if( !(user.waitingReply && user.waitingReplyType.startsWith("ADMINTITLE")) ) return;
        var targetUserId = user.waitingReplyType.split("#")[1];
        if( !user.perms.commands.includes("COMMAND_ADMINISTRATOR") && !user.perms.commands.includes("COMMAND_TITLE") ) return;

        var title = msg.text.length > 0 ? msg.text.substring(0,16) : "";
        try {
            await TGbot.setChatAdministratorCustomTitle(chat.id, user.waitingReplyTarget.id, title);

            var adminList = await getAdmins(TGbot, chat.id);
            chat = RM.reloadAdmins(chat, adminList);
            db.chats.update(chat);

            var newTitle = chat.users[targetUserId].title;
            var text = user.waitingReplyTarget.name+bold(l[lang].TITLE_CHANGED_TO)+" "+code(newTitle);
            var changeTitleOpts = {parse_mode:"HTML", reply_markup: {inline_keyboard:[[{text:l[lang].ADMIN_PERMS_BUTTON,callback_data:"ADMINPERM_MENU#"+user.waitingReplyTarget.id}]]}};
            TGbot.sendMessage(chat.id, text, changeTitleOpts)

            user.waitingReply = false;
            db.users.update(user);
        } catch (error) {
            handleTelegramGroupError(TGbot, chat.id, lang, error);
        }

    } )

    GHbot.onCallback( async (cb, chat, user) => {

        //security guards
        if( !cb.data.startsWith("ADMINPERM_") && !cb.data.startsWith("ADMINTITLE")) return;
        if(!cb.target)
        {
            console.log("LGH Error: ADMINPERM_ target has not been identified");
            return;
        }

        var lang = chat.lang;
        var target = cb.target;
        var msg = cb.message;

        var perm = false;
        if(cb.data.startsWith("ADMINPERM_ANONYMOUS"))
            perm = "is_anonymous";
        if(cb.data.startsWith("ADMINPERM_DELETE"))
            perm = "can_delete_messages";
        if(cb.data.startsWith("ADMINPERM_VIDEOCHAT"))
            perm = "can_manage_video_chats";
        if(cb.data.startsWith("ADMINPERM_RESTRICT"))
            perm = "can_restrict_members";
        if(cb.data.startsWith("ADMINPERM_PROMOTE"))
            perm = "can_promote_members";
        if(cb.data.startsWith("ADMINPERM_MODIFY"))
            perm = "can_change_info";
        if(cb.data.startsWith("ADMINPERM_INVITE"))
            perm = "can_invite_users";
        if(cb.data.startsWith("ADMINPERM_STORIES"))
            perm = "can_post_stories";
        if(cb.data.startsWith("ADMINPERM_STORYEDIT"))
            perm = "can_edit_stories";
        if(cb.data.startsWith("ADMINPERM_STORYDEL"))
            perm = "can_delete_stories";
        if(cb.data.startsWith("ADMINPERM_PIN"))
            perm = "can_pin_messages";
        if(cb.data.startsWith("ADMINPERM_TOPICS"))
            perm = "can_manage_topics";
        if(cb.data.startsWith("ADMINPERM_"))
        {
            //user still admin check
            var admin = chat.admins.filter((admin)=>{return admin.user.id == target.id})[0];
            if(!admin)
            {
                TGbot.editMessageText(l[lang].USER_NO_MORE_ADMIN, {chat_id:chat.id, message_id:cb.message.message_id});
                return;
            }

            //check if perm is already enabled due to base chat perms
            var chatPerms = (await TGbot.getChat(chat.id)).permissions;
            var permIsActiveByDefault = perm ? Object.keys(chatPerms).some((gPerm)=>{return gPerm == perm && chatPerms[gPerm]}) : false;
            if(permIsActiveByDefault)
            {
                TGbot.answerCallbackQuery(cb.id, {text: l[lang].PERM_ACTIVE_BY_DEFAULT,show_alert:true});
                return;
            }

            if(perm)
            {
                var oldPermState = (admin.hasOwnProperty(perm) && admin[perm]);

                //check if the user that's setting as active this permission has this permission
                if(!oldPermState == true && !hasAdminPermission(chat.admins, user.id, perm))
                {
                    TGbot.answerCallbackQuery(cb.id, {text:l[lang].MISSING_ADMIN_PERMISSION, show_alert:true});
                    return;
                }

                admin[perm] = !oldPermState;
                var promoteOpts = JSON.parse(JSON.stringify(admin));
                delete promoteOpts.status;
                delete promoteOpts.user;
                try {
                    await TGbot.promoteChatMember(chat.id, target.id, promoteOpts);

                    var adminList = await getAdmins(TGbot, chat.id);
                    chat = RM.reloadAdmins(chat, adminList);
                    db.chats.update(chat);
                } catch (error) {
                    admin[perm] = oldPermState;
                    var text = telegramErrorToText(lang, error);
                    TGbot.answerCallbackQuery(cb.id, {text:text, show_alert:true});
                }
            }

            //for accurancy we set true all permissions that's already on for every user in group, telegram is dumb and do not that by default
            var displayAdmin = JSON.parse(JSON.stringify(admin));
            Object.keys(chatPerms).forEach((gPerm)=>{if(chatPerms[gPerm])displayAdmin[gPerm]=true;});

            var options = {
                chat_id : chat.id,
                message_id : cb.message.message_id,
                parse_mode : "HTML",
                reply_markup : {inline_keyboard:genGroupAdminPermsKeyboard(lang, displayAdmin, chat.is_forum)}
            }
            var text = genGroupAdminPermsText(lang, chat, target.id);
            TGbot.editMessageText(text, options);
        }

        if(cb.data.startsWith("ADMINTITLE"))
        {
            user.waitingReply = true;
            user.waitingReplyType = "ADMINTITLE#"+target.id;
            db.users.update(user);
            TGbot.editMessageText( l[lang].SEND_NEW_TITLE, {message_id : msg.message_id, chat_id : chat.id, parse_mode : "HTML",
                reply_markup : {inline_keyboard :[[{text: l[lang].CANCEL_BUTTON, callback_data: "ADMINPERM_MENU#"+target.id}]]} }
            )
        }

    })

    TGbot.on("chat_member", async (e) => {
        
        var wasAdmin = e.old_chat_member.status == "administrator";
        var wasFounder = e.old_chat_member.status == "creator";

        var isAdmin = e.new_chat_member.status == "administrator";
        var isFounder = e.new_chat_member.status == "creator";

        if(!wasAdmin && !wasFounder && !isAdmin && !isFounder) return;

        var adminList = await getAdmins(TGbot, chat.id);
        var chat = RM.reloadAdmins(chat, adminList);
        db.chats.update(chat);

    })

}

module.exports = main;
