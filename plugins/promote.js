var LGHelpTemplate = require("../GHbot.js");
var RM = require("../api/utils/rolesManager.js");
const GHCommand = require("../api/tg/LGHCommand.js");
const { getAdmins } = require("../api/tg/tagResolver.js");
var {handleTelegramGroupError, code, genGroupAdminPermsKeyboard, bold, genGroupAdminPermsText, telegramErrorToText, hasAdminPermission, isAdminOfChat, unsetWaitReply, waitReplyForChat} = require ("../api/utils/utils.js");
var removeAdminOpts = {can_manage_chat:false,can_delete_messages:false,can_manage_video_chats:false,can_restrict_members:false,
    can_promote_members:false,can_change_info:false,can_invite_users:false,can_post_stories:false,can_edit_stories:false,
    can_delete_stories:false,can_pin_messages:false,can_manage_topics:false};

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    var commandsList = ["COMMAND_FREE", "COMMAND_UNFREE", "COMMAND_HELPER", "COMMAND_UNHELPER", "COMMAND_CLEANER", "COMMAND_UNCLEANER",
    "COMMAND_MUTER", "COMMAND_UNMUTER", "COMMAND_MODERATOR", "COMMAND_UNMODERATOR", "COMMAND_COFOUNDER", "COMMAND_UNCOFOUNDER",
    "COMMAND_ADMINISTRATOR", "COMMAND_UNADMINISTRATOR", "COMMAND_TITLE", "COMMAND_UNTITLE"];

    GHCommand.registerCommands(commandsList, async (msg, chat, user, private, lang, key, keyLang) => {
        if(!msg.chat.isGroup) return;
        if(msg.waitingReply) return;

        var command = msg.command;
        var lang = msg.chat.lang;
        var target = msg.waitingReplyTarget || msg.target;
        var text = false;
        var options = {parse_mode : "HTML"};
        var toSetRole = false;
        var toUnsetRole = false;

        if( key == "COMMAND_FREE")
            toSetRole = "free";
        if( key == "COMMAND_UNFREE")
            toUnsetRole = "free";

        if( key == "COMMAND_HELPER")
            toSetRole = "helper";
        if( key == "COMMAND_UNHELPER")
            toUnsetRole = "helper";

        if( key == "COMMAND_CLEANER")
            toSetRole = "cleaner"
        if( key == "COMMAND_UNCLEANER")
            toUnsetRole = "cleaner";

        if( key == "COMMAND_MUTER")
            toSetRole = "muter";
        if( key == "COMMAND_UNMUTER")
            toUnsetRole = "muter";

        if( key == "COMMAND_MODERATOR")
            toSetRole = "moderator";
        if( key == "COMMAND_UNMODERATOR")
            toUnsetRole = "moderator";

        if( key == "COMMAND_COFOUNDER")
            toSetRole = "cofounder"
        if( key == "COMMAND_UNCOFOUNDER")
            toUnsetRole = "cofounder";

        if( key == "COMMAND_ADMINISTRATOR")
        {
            if(!target)
            {
                GHbot.sendMessage(user.id, msg.chat.id, l[lang].INVALID_TARGET);
                return;
            }
            if(target.id == user.id)
            {
                GHbot.sendMessage(user.id, msg.chat.id, l[lang].CANT_CHANGE_YOUR_PERMS);
                return;
            }

            try {
                
                await TGbot.promoteChatMember(msg.chat.id, target.id, {can_manage_chat:true});
                if(command.args.length > 0)
                {
                    var title = command.args.substring(0,16);
                    try {
                        await TGbot.setChatAdministratorCustomTitle(msg.chat.id, target.id, title);
                    } catch (error) {
                        handleTelegramGroupError(GHbot, user.id, msg.chat.id, lang, error);
                    }
                }

                var adminList = await getAdmins(TGbot, msg.chat.id);
                msg.chat = RM.reloadAdmins(msg.chat, adminList);
                db.chats.update(msg.chat);

                var text = target.name+" "+bold(l[lang].HAS_BEEN_PROMOTED+"!");
                var buttons = [[{text:l[lang].ADMIN_PERMS_BUTTON, callback_data: "ADMINPERM_MENU:"+msg.chat.id+"?"+target.id}]];
                GHbot.sendMessage(user.id, msg.chat.id, text, {parse_mode:"HTML", reply_markup:{inline_keyboard:buttons}});

            } catch (error) {
                handleTelegramGroupError(GHbot, user.id, msg.chat.id, lang, error);
            }

        }
        if( key == "COMMAND_UNADMINISTRATOR")
        {
            if(!target)
            {
                GHbot.sendMessage(user.id, msg.chat.id, l[lang].INVALID_TARGET);
                return;
            }
            if(target.id == user.id)
            {
                GHbot.sendMessage(user.id, msg.chat.id, l[lang].CANT_CHANGE_YOUR_PERMS);
                return;
            }

            try {
                await TGbot.promoteChatMember(msg.chat.id, target.id, removeAdminOpts)

                var adminList = await getAdmins(TGbot, msg.chat.id);
                msg.chat = RM.reloadAdmins(msg.chat, adminList);
                db.chats.update(msg.chat);

                var text = target.name+" "+l[lang].IS_NO_LONGER+" 👮"+l[lang].ADMINISTRATOR;
                GHbot.sendMessage(user.id, msg.chat.id, text, {parse_mode:"HTML"});
            } catch (error) {
                handleTelegramGroupError(GHbot, user.id, msg.chat.id, lang, error);
            }

        }
        console.log("loggo key: " + key)
        if( key == "COMMAND_TITLE")
        {
            if(!target)
            {
                GHbot.sendMessage(user.id, msg.chat.id, l[lang].INVALID_TARGET);
                return;
            }

            var title = command.args.length > 0 ? command.args.substring(0,16) : "";
            try {
                await TGbot.setChatAdministratorCustomTitle(msg.chat.id, target.id, title);

                var adminList = await getAdmins(TGbot, msg.chat.id);
                msg.chat = RM.reloadAdmins(msg.chat, adminList);
                db.chats.update(msg.chat);

                var newTitle = msg.chat.users[target.id].title;
                var text = target.name+bold(l[lang].TITLE_CHANGED_TO)+" "+code(newTitle);
                var changeTitleOpts = {parse_mode:"HTML", reply_markup: {inline_keyboard:[[{text:l[lang].ADMIN_PERMS_BUTTON,callback_data:"ADMINPERM_MENU:"+msg.chat.id+"?"+target.id}]]}};
                GHbot.sendMessage(user.id, msg.chat.id, text, changeTitleOpts)
            } catch (error) {
                handleTelegramGroupError(GHbot, user.id, msg.chat.id, lang, error);
            }

        }
        if( key == "COMMAND_UNTITLE")
        {
            if(!target)
            {
                GHbot.sendMessage(user.id, msg.chat.id, l[lang].INVALID_TARGET);
                return;
            }

            try {
                await TGbot.setChatAdministratorCustomTitle(msg.chat.id, target.id, "");

                var adminList = await getAdmins(TGbot, msg.chat.id);
                msg.chat = RM.reloadAdmins(msg.chat, adminList);
                db.chats.update(msg.chat);

                var text = target.name+bold(l[lang].TITLE_REMOVED);
                GHbot.sendMessage(user.id, msg.chat.id, text, {parse_mode:"HTML"});
            } catch (error) {
                handleTelegramGroupError(GHbot, user.id, msg.chat.id, lang, error);
            }

        }

        //check if user can change a role and if he can apply it to target
        if(toSetRole || toUnsetRole)
        {
            if(!user.perms.roles)
            {
                GHbot.sendMessage(user.id, msg.chat.id, l[lang].MISSING_ROLE_PERM)
                return;
            }
            if(!target)
            {
                GHbot.sendMessage(user.id, msg.chat.id, l[lang].INVALID_TARGET);
                return;
            }
            if(target.id == user.id)
            {
                GHbot.sendMessage(user.id, msg.chat.id, l[lang].CANT_CHANGE_YOUR_PERMS);
                return;
            }

            var role = toSetRole ? toSetRole : toUnsetRole;

            var userLevel = RM.getUserLevel(msg.chat, user.id);
            var roleLevel = RM.getRoleLevel(role, msg.chat);
            var targetLevel = RM.getUserLevel(msg.chat, target.id);

            if(userLevel < roleLevel+1)
            {
                GHbot.sendMessage(user.id, msg.chat.id, l[lang].TOO_LOW_LEVEL_SET_ROLE)
                return;
            }
            if(userLevel < targetLevel)
            {
                GHbot.sendMessage(user.id, msg.chat.id, l[lang].TOO_LOW_LEVEL_SET_USER)
                return;
            }

        }
        if(toSetRole)
        {
            if(RM.getUserRoles(msg.chat, user.id).includes(toSetRole))
            {
                GHbot.sendMessage(user.id, msg.chat.id, l[lang].ALREADY_IN_ROLE, options);
                return;
            }

            var oldUserLevel = RM.getUserLevel(msg.chat, target.id);
            var oldPerms = JSON.stringify(target.perms);
            RM.setRole(msg.chat, target.id, toSetRole);

            //check if this new role is useless to user permissions
            var newPerms = JSON.stringify(RM.sumUserPerms(msg.chat, target.id));
            var newUserLevel = RM.getUserLevel(msg.chat, target.id);
            if(config.preventSetUselessRoles && oldPerms == newPerms && oldUserLevel == newUserLevel)
            {
                RM.unsetRole(msg.chat, target.id, toSetRole);
                GHbot.sendMessage(user.id, msg.chat.id, l[lang].USELESS_ROLE);
                return;
            }

            text=target.name+" "+l[lang].HAS_BEEN_MADE+" "+RM.getFullRoleName(toSetRole, lang, msg.chat);
            GHbot.sendMessage(user.id, msg.chat.id, text, options);
        }
        if(toUnsetRole)
        {
            if(!RM.getUserRoles(msg.chat, target.id).includes(toUnsetRole))
            {
                GHbot.sendMessage(user.id, msg.chat.id, l[lang].NOT_IN_ROLE, options);
                return;
            }

            RM.unsetRole(msg.chat, target.id, toUnsetRole);
            text=target.name+" "+l[lang].IS_NO_LONGER+" "+RM.getFullRoleName(toUnsetRole, lang, msg.chat);
            GHbot.sendMessage(user.id, msg.chat.id, text, options);
        }        
    })

    //waitingReply handler
    GHbot.onMessage( async (msg, chat, user) => {

        if( !(msg.waitingReply && msg.waitingReply.startsWith("ADMINTITLE")) ) return;
        if( !user.perms.commands.includes("COMMAND_TITLE") )
        {
            GHbot.sendMessage(user.id, msg.chat.id, l[lang].MISSING_PERMISSION);
            unsetWaitReply(db, user, chat, msg.chat.isGroup);
            return;
        }
        
        var lang = chat.lang;

        var title = msg.text.length > 0 ? msg.text.substring(0,16) : "";
        var changeTitleOpts = {parse_mode:"HTML", reply_markup: {inline_keyboard:[[{text:l[lang].CANCEL_BUTTON,callback_data:"ADMINPERM_MENU:"+chat.id+"?"+msg.waitingReplyTarget.id}]]}};
        try {
            await TGbot.setChatAdministratorCustomTitle(chat.id, msg.waitingReplyTarget.id, title);

            var adminList = await getAdmins(TGbot, chat.id);
            chat = RM.reloadAdmins(chat, adminList);
            db.chats.update(chat);

            var newTitle = chat.users[msg.waitingReplyTarget.id].title;
            var text = msg.waitingReplyTarget.name+bold(l[lang].TITLE_CHANGED_TO)+" "+code(newTitle);
            
            GHbot.sendMessage(user.id, msg.chat.id, text, changeTitleOpts)

            unsetWaitReply(db, user, chat, msg.chat.isGroup);
        } catch (error) {
            var text = telegramErrorToText(lang, error);
            GHbot.sendMessage(user.id, chat.id, text, changeTitleOpts);
        }
    
    } );

    GHbot.onCallback( async (cb, chat, user) => {

        //security guards for settings
        if(!chat.isGroup) return;
        if(!cb.data.startsWith("ADMINPERM_") && !cb.data.startsWith("ADMINTITLE")) return;
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
            if(msg.waitingReply)
                unsetWaitReply(db, user, chat, msg.chat.isGroup);

            //target still admin check
            var admin = chat.admins.filter((admin)=>{return admin.user.id == target.id})[0];
            if(!admin)
            {
                GHbot.editMessageText(user.id, l[lang].USER_NO_MORE_ADMIN, {chat_id:cb.chat.id, message_id:cb.message.message_id});
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
                //check if the user that's changing this permission has this permission
                if(!hasAdminPermission(chat.admins, user.id, perm))
                {
                    GHbot.answerCallbackQuery(user.id, cb.id, {text:l[lang].MISSING_ADMIN_PERMISSION, show_alert:true});
                    return;
                }

                admin[perm] = !oldPermState;
                var promoteOpts = deepCopy(admin);
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
                    return;
                }
            }

            //for accurancy we set true all permissions that's already on for every user in group, telegram is dumb and do not that by default
            var displayAdmin = deepCopy(admin);
            Object.keys(chatPerms).forEach((gPerm)=>{if(chatPerms[gPerm])displayAdmin[gPerm]=true;});

            var options = {
                chat_id : cb.chat.id,
                message_id : cb.message.message_id,
                parse_mode : "HTML",
                reply_markup : {inline_keyboard:genGroupAdminPermsKeyboard(lang, displayAdmin, chat)}
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

            //check if user has permission to set titles
            if( !user.perms.commands.includes("COMMAND_TITLE") )
            {
                GHbot.answerCallbackQuery(user.id, cb.id, {text: l[lang].MISSING_PERMISSION,show_alert:true});
                return;
            }

            //currently allowing to change title of any admin by other admins is wanted
            var callback = "ADMINTITLE?"+target.id;
            waitReplyForChat(db, callback, user, chat, msg.chat.isGroup);
            GHbot.editMessageText(user.id,  l[lang].SEND_NEW_TITLE, {message_id : msg.message_id, chat_id : cb.chat.id, parse_mode : "HTML",
                reply_markup : {inline_keyboard :[[{text: l[lang].CANCEL_BUTTON, callback_data: "ADMINPERM_MENU:"+chat.id+"?"+target.id}]]} }
            )
        }

    })

}

module.exports = main;
