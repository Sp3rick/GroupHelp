var LGHelpTemplate = require("../GHbot.js");
const { bold, punishmentToText, getUnixTime, genPunishmentTimeSetButton, punishmentToFullText, chunkArray, genPunishButtons, handlePunishmentCallback, textToPunishment, isArray, isString } = require("../api/utils/utils.js");
const RM = require("../api/utils/rolesManager.js");
const { punishUser, newPunishObj, sumPunishObj, isPunishGreater } = require("../api/utils/punishment.js");
const ST = require("../api/editors/setTime.js");

const LATIN_REGEX = /[a-zA-Z]/;
function isLatin(text)
{
    if(!isString(text)) return false;
    return text.match(LATIN_REGEX);
}

//exceptions to handle trough special code: album (media_group_id), emoji_video (single emoji), scheduled, sticker and sticker_video
const mapping = {
    "photo": "photo",
    "video": "video",
    "animation": "gif",
    "voice": "voice",
    "audio": "audio",
    "dice": "dice",
    "video_note": "video_note",
    "document": "file",
    "game": "game",
    "contact": "contact",
    "poll": "poll",
    "location": "location",
    "invoice": "payment",
    "via_bot": "via_bot",
    "story": "story",
    "has_media_spoiler": "spoiler_media",
    "effect_id": "effect"
};
const entityMapping = {
    "custom_emoji" : "emoji_premium",
    "mention": "mention",
    "hashtag": "hashtag",
    "cashtag": "cashtag",
    "bot_command": "command",
    "url": "url",
    "email": "email",
    "phone_number": "number",
    "bold": "bold",
    "italic": "italic",
    "underline": "underline",
    "strikethrough": "striketrough",
    "spoiler" : "spoiler",
    "blockquote": "quoteblock",
    "expandable_blockquote": "closed_blockquote",
    "code": "code",
    "pre": "pre_code",
    "text_link": "textlink"
};
function sumPunishMessageMedia(punish, punishList, media, msg, mapping) {
    for (let key in mapping) {
        if (media.hasOwnProperty(mapping[key]) && msg.hasOwnProperty(key)) {
            punish = sumPunishObj(punish, media[mapping[key]]);
            punishList.push(mapping[key]);
        }
    }
    return punish;
}
function sumPunishEntitiesMedia(chat, msg, punish, punishList) {
    if (msg.entities) {
        for (let entity of msg.entities) {
            if (entityMapping.hasOwnProperty(entity.type) && chat.media.hasOwnProperty(entityMapping[entity.type])) {
                punish = sumPunishObj(punish, chat.media[entityMapping[entity.type]]);
                punishList.push(entityMapping[entity.type]);
            }
        }
    }
    return punish;
}

/*
Table with list of emoji that if alone in a message is going to be animated
That should be updated if telegram add more in future
Made with https://emojis.wiki/telegram/ and ChatGPT
*/
const emojiTable = {
    "😀": true, "😃": true, "😄": true, "😁": true, "😆": true, "😅": true, "🤣": true, "😂": true, "🙂": true, "🙃": true,
    "🫠": true, "😉": true, "😊": true, "😇": true, "🥰": true, "😍": true, "🤩": true, "😘": true, "😗": true, "☺️": true,
    "😚": true, "😙": true, "🥲": true, "😋": true, "😛": true, "😜": true, "🤪": true, "😝": true, "🤑": true, "🤗": true,
    "🤭": true, "🫢": true, "🫣": true, "🤫": true, "🤔": true, "🫡": true, "🤐": true, "🤨": true, "😐": true, "😑": true,
    "😶": true, "🫥": true, "😶‍🌫️": true, "😏": true, "😒": true, "🙄": true, "😬": true, "😮‍💨": true, "🤥": true, "😌": true,
    "😔": true, "😪": true, "🤤": true, "😴": true, "😷": true, "🤒": true, "🤕": true, "🤢": true, "🤮": true, "🤧": true,
    "🥵": true, "🥶": true, "🥴": true, "😵": true, "😵‍💫": true, "🤯": true, "🤠": true, "🥳": true, "🥸": true, "😎": true,
    "🤓": true, "🧐": true, "😕": true, "🫤": true, "😟": true, "🙁": true, "☹️": true, "😮": true, "😯": true, "😲": true,
    "😳": true, "🥺": true, "🥹": true, "😦": true, "😧": true, "😨": true, "😰": true, "😥": true, "😢": true, "😭": true,
    "😱": true, "😖": true, "😣": true, "😞": true, "😓": true, "😩": true, "😫": true, "🥱": true, "😤": true, "😡": true,
    "😠": true, "🤬": true, "😈": true, "👿": true, "💀": true, "☠️": true, "💩": true, "🤡": true, "👹": true, "👺": true,
    "👻": true, "👽": true, "👾": true, "🤖": true, "😺": true, "😸": true, "😹": true, "😻": true, "😼": true, "😽": true,
    "🙀": true, "😿": true, "😾": true, "🙈": true, "🙉": true, "🙊": true, "💋": true, "💌": true, "💘": true, "💝": true,
    "💖": true, "💗": true, "💓": true, "💞": true, "💕": true, "💟": true, "❣️": true, "💔": true, "❤️‍🔥": true, "❤️‍🩹": true,
    "❤️": true, "🧡": true, "💛": true, "💚": true, "💙": true, "💜": true, "🤎": true, "🖤": true, "🤍": true, "💯": true,
    "💢": true, "💥": true, "💫": true, "💬": true, "🗯️": true, "💭": true, "💤": true, "🤷": true, "👋": true, "🤚": true,
    "🖐️": true, "✋": true, "🖖": true, "🫱": true, "🫲": true, "🫳": true, "🫴": true, "👌": true, "🤌": true, "🤏": true,
    "✌️": true, "🤞": true, "🫰": true, "🤟": true, "🤘": true, "🤙": true, "👈": true, "👉": true, "👆": true, "🖕": true,
    "☝️": true, "🫵": true, "👍": true, "👎": true, "✊": true, "👊": true, "🤛": true, "🤜": true, "👏": true, "🙌": true,
    "🫶": true, "👐": true, "🤲": true, "🤝": true, "🙏": true, "✍️": true, "💅": true, "💪": true, "🦾": true, "🦿": true,
    "🦵": true, "🦶": true, "👂": true, "🦻": true, "👃": true, "🦷": true, "🦴": true, "👀": true, "👁️": true, "👅": true,
    "👄": true, "🫦": true, "👶": true, "👵": true, "🤦": true, "🤦‍♂️": true, "🤦‍♀️": true, "🤷": true, "🤷‍♂️": true,
    "🤷‍♀️": true, "👨‍⚕️": true, "👩‍⚕️": true, "👨‍🏫": true, "🧑‍💻": true, "👨‍💻": true, "👩‍💻": true, "👮‍♂️": true,
    "👮‍♀️": true, "🤰": true, "🎅": true, "🤶": true, "🧑‍🎄": true, "🧟": true, "🧟‍♂️": true, "🧟‍♀️": true, "💃": true,
    "🕺": true, "👨‍👩‍👧‍👦": true, "🗣️": true, "👤": true, "👥": true, "🫂": true, "👣": true, "🐼": true, "🐵": true,
    "🦍": true, "🐶": true, "🦊": true, "🦝": true, "🐱": true, "🐯": true, "🐅": true, "🐆": true, "🐴": true, "🐎": true,
    "🦄": true, "🦓": true, "🦌": true, "🦬": true, "🐂": true, "🐄": true, "🐷": true, "🐽": true, "🦙": true, "🐭": true,
    "🐹": true, "🐰": true, "🐇": true, "🦇": true, "🐻": true, "🐻‍❄️": true, "🐨": true, "🐼": true, "🦘": true, "🐾": true,
    "🐔": true, "🐣": true, "🐤": true, "🐥": true, "🐦": true, "🐧": true, "🕊️": true, "🦆": true, "🦢": true, "🦉": true,
    "🦜": true, "🐢": true, "🐍": true, "🐳": true, "🦭": true, "🐟": true, "🐠": true, "🐙": true, "🐌": true, "🦋": true,
    "🪲": true, "🐞": true, "🪳": true, "🕷️": true, "🕸️": true, "🦟": true, "🦠": true, "🌸": true, "🌹": true, "🌺": true,
    "🌼": true, "🌷": true, "🌱": true, "🌲": true, "🌳": true, "🌴": true, "🌵": true, "🌿": true, "🍀": true, "🍕": true,
    "🍌": true, "🍓": true, "🥨": true, "🥞": true, "🍖": true, "🍗": true, "🍔": true, "🍟": true, "🍕": true, "🌭": true,
    "🥪": true, "🌮": true, "🥙": true, "🍳": true, "🍿": true, "🥫": true, "🍱": true, "🍘": true, "🍙": true, "🍢": true,
    "🍣": true, "🍥": true, "🍡": true, "🦞": true, "🦐": true, "🍦": true, "🍩": true, "🍪": true, "🎂": true, "🍰": true,
    "🧁": true, "🥧": true, "🍫": true, "🍭": true, "🍮": true, "☕": true, "🍾": true, "🍷": true, "🍸": true, "🍹": true,
    "🥂": true, "🥃": true, "🫗": true, "🥤": true, "🧋": true, "🧃": true, "🧉": true, "🌇": true, "🧭": true, "🏕️": true,
    "🏖️": true, "🏝️": true, "🏛️": true, "🏠": true, "♨️": true, "🎢": true, "🚂": true, "🚑": true, "🚓": true, "🚕": true,
    "🛥️": true, "✈️": true, "🚀": true, "🧳": true, "⌛": true, "⏳": true, "🌑": true, "🌒": true, "🌓": true, "🌔": true,
    "🌕": true, "🌖": true, "🌗": true, "🌘": true, "🌚": true, "🌛": true, "🌜": true, "🌡️": true, "☀️": true, "🌝": true,
    "🌞": true, "⭐": true, "🌟": true, "☁️": true, "⛅": true, "🌤️": true, "🌥️": true, "🌦️": true, "🌧️": true, "🌨️": true,
    "🌩️": true, "⚡": true, "❄️": true, "☃️": true, "⛄": true, "🔥": true, "🎈": true, "🎃": true, "🎄": true, "🎆": true,
    "🎇": true, "🧨": true, "✨": true, "🎈": true, "🎉": true, "🎊": true, "🎗️": true, "🎟️": true, "🎫": true, "🎖️": true,
    "🏆": true, "🏅": true, "🥇": true, "🥈": true, "🥉": true, "⚽": true, "🏀": true, "🛷": true, "🔮": true, "🪄": true,
    "🎮": true, "🪩": true, "🎭": true, "🎨": true, "📮": true, "💣": true, "👛": true, "👜": true, "🛍️": true, "👠": true,
    "👑": true, "🎩": true, "🎓": true, "🪖": true, "💄": true, "💎": true, "📣": true, "🎵": true, "🎶": true, "🎙️": true,
    "🎤": true, "📱": true, "☎️": true, "📞": true, "💻": true, "🖨️": true, "⌨️": true, "🧮": true, "🎬": true, "📺": true,
    "🔍": true, "🔎": true, "💡": true, "📖": true, "📚": true, "📰": true, "💰": true, "🪙": true, "💸": true, "✉️": true,
    "📤": true, "📥": true, "📭": true, "🗳️": true, "📝": true, "💼": true, "📁": true, "📂": true, "🗂️": true, "📆": true,
    "📈": true, "📉": true, "📊": true, "🔐": true, "🔑": true, "🗝️": true, "🧰": true, "🧪": true, "🔬": true, "🔭": true,
    "💉": true, "💊": true, "🩺": true, "🧻": true, "🧼": true, "🧽": true, "🛒": true, "⚰️": true, "🗿": true, "💯": true,
    "🚹": true, "🚺": true, "🚼": true, "🛃": true, "🔞": true, "🔝": true, "♐": true, "♑": true, "♒": true, "♓": true,
    "⛎": true, "‼️": true, "⁉️": true, "❓": true, "❔": true, "❕": true, "❗": true, "💱": true, "✅": true, "☑️": true,
    "✔️": true, "❌": true, "🆒": true, "🆓": true, "🆕": true, "🆗": true, "🆙": true, "🇺🇸": true, "🏁": true, "🚩": true,
    "🏴": true, "🏳️": true, "🏴‍☠️": true, "🇦🇪": true, "🇦🇷": true, "🇦🇹": true, "🇧🇪": true, "🇧🇫": true, "🇧🇬": true,
    "🇧🇯": true, "🇧🇷": true, "🇧🇸": true, "🇨🇲": true, "🇨🇿": true, "🇩🇯": true, "🇪🇪": true, "🇪🇭": true, "🇪🇸": true,
    "🇫🇷": true, "🇬🇧": true, "🇬🇭": true, "🇬🇼": true, "🇭🇷": true, "🇭🇺": true, "🇮🇳": true, "🇮🇹": true, "🇯🇴": true,
    "🇯🇵": true, "🇰🇷": true, "🇲🇦": true, "🇲🇨": true, "🇲🇬": true, "🇲🇲": true, "🇵🇪": true, "🇵🇭": true, "🇵🇱": true,
    "🇵🇸": true, "🇷🇴": true, "🇷🇺": true, "🇸🇦": true, "🇸🇩": true, "🇸🇸": true, "🇸🇹": true, "🇸🇽": true, "🇹🇩": true,
    "🇺🇦": true, "🇺🇸": true, "🇺🇿": true, "🇻🇳": true, "🇾🇪": true, "🏁": true, "🚩": true
};

//Object: {[media_group_id] : time};
global.LGHMedia = {}
//clear old media group ids
setInterval(()=>{
    var now = getUnixTime();
    var keys = Object.keys(global.LGHMedia);
    keys.forEach((key)=>{
        if( now > (global.LGHMedia[key].time+5) )
            delete global.LGHMedia[key];
    }
)},1000)

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    var pages = [["photo", "📸"], ["video", "🎞"], ["album", "🖼"], ["gif", "🎥"], ["voice", "🎤"], ["audio", "🎧"],
    ["sticker", "🃏"], ["sticker_video", "🎭"], ["dice", "🎲"], ["emoji_video", "😀"], ["emoji_premium", "👾"], ["video_note", "👁‍🗨"],
    ["file", "💾"], ["game", "🎮"], ["contact", "🏷"], ["poll", "📊"], ["location", "📍"], ["capital", "🆎"],
    ["payment", "💶"], ["via_bot", "🤖"], ["story", "📲"], ["spoiler", "🗯"], ["spoiler_media", "🌌"], ["giveaway", "🎁"],
    ["mention", "🛎"], ["text_mention", "🆔"], ["hashtag", "#️⃣"], ["cashtag", "💰"], ["command", "💻"], ["url", "🖇"],
    ["email", "✉️"], ["number", "📞"], ["bold", "✏️"], ["italic", "🖊"], ["underline", "➖"], ["striketrough", "🪡"],
    ["quoteblock", "🔲"], ["closed_blockquote", "▪️"], ["code", "👨‍💻"], ["pre_code", "🔶"], ["textlink", "🔗"], ["scheduled", "🗓"],
    ["effect", "✨"]
    ]
    pages = chunkArray(pages, 12);
    var totalPages = pages.length;

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
            var text = l[chat.lang].MEDIA_INFO.replace("{type}", l[chat.lang]["MEDIA:"+mediaType]);
            GHbot.answerCallbackQuery(user.id, cb.id, {show_alert:true,text})
        }

        if( !cb.data.startsWith("S_MEDIA_PAGE") ) //from here only things that keeps still on main menu
            return;

        var pageNum = -1;
        if (cb.data.startsWith("S_MEDIA_PAGE1")) {
            pageNum = 1;
        } else if (cb.data.startsWith("S_MEDIA_PAGE2")) {
            pageNum = 2;
        } else if (cb.data.startsWith("S_MEDIA_PAGE3")) {
            pageNum = 3;
        } else if (cb.data.startsWith("S_MEDIA_PAGE4")) {
            pageNum = 4;
        }
        var page = pages[pageNum-1];
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
            var time = ST.callbackEvent(GHbot, db, currentTime, cb, chat, user, cb_prefix, returnButtons, title)

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
                    punishmentToFullText(chat.lang, chat.media[element[0]].punishment, chat.media[element[0]].PTime, chat.media[element[0]].delete) :
                    l[chat.lang].OFF;
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
                navLine.push({text: l[chat.lang].PAGE_LEFT_BUTTON+" "+(pageNum-1), callback_data: "S_MEDIA_PAGE"+(pageNum-1)+":"+chat.id})
            navLine.push({text: l[chat.lang].BACK_BUTTON, callback_data: "SETTINGS_HERE:"+chat.id})
            if(pageNum < totalPages)
                navLine.push({text: l[chat.lang].PAGE_RIGHT_BUTTON+" "+(pageNum+1), callback_data: "S_MEDIA_PAGE"+(pageNum+1)+":"+chat.id})
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

        //identify unallowed media
        if(msg.chat.type != "private"){(()=>{
            if(user.perms.media == 1) return;

            var mediaPunish = newPunishObj();
            var textPunish = newPunishObj();
            var totalPunish = newPunishObj();
            var punishList = [];

            mediaPunish = sumPunishMessageMedia(mediaPunish, punishList, chat.media, msg, mapping);
            textPunish = sumPunishEntitiesMedia(chat, msg, textPunish, punishList);

            //album handling //NOTE: a double punishment may be still applyed in case of album and unallowed text entity, this can be fixed only with some special handler to receive album to single object 
            var isAlbum = msg.hasOwnProperty("media_group_id");
            var toHandleAlbum = chat.media.hasOwnProperty("album") && isAlbum;
            if( isAlbum && !global.LGHMedia.hasOwnProperty(msg.media_group_id) )
            {
                global.LGHMedia[msg.media_group_id] = getUnixTime();
                if(toHandleAlbum)
                {
                    mediaPunish = sumPunishObj(mediaPunish, chat.media.album);
                    punishList.push("album");
                }
            }
            else if( isAlbum && global.LGHMedia.hasOwnProperty(msg.media_group_id) )
            {
                totalPunish.delete = mediaPunish.delete; //keep delete that should be fired anyway
                if(toHandleAlbum) totalPunish.delete = totalPunish.delete || chat.media.album;
                mediaPunish = newPunishObj(); //reset, because if media_group_id is already stored, punishment was already applyed
                /*album always has same media type so a correct punishment is already applyed except for video and images,
                too hard to implement a correct punishment for this single case and its anyawy a small detail*/
            }
            
            totalPunish = sumPunishObj(mediaPunish, textPunish);

            // emoji.length can me maximum 4
            if( chat.media.hasOwnProperty("emoji_video") && msg.text && msg.text.length <= 4  && emojiTable.hasOwnProperty(msg.text) && !isAlbum)
            {
                totalPunish = sumPunishObj(totalPunish, chat.media.emoji_video);
                punishList.push("emoji_video");
            }

            if( chat.media.hasOwnProperty("sticker") && msg.hasOwnProperty("sticker") && !msg.sticker.is_video && !msg.sticker.is_animated )
            {
                totalPunish = sumPunishObj(totalPunish, chat.media.sticker);
                punishList.push("sticker");
            }
            if( chat.media.hasOwnProperty("sticker_video") && msg.hasOwnPropert("sticker") && (msg.sticker.is_video || msg.sticker.is_animated) )
            {
                totalPunish = sumPunishObj(totalPunish, chat.media.sticker_video);
                punishList.push("sticker_video");
            }

            var text = msg.text || msg.caption;
            if( chat.media.hasOwnProperty("capital") && isLatin(text) && text == text.toUpperCase() )
            {
                totalPunish = sumPunishObj(totalPunish, chat.media.capital);
                punishList.push("capital");
            }
    

            if( chat.media.hasOwnProperty("scheduled") && msg.is_from_offline )
            {
                totalPunish = sumPunishObj(totalPunish, chat.media.scheduled);
                punishList.push("scheduled");
            }


            //punish
            if(totalPunish.punishment != 0)
            {
                punishList.forEach((type, index) => {
                    punishList[index] = l[chat.lang]["MEDIA:"+type];
                })
                var types = punishList.join("+");
                var reason = l[chat.lang].UNALLOWED_MEDIA_PUNISHMENT.replace("{types}", types);
                punishUser(GHbot, user.id,  msg.chat, RM.userToTarget(msg.chat, user), totalPunish.punishment, totalPunish.PTime, reason);
            }

            if(totalPunish.delete)
                GHbot.TGbot.deleteMessages(chat.id, [msg.message_id]);

        })()}

        //security guards
        if( !(msg.waitingReply && msg.waitingReply.startsWith("S_MEDIA")) ) return;
        if( msg.chat.isGroup && chat.id != msg.chat.id ) return;//additional security guard
        if( !(user.perms && user.perms.settings) ) return;

        var mediaType = false;
        if( msg.waitingReply.includes("!") )
            mediaType = msg.waitingReply.split("!")[1].split("#")[0].split(":")[0];
        
        var exhistObj = chat.media.hasOwnProperty(mediaType);

        if (msg.waitingReply.includes("STIME")) {
            if(!exhistObj) chat.media[mediaType] = newPunishObj();
            var pageCallback = msg.waitingReply.split("_PTIME")[0];
            var returnButtons = [[{ text: l[chat.lang].BACK_BUTTON, callback_data: pageCallback+":"+chat.id }]]
            var cb_prefix = msg.waitingReply.split("#")[0];
            var title = l[chat.lang].SEND_PUNISHMENT_DURATION.replace("{punishment}", punishmentToText(chat.lang, chat.media[mediaType].punishment));
            var time = ST.messageEvent(GHbot, chat.media[mediaType].PTime, msg, chat, user, cb_prefix, returnButtons, title);

            if (time != -1 && time != chat.media[mediaType].PTime) {
                chat.media[mediaType].PTime = time;
                db.chats.update(chat);
            }
        }
    
    } )


}

module.exports = main;
