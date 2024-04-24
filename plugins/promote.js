var LGHelpTemplate = require("../GHbot.js");
var RM = require("../api/rolesManager.js");
var {checkCommandPerms, handleTelegramGroupError, getAdmins, code, genGroupAdminPermsKeyboard, bold, genGroupAdminPermsText, telegramErrorToText, hasAdminPermission, isAdminOfChat} = require ("../api/utils.js");
var removeAdminOpts = {can_manage_chat:false,can_delete_messages:false,can_manage_video_chats:false,can_restrict_members:false,
    can_promote_members:false,can_change_info:false,can_invite_users:false,can_post_stories:false,can_edit_stories:false,
    can_delete_stories:false,can_pin_messages:false,can_manage_topics:false};

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    GHbot.onMessage( async (msg, chat, user) => {

        if(!chat.isGroup) return;

        var command = msg.command;
        var lang = chat.lang;
        var target = command.target;
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
                GHbot.sendMessage(user.id, chat.id, l[lang].INVALID_TARGET);
                return;
            }
            if(target.id == user.id)
            {
                GHbot.sendMessage(user.id, chat.id, l[lang].CANT_CHANGE_YOUR_PERMS);
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
                        handleTelegramGroupError(GHbot, user.id, chat.id, lang, error);
                    }
                }

                var adminList = await getAdmins(TGbot, chat.id);
                chat = RM.reloadAdmins(chat, adminList);
                db.chats.update(chat);

                var text = target.name+" "+bold(l[lang].HAS_BEEN_PROMOTED+"!");
                var buttons = [[{text:l[lang].ADMIN_PERMS_BUTTON, callback_data: "ADMINPERM_MENU?"+target.id}]];
                GHbot.sendMessage(user.id, chat.id, text, {parse_mode:"HTML", reply_markup:{inline_keyboard:buttons}});

            } catch (error) {
                handleTelegramGroupError(GHbot, user.id, user.id, chat.id, lang, error);
            }

        }
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_UNADMINISTRATOR", user.perms, ["unadmin"]))
        {
            if(!target)
            {
                GHbot.sendMessage(user.id, chat.id, l[lang].INVALID_TARGET);
                return;
            }
            if(target.id == user.id)
            {
                GHbot.sendMessage(user.id, chat.id, l[lang].CANT_CHANGE_YOUR_PERMS);
                return;
            }

            try {
                await TGbot.promoteChatMember(chat.id, target.id, removeAdminOpts)

                var adminList = await getAdmins(TGbot, chat.id);
                chat = RM.reloadAdmins(chat, adminList);
                db.chats.update(chat);

                var text = target.name+" "+l[lang].IS_NO_LONGER+" 👮"+l[lang].ADMINISTRATOR;
                GHbot.sendMessage(user.id, chat.id, text, {parse_mode:"HTML"});
            } catch (error) {
                handleTelegramGroupError(GHbot, user.id, chat.id, lang, error);
            }

        }
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_TITLE", user.perms))
        {
            if(!target)
            {
                GHbot.sendMessage(user.id, chat.id, l[lang].INVALID_TARGET);
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
                var changeTitleOpts = {parse_mode:"HTML", reply_markup: {inline_keyboard:[[{text:l[lang].ADMIN_PERMS_BUTTON,callback_data:"ADMINPERM_MENU?"+target.id}]]}};
                GHbot.sendMessage(user.id, chat.id, text, changeTitleOpts)
            } catch (error) {
                handleTelegramGroupError(GHbot, user.id, chat.id, lang, error);
            }

        }
        if( chat.isGroup && checkCommandPerms(command, "COMMAND_UNTITLE", user.perms))
        {
            if(!target)
            {
                GHbot.sendMessage(user.id, chat.id, l[lang].INVALID_TARGET);
                return;
            }

            try {
                await TGbot.setChatAdministratorCustomTitle(chat.id, target.id, "");

                var adminList = await getAdmins(TGbot, chat.id);
                chat = RM.reloadAdmins(chat, adminList);
                db.chats.update(chat);

                var text = target.name+bold(l[lang].TITLE_REMOVED);
                GHbot.sendMessage(user.id, chat.id, text, {parse_mode:"HTML"});
            } catch (error) {
                handleTelegramGroupError(GHbot, user.id, chat.id, lang, error);
            }

        }

        //check if user can change a role and if he can apply it to target
        if(toSetRole || toUnsetRole)
        {
            if(!user.perms.roles)
            {
                GHbot.sendMessage(user.id, chat.id, l[lang].MISSING_ROLE_PERM)
                return;
            }
            if(!target)
            {
                GHbot.sendMessage(user.id, chat.id, l[lang].INVALID_TARGET);
                return;
            }
            if(target.id == user.id)
            {
                GHbot.sendMessage(user.id, chat.id, l[lang].CANT_CHANGE_YOUR_PERMS);
                return;
            }

            var role = toSetRole ? toSetRole : toUnsetRole;

            var userLevel = RM.getUserLevel(chat, user.id);
            var roleLevel = RM.getRoleLevel(role, chat);
            var targetLevel = RM.getUserLevel(chat, target.id);

            if(userLevel < roleLevel+1)
            {
                GHbot.sendMessage(user.id, chat.id, l[lang].TOO_LOW_LEVEL_SET_ROLE)
                return;
            }
            if(userLevel < targetLevel)
            {
                GHbot.sendMessage(user.id, chat.id, l[lang].TOO_LOW_LEVEL_SET_USER)
                return;
            }

        }
        if(toSetRole)
        {
            if(RM.getUserRoles(chat, user.id).includes(toSetRole))
            {
                GHbot.sendMessage(user.id, chat.id, l[lang].ALREADY_IN_ROLE, options);
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
                GHbot.sendMessage(user.id, chat.id, l[lang].USELESS_ROLE);
                return;
            }

            text=target.name+" "+l[lang].HAS_BEEN_MADE+" "+RM.getFullRoleName(toSetRole, lang, chat);
            GHbot.sendMessage(user.id, chat.id, text, options);
        }
        if(toUnsetRole)
        {
            if(!RM.getUserRoles(chat, target.id).includes(toUnsetRole))
            {
                GHbot.sendMessage(user.id, chat.id, l[lang].NOT_IN_ROLE, options);
                return;
            }

            RM.unsetRole(chat, target.id, toUnsetRole);
            text=target.name+" "+l[lang].IS_NO_LONGER+" "+RM.getFullRoleName(toUnsetRole, lang, chat);
            GHbot.sendMessage(user.id, chat.id, text, options);
        }




        //security guards
        if( !(user.waitingReply && user.waitingReplyType.startsWith("ADMINTITLE")) ) return;
        if( !user.perms.commands.includes("COMMAND_ADMINISTRATOR") && !user.perms.commands.includes("COMMAND_TITLE") ) return;

        var title = msg.text.length > 0 ? msg.text.substring(0,16) : "";
        var changeTitleOpts = {parse_mode:"HTML", reply_markup: {inline_keyboard:[[{text:l[lang].CANCEL_BUTTON,callback_data:"ADMINPERM_MENU?"+user.waitingReplyTarget.id}]]}};
        try {
            await TGbot.setChatAdministratorCustomTitle(chat.id, user.waitingReplyTarget.id, title);

            var adminList = await getAdmins(TGbot, chat.id);
            chat = RM.reloadAdmins(chat, adminList);
            db.chats.update(chat);

            var newTitle = chat.users[target.id].title;
            var text = user.waitingReplyTarget.name+bold(l[lang].TITLE_CHANGED_TO)+" "+code(newTitle);
            
            GHbot.sendMessage(user.id, chat.id, text, changeTitleOpts)

            user.waitingReply = false;
            db.users.update(user);
        } catch (error) {
            var text = telegramErrorToText(lang, error);
            GHbot.sendMessage(user.id, chat.id, text, changeTitleOpts);
        }

    } )

    GHbot.onCallback( async (cb, chat, user) => {

        var lang = chat.lang;
        var target = cb.target;
        var msg = cb.message;

        //security guards
        if( !cb.data.startsWith("ADMINPERM_") && !cb.data.startsWith("ADMINTITLE")) return;
        if(!cb.target)
        {
            console.log("LGH Error: ADMINPERM_ target has not been identified");
            return;
        }

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
            if(user.waitingReply)
            {
                user.waitingReply = false;
                db.users.update(user);
            }

            //target still admin check
            var admin = chat.admins.filter((admin)=>{return admin.user.id == target.id})[0];
            if(!admin)
            {
                GHbot.editMessageText(user.id, l[lang].USER_NO_MORE_ADMIN, {chat_id:chat.id, message_id:cb.message.message_id});
                return;
            }

            //check if caller is admin
            if(!isAdminOfChat(chat, user.id))
            {
                GHbot.answerCallbackQuery(user.id, cb.id, {text: l[lang].MISSING_PERMISSION,show_alert:true});
                return;
            }

            //check if perm is already enabled due to base chat perms
            var chatPerms = (await TGbot.getChat(chat.id)).permissions;
            var permIsActiveByDefault = perm ? Object.keys(chatPerms).some((gPerm)=>{return gPerm == perm && chatPerms[gPerm]}) : false;
            if(permIsActiveByDefault)
            {
                GHbot.answerCallbackQuery(user.id, cb.id, {text: l[lang].PERM_ACTIVE_BY_DEFAULT,show_alert:true});
                return;
            }

            //apply permission change
            if(perm)
            {
                if(target.id == user.id)
                {
                    GHbot.answerCallbackQuery(user.id, cb.id, {text: l[lang].CANT_CHANGE_YOUR_PERMS,show_alert:true});
                    return;
                }

                var oldPermState = (admin.hasOwnProperty(perm) && admin[perm]);
                //check if the user that's setting as active this permission has this permission
                if(!oldPermState == true && !hasAdminPermission(chat.admins, user.id, perm))
                {
                    GHbot.answerCallbackQuery(user.id, cb.id, {text:l[lang].MISSING_ADMIN_PERMISSION, show_alert:true});
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
                    GHbot.answerCallbackQuery(user.id, cb.id, {text:text, show_alert:true});
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
            GHbot.editMessageText(user.id, text, options);
        }

        if(cb.data.startsWith("ADMINTITLE"))
        {
            //check if caller is admin
            if(!isAdminOfChat(chat, user.id))
            {
                GHbot.answerCallbackQuery(user.id, cb.id, {text: l[lang].MISSING_PERMISSION,show_alert:true});
                return;
            }

            //currently allowing to change title of any admin by other admins is wanted
            user.waitingReply = true;
            user.waitingReplyType = "ADMINTITLE?"+target.id;
            db.users.update(user);
            GHbot.editMessageText(user.id,  l[lang].SEND_NEW_TITLE, {message_id : msg.message_id, chat_id : chat.id, parse_mode : "HTML",
                reply_markup : {inline_keyboard :[[{text: l[lang].CANCEL_BUTTON, callback_data: "ADMINPERM_MENU?"+target.id}]]} }
            )
        }

    })

}

module.exports = main;
