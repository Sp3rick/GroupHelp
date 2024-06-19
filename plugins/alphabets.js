var LGHelpTemplate = require("../GHbot.js");
const ABP = require("../api/editors/setAlphabetPunish.js");
const { punishUser } = require("../api/punishment.js");
const { isString } = require("../api/utils.js");
const RM = require("../api/rolesManager.js");

l = global.LGHLangs; //importing langs object

const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
function isArabic(text)
{
    if(!isString(text)) return false;
    return arabicPattern.test(text);
}

const cyrillicPattern = /[\u0400-\u04FF\u0500-\u052F\u2DE0-\u2DFF\uA640-\uA69F]/;
function isCyrillic(text)
{
    if(!isString(text)) return false;
    return cyrillicPattern.test(text);
}

const HAN_REGEX = /[\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u3005\u3007\u3021-\u3029\u3038-\u303B\u3400-\u4DB5\u4E00-\u9FD5\uF900-\uFA6D\uFA70-\uFAD9]/
function isChinese(text)
{
    if(!isString(text)) return false;
    return text.match(HAN_REGEX);
}

const LATIN_REGEX = /[a-zA-Z]/;
function isLatin(text)
{
    if(!isString(text)) return false;
    return text.match(LATIN_REGEX);
}

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    GHbot.onMessage( async (msg, chat, user) => {

        //spam detection
        if(msg.chat.type != "private" && user.perms.alphabets != 1){(()=>{

            var text = msg.text || msg.caption || false;
            if(!text) return;

            //does not check text if no punishment would be applyed
            var arabic = (chat.alphabets.arabic.punishment != 0 || chat.alphabets.arabic.delete) && isArabic(text);
            var cyrillic = (chat.alphabets.cyrillic.punishment != 0 || chat.alphabets.cyrillic.delete) && isCyrillic(text);
            var chinese = (chat.alphabets.chinese.punishment != 0 || chat.alphabets.chinese.delete) && isChinese(text);
            var latin = (chat.alphabets.latin.punishment != 0 || chat.alphabets.latin.delete) && isLatin(text);

            if( !(arabic || cyrillic || chinese || latin) ) return;

            var punishment = 0;
            var PTime = 0;
            var deletion = false;
            if(arabic)
            {
                punishment = (punishment >= chat.alphabets.arabic.punishment) ? punishment : chat.alphabets.arabic.punishment;
                PTime = (PTime >= chat.alphabets.arabic.PTime) ? PTime : chat.alphabets.latin.PTime
                deletion = chat.alphabets.arabic.delete ? true : deletion;
            }
            if(cyrillic)
            {
                punishment = (punishment >= chat.alphabets.cyrillic.punishment) ? punishment : chat.alphabets.cyrillic.punishment;
                PTime = (PTime >= chat.alphabets.cyrillic.PTime) ? PTime : chat.alphabets.latin.PTime
                deletion = chat.alphabets.cyrillic.delete ? true : deletion;
            }
            if(chinese)
            {
                punishment = (punishment >= chat.alphabets.chinese.punishment) ? punishment : chat.alphabets.chinese.punishment;
                PTime = (PTime >= chat.alphabets.chinese.PTime) ? PTime : chat.alphabets.latin.PTime
                deletion = chat.alphabets.chinese.delete ? true : deletion;
            }
            if(latin)
            {
                punishment = (punishment >= chat.alphabets.latin.punishment) ? punishment : chat.alphabets.latin.punishment;
                PTime = (PTime >= chat.alphabets.latin.PTime) ? PTime : chat.alphabets.latin.PTime
                deletion = chat.alphabets.latin.delete ? true : deletion;
            }

            var types = [];
            if(arabic) types.push(l[chat.lang].ARABIC);
            if(cyrillic) types.push(l[chat.lang].CYRILLIC);
            if(chinese) types.push(l[chat.lang].CHINESE);
            if(latin) types.push(l[chat.lang].LATIN);
            types = types.join("+");

            var reason = l[chat.lang].UNALLOWED_ALPHABET_PUNISHMENT;
            if(punishment != 0)
            {
                reason = reason.replace("{types}",types);
                punishUser(GHbot, user.id, chat, RM.userToTarget(chat, user), punishment, PTime, reason);
            }
            if(deletion) GHbot.TGbot.deleteMessages(chat.id, [msg.message_id]);
            
        })()}

        //security guards
        if (!(user.waitingReply)) return;
        var myCallback = user.waitingReplyType.startsWith("S_ALPHABETS");
        if (!myCallback) return;
        if (msg.chat.isGroup && chat.id != msg.chat.id) return;//additional security guard
        if (!(user.perms && user.perms.settings)) return;

        if (user.waitingReplyType.startsWith("S_ALPHABETS#ABP"))
        {
            var newAbp = ABP.messageEvent(GHbot, chat.alphabets, msg, msg.chat, user, "S_ALPHABETS");
            if(newAbp)
            {
                chat.alphabets = newAbp;
                db.chats.update(chat);
            }
        }

    } )

    GHbot.onCallback( async (cb, chat, user) => {

        var msg = cb.message;
        var lang = user.lang;

        //security guards for settings
        var myCallback = cb.data.startsWith("S_ALPHABETS");
        if(!chat.isGroup) return;
        if (!myCallback) return;
        if (!(user.perms && user.perms.settings)) return;
        if (cb.chat.isGroup && chat.id != cb.chat.id) return;

        if (cb.data.startsWith("S_ALPHABETS#ABP")) {
            var returnButtons = [[{ text: l[lang].BACK_BUTTON, callback_data: "SETTINGS_HERE:" + chat.id }]];
            var title = l[lang].ALPHABETS_DESCRIPTION+"\n";
            var newAbp = ABP.callbackEvent(GHbot, db, chat.alphabets, cb, cb.chat, user, "S_ALPHABETS", returnButtons, title);
            if (newAbp) {
                chat.alphabets = newAbp;
                db.chats.update(chat);
            }
        }

    })

}

module.exports = main;
