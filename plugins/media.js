var LGHelpTemplate = require("../GHbot.js");
const { bold, punishmentToText, getUnixTime, genPunishmentTimeSetButton, punishmentToFullText, chunkArray, genPunishButtons, handlePunishmentCallback, textToPunishment } = require("../api/utils.js");
const RM = require("../api/rolesManager.js");
const { punishUser, newPunishObj } = require("../api/punishment.js");
const ST = require("../api/editors/setTime.js");


function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    var totalPages = 4;

    l = global.LGHLangs; //importing langs object

    GHbot.onCallback( (cb, chat, user) => {

        var msg = cb.message;
        var lang = user.lang;

        //security guards for settings
        if(!chat.isGroup) return;
        if( !cb.data.startsWith("S_MEDIA") ) return;
        if( !(user.hasOwnProperty("perms") && user.perms.settings) ) return;
        if( cb.chat.isGroup && chat.id != cb.chat.id) return;
        
        if( cb.data.startsWith("S_MEDIA_INFO") )
        {
            var text = l[cb.chat.lang].MEDIA_INFO.replace("{type}", l[cb.chat.lang]["MEDIA:"+mediaType]);
            GHbot.answerCallbackQuery(user.id, cb.id, {show_alert:true,text})
        }

        if( !cb.data.startsWith("S_MEDIA_PAGE") ) //from here only things that keeps still on main menu
            return;

        var page = [];
        var pageNum = -1;
        if (cb.data.startsWith("S_MEDIA_PAGE1")) {
            page = [
                ["photo", "📸"], ["video", "🎞"], ["album", "🖼"], ["gif", "🎥"], ["voice", "🎤"], ["audio", "🎧"],
                ["sticker", "🃏"], ["sticker_video", "🎭"], ["dice", "🎲"], ["emoji_video", "😀"], ["emoji_premium", "👾"], ["video_note", "👁‍🗨"]
            ];
            pageNum = 1;
        } else if (cb.data.startsWith("S_MEDIA_PAGE2")) {
            page = [
                ["file", "💾"], ["game", "🎮"], ["contact", "🏷"], ["poll", "📊"], ["location", "📍"], ["capital", "🆎"],
                ["payment", "💶"], ["via_bot", "🤖"], ["story", "📲"], ["spoiler", "🗯"], ["spoiler_media", "🌌"], ["giveaway", "🎁"]
            ];
            pageNum = 2;
        } else if (cb.data.startsWith("S_MEDIA_PAGE3")) {
            page = [
                ["mention", "🛎"], ["text_mention", "🆔"], ["hashtag", "#️⃣"], ["cashtag", "💰"], ["command", "💻"], ["url", "🖇"], ["email", "✉️"],
                ["number", "📞"], ["bold", "✏️"], ["italic", "🖊"], ["underline", "➖"], ["striketrough", "🪡"]
            ];
            pageNum = 3;
        } else if (cb.data.startsWith("S_MEDIA_PAGE4")) {
            page = [
                ["quoteblock", "🔲"], ["closed_blockquote", "▪️"], ["code", "👨‍💻"], ["pre_code", "🔶"], ["textlink", "🔗"],
                ["scheduled", "🗓"], ["effect", "✨"]
            ];
            pageNum = 4;
        }
        var pageCallback = "S_MEDIA_PAGE"+pageNum;

        var mediaType = false;
        if( cb.data.includes("!") )
            mediaType = cb.data.split("!")[1].split("#")[0].split(":")[0];

        var exhistObj = chat.media.hasOwnProperty(mediaType);

        if( cb.data.startsWith(pageCallback+"_OFF"))
        {
            if(exhistObj)
                chat.media[mediaType].punishment = 0;
            if(exhistObj && !chat.media[mediaType].delete )
                delete chat.media[mediaType];
            if(!exhistObj){
                GHbot.answerCallbackQuery(user.id,cb.id);
                return;
            };
        }
        if( cb.data.startsWith(pageCallback+"_P_") )
        {
            if(!exhistObj) chat.media[mediaType] = newPunishObj();
            var punishText = cb.data.split(pageCallback+"_P_")[1].split("!")[0];
            var punishment = textToPunishment(punishText);
            if(punishment == chat.media[mediaType].punishment){
                GHbot.answerCallbackQuery(user.id,cb.id);
                return;
            };
            chat.media[mediaType].punishment = punishment;
        }
        if( cb.data.startsWith(pageCallback+"_DELETE") )
        {
            if(!exhistObj) chat.media[mediaType] = newPunishObj();
            chat.media[mediaType].delete = !chat.media[mediaType].delete;
            if(!chat.media[mediaType].delete && chat.media[mediaType].punishment == 0)
                delete chat.media[mediaType];
        }

        if( cb.data.includes("PTIME") )
        {
            if(!exhistObj) chat.media[mediaType] = newPunishObj();
            var pageCallback = cb.data.split("_PTIME")[0];
            var returnButtons = [[{ text: l[lang].BACK_BUTTON, callback_data: pageCallback+":"+chat.id }]]
            var cb_prefix = cb.data.split("#")[0];
            var currentTime = chat.media[mediaType].PTime;
            var title = l[lang].SEND_PUNISHMENT_DURATION.replace("{punishment}", punishmentToText(lang, chat.media[mediaType].punishment));
            var time = ST.callbackEvent(GHbot, db, currentTime, cb, cb.chat, user, cb_prefix, returnButtons, title)

            if (time != -1 && time != currentTime)
                chat.media[mediaType].PTime = time;

            return;
        }

        //main menu based settings
        if( cb.data.startsWith("S_MEDIA_PAGE") )
        {

            var buttons = [];
            var text = "";
            switch (pageNum) {
                case 1: text = l[chat.lang].MEDIA_BLOCK_DESCRIPTION; break;
                case 2: text = l[chat.lang].MEDIA_BLOCK_DESCRIPTION2; break;
                case 3: text = l[chat.lang].MEDIA_BLOCK_DESCRIPTION3; break;
                case 4: text = l[chat.lang].MEDIA_BLOCK_DESCRIPTION4; break;
            }
            page.forEach((element)=>{
                var isActive = chat.media.hasOwnProperty(element[0]);

                var replace = isActive ?
                    punishmentToFullText(cb.chat.lang, chat.media[element[0]].punishment, chat.media[element[0]].PTime, chat.media[element[0]].delete) :
                    l[cb.chat.lang].OFF;
                text = text.replace("{"+element[0]+"}", replace);

                buttons.push([
                    {text: element[1], callback_data: "S_MEDIA_INFO!"+element[0]+":"+chat.id},
                    {text: "☑️", callback_data: pageCallback+"_OFF!"+element[0]+":"+chat.id},
                    {text: "❕", callback_data: pageCallback+"_P_WARN!"+element[0]+":"+chat.id},
                    {text: "❗️", callback_data: pageCallback+"_P_KICK!"+element[0]+":"+chat.id},
                    {text: "🔇", callback_data: pageCallback+"_P_MUTE!"+element[0]+":"+chat.id},
                    {text: "🚷", callback_data: pageCallback+"_P_BAN!"+element[0]+":"+chat.id},
                    {text: "🗑", callback_data: pageCallback+"_DELETE!"+element[0]+":"+chat.id}
                ])

                if(isActive && chat.media[element[0]].punishment != 0 && chat.media[element[0]].punishment != 2)
                    buttons[buttons.length-1].push({text: "🕑", callback_data: pageCallback+"_PTIME!"+element[0]+"#STIME:"+chat.id})
            })
            var navLine = [];
            if(pageNum > 1)
                navLine.push({text: l[cb.chat.lang].PAGE_LEFT_BUTTON+" "+(pageNum-1), callback_data: "S_MEDIA_PAGE"+(pageNum-1)+":"+chat.id})
            navLine.push({text: l[cb.chat.lang].BACK_BUTTON, callback_data: "SETTINGS_HERE:"+chat.id})
            if(pageNum < totalPages)
                navLine.push({text: l[cb.chat.lang].PAGE_RIGHT_BUTTON+" "+(pageNum+1), callback_data: "S_MEDIA_PAGE"+(pageNum+1)+":"+chat.id})
            buttons.push(navLine);

            var options = {
                chat_id:cb.chat.id,
                message_id:msg.message_id,
                parse_mode:"HTML",
                reply_markup:{inline_keyboard:buttons}
            };
            GHbot.editMessageText(user.id, text, options);
        }
        

        db.chats.update(chat);

    })

    GHbot.onMessage( async (msg, chat, user) => {


        //security guards
        if( !(user.waitingReply && user.waitingReplyType.startsWith("S_MEDIA")) ) return;
        if( msg.chat.isGroup && chat.id != msg.chat.id ) return;//additional security guard
        if( !(user.perms && user.perms.settings) ) return;

        var mediaType = false;
        if( user.waitingReplyType.includes("!") )
            mediaType = user.waitingReplyType.split("!")[1].split("#")[0].split(":")[0];
        
        var exhistObj = chat.media.hasOwnProperty(mediaType);

        if (user.waitingReplyType.includes("STIME")) {
            if(!exhistObj) chat.media[mediaType] = newPunishObj();
            var pageCallback = user.waitingReplyType.split("_PTIME")[0];
            var returnButtons = [[{ text: l[msg.chat.lang].BACK_BUTTON, callback_data: pageCallback+":"+chat.id }]]
            var cb_prefix = user.waitingReplyType.split("#")[0];
            var title = l[msg.chat.lang].SEND_PUNISHMENT_DURATION.replace("{punishment}", punishmentToText(msg.chat.lang, chat.media[mediaType].punishment));
            var time = ST.messageEvent(GHbot, chat.media[mediaType].PTime, msg, msg.chat, user, cb_prefix, returnButtons, title);

            if (time != -1 && time != chat.media[mediaType].PTime) {
                chat.media[mediaType].PTime = time;
                db.chats.update(chat);
            }
        }
    
    } )


}

module.exports = main;
