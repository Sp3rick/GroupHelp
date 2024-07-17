var LGHelpTemplate = require("../GHbot.js")
const {sendCommandReply, bold, waitReplyForChat, unsetWaitReply, link, isNumber, getUnixTime, italic, replaceLast, secondsToHumanTime, deepCopy} = require( "../api/utils/utils.js" );
const CMDPerms = require("../api/editors/CommandsPerms.js")
const GHCommand = require("../api/tg/LGHCommand.js");
const SN = require("../api/editors/setNum.js");
const ST = require("../api/editors/setTime.js");
const { linksValidator } = require("../api/utils/antispam.js");
var year = 31536000;

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    l = global.LGHLangs; //importing langs object

    //{ [chatId+"_"+messageId] : {invites, time, approval} }
    global.LGHLinkMaker = {}

    GHCommand.registerCommands(["COMMAND_LINK"], async (msg, chat, user, private, lang, key, keyLang) => {
        var options = {reply_parameters: {chat_id:msg.chat.id, message_id: msg.message_id, allow_sending_without_reply:true},
        parse_mode: "HTML", disable_web_page_preview:true};
        if(msg.reply_to_message)
        {
            options.reply_parameters.message_id = msg.reply_to_message.message_id;
            options.reply_parameters.chat_id = msg.chat.id;
        }

        if(chat.link)
        {
            var text = bold(l[lang].S_LINK_BUTTON+": ")+chat.link;
            var func = (id) => {return GHbot.sendMessage(user.id, id, text, options)};
            sendCommandReply(private, msg.chat.lang, GHbot, user.id, msg.chat.id, func);
        }  
        else if(user.perms.settings)
        {
            options.reply_markup = {inline_keyboard:[[{text:l[lang].SET_A_LINK_BUTTON, callback_data:"S_LINK_BUTTON:"+chat.id}]]}
            var func = (id) => {return GHbot.sendMessage(user.id, id, bold(l[lang].LINK_NOT_SET_ADMIN), options)};
            sendCommandReply(private, msg.chat.lang, GHbot, user.id, msg.chat.id, func);
            
        }
    })

    //waitingReply handler
    GHbot.onMessage( async (msg, chat, user) => {

        //security guards
        if(!chat.isGroup) return;
        if( !(msg.waitingReply && msg.waitingReply.startsWith("S_LINK")) ) return;
        if( msg.chat.isGroup && chat.id != msg.chat.id ) return;//additional security guard
        if( !(user.perms && user.perms.settings) ) return;

        if(msg.waitingReply.startsWith("S_LINK_SET"))
        {
            var text = msg.text || msg.caption || false;
            var buttons = [ [{text: l[chat.lang].BACK_BUTTON, callback_data: "S_LINK_BUTTON:"+chat.id}] ]
            var options = {
                message_id : msg.message_id,
                chat_id : msg.chat.id,
                parse_mode : "HTML",
                reply_markup : {inline_keyboard : buttons}, 
            }

            if(!text || !linksValidator(text))
            {
                GHbot.sendMessage(user.id, msg.chat.id, l[chat.lang].NOT_VALID_LINK, options);
                return;
            }

            chat.link = text;
            unsetWaitReply(db, user, chat, msg.chat.isGroup);
            GHbot.sendMessage(user.id, msg.chat.id, l[chat.lang].LINK_SET, options);
        }

        //

        if( msg.waitingReply.startsWith("S_LINK_MAKE_INV#SNUM")  )
        {
            var id = chat.id+"_"+user.id;
            if(!global.LGHLinkMaker.hasOwnProperty(id))
                global.LGHLinkMaker[id] = {invites:0, time:0, approval:false};
            var linkMaker = global.LGHLinkMaker[id];

            var returnButtons = [[{ text: l[user.lang].SET_UNLIMITED_BUTTON, callback_data: "S_LINK_MAKE_MENU_ZEROINV:" + chat.id }],
                [{ text: l[user.lang].BACK_BUTTON, callback_data: "S_LINK_MAKE_MENU:" + chat.id }]];

            var title = l[user.lang].SEND_LINK_INVITED;
            var num = SN.messageEvent(GHbot, linkMaker.invites, msg, chat, user, "S_LINK_MAKE_INV", returnButtons, title, 1, 100);
            if(num != -1 && num != linkMaker.invites)
                global.LGHLinkMaker[id].invites = num;
        }
        if( msg.waitingReply.startsWith("S_LINK_MAKE_UNTIL#STIME") )
        {   
            
            var id = chat.id+"_"+user.id;
            if(!global.LGHLinkMaker.hasOwnProperty(id))
                global.LGHLinkMaker[id] = {invites:0, time:0, approval:false};
            var linkMaker = global.LGHLinkMaker[id];

            var returnButtons = [[{text: l[user.lang].BACK_BUTTON, callback_data: "S_LINK_MAKE_MENU:"+chat.id}]]
            var cb_prefix = msg.waitingReply.split("#")[0];

            var title = l[user.lang].SEND_LINK_DURATION;
            var time = ST.messageEvent(GHbot, linkMaker.time, msg, chat, user, cb_prefix, returnButtons, title, 5, year);

            if(time != -1 && time != linkMaker.time)
                global.LGHLinkMaker[id].time = time;
        }

    } )


    //TODO: something to allow to list all links created from bot and allow to revoke them
    GHbot.onCallback( async (cb, chat, user) => {

        var msg = cb.message;
        var lang = user.lang;

        //security guards for settings
        if(!chat.isGroup) return;
        if( !cb.data.startsWith("S_LINK")) return;
        if( !(user.perms && user.perms.settings) ) return;
        if( cb.chat.isGroup && chat.id != cb.chat.id) return;

        if( cb.data.startsWith("S_LINK_DELETE:") )
        {
            chat.link = false;
            db.chats.update(chat);
        }

        if( cb.data.startsWith("S_LINK_SETMAIN") )
        {
            var setLink = "https://t.me/"+cb.data.split("!")[1].split(":")[0];
            chat.link = setLink;
            db.chats.update(chat);
        }

        var mainMenuCallback = cb.data.startsWith("S_LINK_BUTTON:") ||
            (cb.data.startsWith("S_LINK_SEE:") && !chat.link) ||
            cb.data.startsWith("S_LINK_DELETE:") ||
            cb.data.startsWith("S_LINK_SETMAIN");
        if( mainMenuCallback )
        {
            var line1 = [{text: l[lang].SET_BUTTON, callback_data: "S_LINK_SET:"+chat.id}];
            if(chat.link) line1.push({text: l[lang].DELETE_LINK_BUTTON, callback_data: "S_LINK_DELETE:"+chat.id})

            var buttons = [line1];

            buttons.push([{text: l[lang].MAKE_LINK_BUTTON, callback_data: "S_LINK_MAKE_MENU:"+chat.id}])

            buttons.push([{text: l[lang].COMMAND_PERMS_BUTTON, callback_data: "S_LINK#CMDPERMS_MENU:"+chat.id}])

            buttons.push([{text: l[lang].BACK_BUTTON, callback_data: "SETTINGS_HERE:"+chat.id}])

            var text = l[lang].LINK_DESCRIPTION.replace("{status}", chat.link ? l[lang].ACTIVE : l[lang].DEACTIVATED);
            if(chat.link)text+="\n  └ "+chat.link;
            GHbot.editMessageText( user.id, text, {
                message_id : msg.message_id,
                chat_id : cb.chat.id,
                parse_mode : "HTML",
                reply_markup : {inline_keyboard : buttons},
                disable_web_page_preview:true,
            });
        }

        if( cb.data.startsWith("S_LINK_SET:") )
        {
            var buttons = [];
            //if(chat.link) buttons.push([{text: l[lang].DELETE_LINK_BUTTON2, callback_data: "S_LINK_DELETE:"+chat.id}])
            buttons.push([{text: l[lang].CANCEL_BUTTON, callback_data: "S_LINK_BUTTON:"+chat.id}])

            waitReplyForChat(db, "S_LINK_SET", user, chat, msg.chat.isGroup);
            var text = l[lang].SET_LINK_DESCRIPTION;
            GHbot.editMessageText( user.id, text, {
                message_id : msg.message_id,
                chat_id : cb.chat.id,
                parse_mode : "HTML",
                reply_markup : {inline_keyboard : buttons}, 
            });
        }

        //
        var id = chat.id+"_"+user.id;
        var linkMaker;
        if(cb.data.startsWith("S_LINK_MAKE"))
        {
            if(!global.LGHLinkMaker.hasOwnProperty(id))
                global.LGHLinkMaker[id] = {invites:0, time:0, approval:false};
            linkMaker = global.LGHLinkMaker[id];
        }
            
        if(cb.data.startsWith("S_LINK_MAKE_INV#SNUM_MENU"))
        {
            var returnButtons = [[{ text: l[lang].SET_UNLIMITED_BUTTON, callback_data: "S_LINK_MAKE_MENU_ZEROINV:" + chat.id }],
                [{ text: l[lang].BACK_BUTTON, callback_data: "S_LINK_MAKE_MENU:" + chat.id }]];
            var cb_prefix = cb.data.split("#")[0];

            var title = l[lang].SEND_LINK_INVITED;
            var num = SN.callbackEvent(GHbot, db, linkMaker.invites, cb, chat, user, cb_prefix, returnButtons, title, 1, 100);
            if(num != -1 && num != linkMaker.invites)
                global.LGHLinkMaker[id].invites = num;
        }
        if(cb.data.startsWith("S_LINK_MAKE_MENU_ZEROINV"))
            global.LGHLinkMaker[id].invites = 0;
        if( cb.data.startsWith("S_LINK_MAKE_UNTIL#STIME") )
        {
            var returnButtons = [[{ text: l[lang].BACK_BUTTON, callback_data: "S_LINK_MAKE_MENU:" + chat.id }]]
            var cb_prefix = cb.data.split("#")[0];
            
            var currentTime = linkMaker.time;
            var title = l[lang].SEND_LINK_DURATION;
            var time = ST.callbackEvent(GHbot, db, currentTime, cb, chat, user, cb_prefix, returnButtons, title, 5, year)

            if (time != -1 && time != linkMaker.time)
                global.LGHLinkMaker[id].time = time;
        }
        if( cb.data.startsWith("S_LINK_MAKE_MENU_APPROVAL") )
            global.LGHLinkMaker[id].approval = !global.LGHLinkMaker[id].approval;
        if( cb.data.startsWith("S_LINK_MAKE_MENU") )
        {
            var line1 = [];
            if(!linkMaker.approval)
                line1.push({text: l[lang].INVITATIONS_BUTTON, callback_data: "S_LINK_MAKE_INV#SNUM_MENU:"+chat.id});
            line1.push({text: l[lang].UNTIL_BUTTON, callback_data: "S_LINK_MAKE_UNTIL#STIME:"+chat.id})

            var approvalText = l[lang].APPROVAL_MODE+" "+(linkMaker.approval?"✔️":"✖️")
            var line2 = [{text: approvalText, callback_data: "S_LINK_MAKE_MENU_APPROVAL:"+chat.id}];

            var line3 = [{text: l[lang].CANCEL_BUTTON, callback_data: "S_LINK_BUTTON:"+chat.id}];
            line3.push({text: l[lang].CREATE_LINK_BUTTON, callback_data: "S_LINK_MAKE_FINISH:"+chat.id});

            var buttons = [line1, line2, line3];

            var text = bold(l[lang].S_LINK_BUTTON);
            if(!linkMaker.approval && linkMaker.invites!=0) text+="\n ├"+bold(l[lang].INVITATIONS_BUTTON)+": "+linkMaker.invites;
            if(linkMaker.time!=0) text+="\n ├"+bold(l[lang].UNTIL_BUTTON)+": "+secondsToHumanTime(lang, linkMaker.time);
            text+="\n └"+bold(l[lang].APPROVAL_MODE)+": "+(linkMaker.approval?l[lang].YES:l[lang].NO);
            GHbot.editMessageText( user.id, text, {
                message_id : msg.message_id,
                chat_id : cb.chat.id,
                parse_mode : "HTML",
                reply_markup : {inline_keyboard : buttons}, 
            });
        }
        if( cb.data.startsWith("S_LINK_MAKE_FINISH") )
        {try{
            if(!global.LGHLinkMaker.hasOwnProperty(id)) return;

            var makelinkOpts = {
                name: user.id,
                creates_join_request: linkMaker.approval
            }
            if(!linkMaker.approval && linkMaker.invites != 0)
                makelinkOpts.member_limit = linkMaker.invites
            if(linkMaker.time != 0)
                makelinkOpts.expire_date = getUnixTime()+linkMaker.time;
            
            var createdLink = await TGbot.createChatInviteLink(chat.id, makelinkOpts)

            var text = bold(l[lang].S_LINK_BUTTON)+" » "+createdLink.invite_link;
            if(!linkMaker.approval && linkMaker.invites!=0) text+="\n ├"+bold(l[lang].INVITATIONS_BUTTON)+": "+linkMaker.invites;
            if(linkMaker.time!=0) text+="\n ├"+bold(l[lang].UNTIL_BUTTON)+": "+secondsToHumanTime(lang, linkMaker.time);
            text+="\n └ "+bold(l[lang].APPROVAL_MODE)+": "+(linkMaker.approval?l[lang].YES:l[lang].NO);
            var linkCode = createdLink.invite_link.split("/").at(-1);
            var buttons = [[{text: l[lang].REVOKE_LINK_BUTTON, callback_data: "S_LINK_REVOKE!"+linkCode+":"+chat.id}]]
            if(!chat.link) buttons.push([{text: l[lang].SET_AS_MAIN_LINK_BUTTON, callback_data: "S_LINK_SETMAIN!"+linkCode+":"+chat.id}])
            var options = {chat_id:msg.chat.id,message_id:msg.message_id,parse_mode:"HTML",disable_web_page_preview:true,reply_markup:{inline_keyboard:buttons}}
            delete global.LGHLinkMaker[id];
            //try to move the reply on private chat if not already (TODO: do that in a function)
            try {
                await GHbot.sendMessage(user.id, user.id, text, deepCopy(options));
                var privateLink = "https://t.me/"+GHbot.TGbot.me.username;
                var editText = link(l[lang].SENT_PRIVATE_CHAT, privateLink);
                var opts = {chat_id:msg.chat.id,message_id:msg.message_id,parse_mode:"HTML",disable_web_page_preview:true};
                await GHbot.editMessageText(user.id, editText, opts);
            } catch (error) {
                await GHbot.editMessageText(user.id, text, options);
            }
        } catch (error) {
            GHbot.sendMessage(user.id, msg.chat.id, l[lang].CANT_CREATE_LINK);
        }}
        //

        if( cb.data.startsWith("S_LINK_REVOKE") )
        {
            var revLink = "https://t.me/"+cb.data.split("!")[1].split(":")[0];
            try {
                await TGbot.revokeChatInviteLink(chat.id, revLink);
                var text = italic(l[lang].NEW_LINK_REVOKED+"\n"+revLink);
                var opts = {chat_id:msg.chat.id,message_id:msg.message_id,disable_web_page_preview:true,parse_mode:"HTML"}
                GHbot.editMessageText(user.id, text, opts);
            } catch (error) {
                GHbot.answerCallbackQuery(user.id, cb.id, {show_alert:true, text:l[chat].CANT_REVOKE_LINK})
            }
        }

        if( cb.data.startsWith("S_LINK#CMDPERMS") )
        {
            var returnButtons = [[{text: l[lang].BACK_BUTTON, callback_data: "S_LINK_BUTTON:"+chat.id}]];
            var newChat = CMDPerms.callbackEvent(GHbot, db, chat, cb, chat, user, "S_LINK", returnButtons)
            if(newChat) db.chats.update(newChat);
        }

    })

    

}

module.exports = main;
