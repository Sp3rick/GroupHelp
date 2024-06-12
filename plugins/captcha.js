var LGHelpTemplate = require("../GHbot.js");
const { genPunishButtons, bold, secondsToHumanTime, punishmentToFullText, handlePunishmentCallback, punishmentToText } = require("../api/utils.js");
const ST = require("../api/editors/setTime.js");

const svg = require("svg-captcha");
const canvas = require("canvas");
const {Canvg, presets} = require("canvg");
const color = require("randomcolor");
const {DOMParser} = require("@xmldom/xmldom");
const fetch = require("node-fetch");

l = global.LGHLangs; //importing langs object

function captchaModeToText(lang, mode)
{
    if(mode == "image")
        return l[lang].IMAGE;
}

function captchaModeToDescription(lang, mode)
{
    if(mode == "image")
        return l[lang].IMAGE_DESCRIPTION;
}

/**
 * @typedef {Object} newCaptchaImageReturn
 * @property {string} text - Text to solve the captcha
 * @property {Buffer} png - Buffer png image of captcha
 */
/**
 * @returns {Promise<newCaptchaImageReturn>}
 */
async function newCaptchaImage()
{
    //create svg
    //svg.loadFont(__dirname+"/../api/captcha/fonts/sofiaregularcaptcha.otf"); without this font seems to have better anti-ocr results currenly
    var captchaOpts = {
        ignoreChars: 'abcdefghijklmnopqrstuvwxyzJ1IGS5KHXQ',
        noise: 60,
        width: 600,
        height: 300,
        fontSize: 100,
        color: "#66ff33",
        background: "#0099ff",
    };
    /*
    easy mode:
    var captchaOpts = {
        ignoreChars: 'abcdefghijklmnopqrstuvwxyzJ1IGS5KHXQ',
        noise: 40,
        width: 600,
        height: 300,
        fontSize: 144,
        color: "#66ff33",
        background: "#0099ff",
    };
     */
    var captcha = svg.create(captchaOpts);

    //render to png
    var preset = presets.node({
        DOMParser,
        canvas,
        fetch
    });
    var captchaCanvas = preset.createCanvas(350, 150);
    var ctx = captchaCanvas.getContext("2d");
    var v = Canvg.fromString(ctx, captcha.data, preset);
    await v.render();
    var png = captchaCanvas.toBuffer();

    return {text: captcha.text, png};
}

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    //here your plugin code//

    var minimumTimeLimit = 5;
    var maxTimeLimit = (60*60*24)

    GHbot.onMessage( (msg, chat, user) => {

        if(chat.type != "private"){(async () => {

            /*var captcha = await newCaptchaImage();
            

            GHbot.TGbot.sendPhoto(msg.chat.id, captcha.png, {caption:"Text to send " + captcha.text});*/

        })()}

        //security guards
        if (!(user.waitingReply)) return;
        var myCallback = user.waitingReplyType.startsWith("S_CAPTCHA");
        if (!myCallback) return;
        if (msg.chat.isGroup && chat.id != msg.chat.id) return;//additional security guard
        if (!(user.perms && user.perms.settings)) return;

        //time limit
        if (user.waitingReplyType.startsWith("S_CAPTCHA_TIME#STIME")) {
            var returnButtons = [[{ text: l[user.lang].BACK_BUTTON, callback_data: "S_CAPTCHA_BUTTON:" + chat.id }]]
            var cb_prefix = user.waitingReplyType.split("#")[0];
            var title = l[user.lang].CAPTCHA_TIME_TITLE.replace("{punishment}", punishmentToText(user.lang, chat.captcha.punishment));
            var time = ST.messageEvent(GHbot, chat.captcha.time, msg, msg.chat, user, cb_prefix, returnButtons, title, minimumTimeLimit, maxTimeLimit);

            if (time != -1 && time != chat.captcha.time) {
                chat.captcha.time = time;
                db.chats.update(chat);
            }
        }

        //punishment time
        if (user.waitingReplyType.startsWith("S_CAPTCHA_BUTTON_PTIME#STIME")) {
            var returnButtons = [[{ text: l[user.lang].BACK_BUTTON, callback_data: "S_CAPTCHA_BUTTON:" + chat.id }]]
            var cb_prefix = user.waitingReplyType.split("#")[0];
            var title = l[user.lang].SEND_PUNISHMENT_DURATION.replace("{punishment}", punishmentToText(user.lang, chat.captcha.punishment));
            var time = ST.messageEvent(GHbot, chat.captcha.PTime, msg, msg.chat, user, cb_prefix, returnButtons, title);

            if (time != -1 && time != chat.captcha.PTime) {
                chat.captcha.PTime = time;
                db.chats.update(chat);
            }
        }

    } )

    GHbot.onCallback((cb, chat, user) => {

        var msg = cb.message;
        var lang = user.lang;

        var myCallback = cb.data.startsWith("S_CAPTCHA");

        //security guards for settings
        if(!chat.isGroup) return;
        if (!myCallback) return;
        if (!(user.perms && user.perms.settings)) return;
        if (cb.chat.isGroup && chat.id != cb.chat.id) return;

        //punishment
        if (cb.data.startsWith("S_CAPTCHA_BUTTON_P_")) {
            var toSetPunishment = handlePunishmentCallback(GHbot, cb, user.id, chat.captcha.punishment);
            console.log("toSetPunishment: " + toSetPunishment)
            if (toSetPunishment == chat.captcha.punishment) return;
            else { chat.captcha.punishment = toSetPunishment; db.chats.update(chat) };
        }
        if (cb.data.startsWith("S_CAPTCHA_BUTTON_PTIME#STIME")) {
            var returnButtons = [[{ text: l[lang].BACK_BUTTON, callback_data: "S_CAPTCHA_BUTTON:" + chat.id }]]
            var cb_prefix = cb.data.split("#")[0];
            var currentTime = chat.captcha.PTime;
            var title = l[lang].SEND_PUNISHMENT_DURATION.replace("{punishment}", punishmentToText(lang, chat.captcha.punishment));
            var time = ST.callbackEvent(GHbot, db, currentTime, cb, cb.chat, user, cb_prefix, returnButtons, title)

            if (time != -1 && time != currentTime) {
                chat.captcha.PTime = time;
                db.chats.update(chat);
            }
            return;
        }

        if (cb.data.startsWith("S_CAPTCHA_BUTTON_ONCE"))
        {
            chat.captcha.once = !chat.captcha.once;
            db.chats.update(chat);
        }

        if (cb.data.startsWith("S_CAPTCHA_BUTTON_STATUS"))
        {
            chat.captcha.state = !chat.captcha.state;
            db.chats.update(chat);
        }

        if (cb.data.startsWith("S_CAPTCHA_MODE"))
        {
            GHbot.answerCallbackQuery(user.id, cb.id, {text:l[lang].MODE_IMAGE_ONLY,show_alert:true})
        }

        if (cb.data.startsWith("S_CAPTCHA_BUTTON_FAILS"))
        {
            chat.captcha.fails = !chat.captcha.fails;
            db.chats.update(chat);
        }

        //captcha menu
        if (cb.data.startsWith("S_CAPTCHA_BUTTON")) {

            var statusButton = chat.captcha.state ? l[lang].TURN_OFF2_BUTTON : l[lang].ACTIVATE_BUTTON;
            var notifyFailsButton  = l[lang].FAILED_CAPTCHA_MESSAGE_BUTTON + (chat.captcha.fails ? " ✔️" : " ✖️");

            var punishButtons = genPunishButtons(lang, chat.captcha.punishment, "S_CAPTCHA_BUTTON", chat.id, false);
            punishButtons[0] = punishButtons[0].slice(1, 3);

            var text = l[lang].CAPTCHA_DESCRIPTION.replace("{state}",chat.captcha.state ? l[lang].ON : l[lang].OFF)
            .replace("{time}", secondsToHumanTime(lang, chat.captcha.time))
            .replace("{punishment}", punishmentToFullText(lang, chat.captcha.punishment, chat.captcha.PTime, false))
            .replace("{mode}", captchaModeToText(lang, chat.captcha.mode))
            .replace("{modeDescription}", captchaModeToDescription(lang, chat.captcha.mode))
            .replace("{fails}", chat.captcha.fails ? l[lang].ON_BUTTON : l[lang].OFF_BUTTON)
            .replace("{once}", chat.captcha.once ? l[lang].CAPTCHA_SEND_ONCE : l[lang].CAPTCHA_SEND_EVERYTIME)

            GHbot.editMessageText(user.id, text, {
                message_id: msg.message_id,
                chat_id: cb.chat.id,
                parse_mode: "HTML",
                reply_markup:
                {
                    inline_keyboard:
                        [[{text: statusButton, callback_data: "S_CAPTCHA_BUTTON_STATUS:" + chat.id }],
                        [{text: l[lang].MODE_BUTTON, callback_data: "S_CAPTCHA_MODE:" + chat.id }],
                        [{text: l[lang].CAPTCHA_TIME_BUTTON, callback_data: "S_CAPTCHA_TIME#STIME:" + chat.id }, {text: l[lang].FIRSTJOIN_SEND_BUTTON, callback_data: "S_CAPTCHA_BUTTON_ONCE:"+chat.id}],
                        [{text: notifyFailsButton, callback_data: "S_CAPTCHA_BUTTON_FAILS:" + chat.id }]]
                        .concat(punishButtons)
                        .concat([[{text: l[lang].BACK_BUTTON, callback_data: "SETTINGS_HERE:" + chat.id }]])
                }
            })
            GHbot.answerCallbackQuery(user.id, cb.id);

        }

        //captcha time
        if (cb.data.startsWith("S_CAPTCHA_TIME#STIME")) {
            var returnButtons = [[{ text: l[lang].BACK_BUTTON, callback_data: "S_CAPTCHA_BUTTON:" + chat.id }]]
            var cb_prefix = cb.data.split("#")[0];
            var currentTime = chat.captcha.time;
            var title = l[lang].CAPTCHA_TIME_TITLE.replace("{punishment}", punishmentToText(lang, chat.captcha.punishment));
            var time = ST.callbackEvent(GHbot, db, currentTime, cb, cb.chat, user, cb_prefix, returnButtons, title, minimumTimeLimit, maxTimeLimit)

            if (time != -1 && time != currentTime) {
                chat.captcha.time = time;
                db.chats.update(chat);
            }
        }
    })

}

module.exports = main;
