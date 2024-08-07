var LGHelpTemplate = require("../GHbot.js");
const GH = require("../GHbot.js");
const { genPunishButtons, secondsToHumanTime, punishmentToFullText, handlePunishmentCallback, punishmentToText, getUnixTime, tag, usernameOrFullName, welcomeNewUser, unsetWaitReply, waitReplyForChat } = require("../api/utils/utils.js");
const ST = require("../api/editors/setTime.js");
const MSGMK = require( "../api/editors/MessageMaker.js" )
const { punishUser, silentPunish } = require("../api/utils/punishment.js");

const svg = require("svg-captcha");
const canvas = require("canvas");
const {Canvg, presets} = require("canvg");
const color = require("randomcolor");
const {DOMParser} = require("@xmldom/xmldom");
const fetch = require("node-fetch");
const { userToTarget } = require("../api/utils/rolesManager.js");

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


function isCaptchaExpired(id)
{
    return global.LGHCaptcha[id].within < getUnixTime();
}

/**
 * @param {GH.LibreGHelp} GHBot 
 * @param {GH.LGHDatabase} db
 * @param {GH.LGHChat} chat 
 * @param {GH.LGHUser} user 
 */
function captchaFailed(GHbot, db, chat, user)
{
    if(chat.captcha.fails)
    {
        var reason = l[chat.lang].CAPTCHA_PUNISHMENT;
        punishUser(GHbot, user.id, chat, userToTarget(chat, user), chat.captcha.punishment, chat.captcha.PTime, reason);
    }
    else
    {
        silentPunish(GHbot, user.id, chat, user.id, chat.captcha.punishment, chat.captcha.PTime);
    }

    //if punishment is warn, after the warn, captcha should be considered solved
    if(chat.captcha.punishment == 1)
    {
        captchaSuccess(GHbot, db, chat, user);
        return;
    }

    unsetWaitReply(db, user, chat, true);

    var id = chat.id+"_"+user.id;
    GHbot.TGbot.deleteMessages(chat.id, [global.LGHCaptcha[id].messageId]);
    if(global.LGHCaptcha[id]){
        GHbot.TGbot.deleteMessages(chat.id, [global.LGHCaptcha[id].messageId]);
        delete global.LGHCaptcha[id];
    }
}

/**
 * @param {GH.LibreGHelp} GHbot 
 * @param {GH.LGHDatabase} db
 * @param {GH.LGHChat} chat 
 * @param {GH.LGHUser} user 
 */
function captchaSuccess(GHbot, db, chat, user)
{
    if(chat.welcome.state)
        welcomeNewUser(GHbot, db, MSGMK, chat, user);

    unsetWaitReply(db, user, chat, true);

    var id = chat.id+"_"+user.id;
    if(global.LGHCaptcha[id]){
        GHbot.TGbot.deleteMessages(chat.id, [global.LGHCaptcha[id].messageId]);
        delete global.LGHCaptcha[id];
    }
}

//{[chatId_userId]: {messageId: msg.message_id, within: expiryUnixTimeSeconds, solution: text}}
global.LGHCaptcha = {};

function main(args)
{

    const GHbot = new LGHelpTemplate(args);
    const {TGbot, db, config} = GHbot;

    /**
     * 
     * @param {GH} GHbot 
     * @param {GH.LGHChat} chat 
     * @param {GH.LGHUser} user
     * @param {Boolean} onGroup - true if captcha should be solved on group chat ||NOTE: currently only group mode (true) is supported
     */
    async function generateCaptcha(GHbot, chat, user, onGroup)
    {
        if(chat.captcha.mode == "image")
        {            
            var captcha = await newCaptchaImage();

            var buttons = [[{text:l[chat.lang].CHANGE_IMAGE_BUTTON, callback_data:"CAPTCHA_CHANGEIMAGE:"+chat.id}]];
            var text = l[chat.lang].CAPTCHA_IMAGE_QUESTION
            .replace("{mention}", tag(usernameOrFullName(user), user.id))
            .replace("{time}",secondsToHumanTime(chat.lang, chat.captcha.time));

            var sentMsg = await GHbot.sendPhoto(user.id, chat.id, captcha.png, {caption:text, parse_mode:"HTML", reply_markup:{inline_keyboard:buttons}});
            
            var id = chat.id+"_"+user.id;
            var within = getUnixTime() + chat.captcha.time;
            var solution = captcha.text;
            global.LGHCaptcha[id] = {messageId: sentMsg.message_id, within, solution};
            
            waitReplyForChat(db, "CAPTCHA_IMAGE_GUESS", user, chat, onGroup);
        }
    }

    //clear and punish expired captchas
    setInterval(()=>{
        var keys = Object.keys(global.LGHCaptcha);
        keys.forEach((id)=>{
            if(isCaptchaExpired(id))
            {
                var chat = db.chats.get(id.split("_")[0]);
                var user = db.users.get(id.split("_")[1]);
                GHbot.TGbot.deleteMessages(chat.id, [global.LGHCaptcha[id].messageId]);
                captchaFailed(GHbot, db, chat, user);
            }
        }
    )},1000)

    //min and max settings
    var minimumTimeLimit = 5;
    var maxTimeLimit = (60*60*24)

    GHbot.onMessage( async (msg, chat, user) => {

        //handle new members
        if(chat.type != "private" && chat.captcha.state && msg.hasOwnProperty("new_chat_members")){msg.new_chat_members.forEach(async(newUser)=>{

            if(chat.captcha.once && (chat.welcome.joinList.includes(Number(newUser.id)) || chat.welcome.joinList.includes(String(newUser.id))) )
            {
                captchaSuccess(GHbot, db, chat, newUser);
                return;
            }

            generateCaptcha(GHbot, chat, newUser, msg.chat.isGroup);

        })}

        //prevent messages from users under captcha
        if(msg.waitingReply && msg.waitingReply.startsWith("CAPTCHA_"))
            GHbot.TGbot.deleteMessages(chat.id, [msg.message_id]);

        //captcha image guess
        if (msg.waitingReply && msg.waitingReply.startsWith("CAPTCHA_IMAGE_GUESS"))
        {
            var id = chat.id+"_"+user.id;
            if(!global.LGHCaptcha[id])
            {
                //generate new captcha
                generateCaptcha(GHbot, chat, user, msg.chat.isGroup);
                return;
            }
            var isCorrectSolution = msg.text && (global.LGHCaptcha[id].solution.toLowerCase() == msg.text.toLowerCase());

            if(isCorrectSolution && !isCaptchaExpired(id))
                captchaSuccess(GHbot, db, chat, user);
            else if(!isCorrectSolution)
                captchaFailed(GHbot, db, chat, user)
        }

        //security guards
        if (!msg.waitingReply) return;
        var myCallback = msg.waitingReply.startsWith("S_CAPTCHA") || msg.waitingReply.startsWith("S_CAPTCHA");
        if (!myCallback) return;
        if (msg.chat.isGroup && chat.id != msg.chat.id) return;//additional security guard
        if (!(user.perms && user.perms.settings)) return;

        //time limit
        if (msg.waitingReply.startsWith("S_CAPTCHA_TIME#STIME")) {
            var returnButtons = [[{ text: l[user.lang].BACK_BUTTON, callback_data: "S_CAPTCHA_BUTTON:" + chat.id }]]
            var cb_prefix = msg.waitingReply.split("#")[0];
            var title = l[user.lang].CAPTCHA_TIME_TITLE.replace("{punishment}", punishmentToText(user.lang, chat.captcha.punishment));
            var time = ST.messageEvent(GHbot, chat.captcha.time, msg, chat, user, cb_prefix, returnButtons, title, minimumTimeLimit, maxTimeLimit);

            if (time != -1 && time != chat.captcha.time) {
                chat.captcha.time = time;
                db.chats.update(chat);
            }
        }
        //punishment time
        if (msg.waitingReply.startsWith("S_CAPTCHA_BUTTON_PTIME#STIME")) {
            var returnButtons = [[{ text: l[user.lang].BACK_BUTTON, callback_data: "S_CAPTCHA_BUTTON:" + chat.id }]]
            var cb_prefix = msg.waitingReply.split("#")[0];
            var title = l[user.lang].SEND_PUNISHMENT_DURATION.replace("{punishment}", punishmentToText(user.lang, chat.captcha.punishment));
            var time = ST.messageEvent(GHbot, chat.captcha.PTime, msg, chat, user, cb_prefix, returnButtons, title);

            if (time != -1 && time != chat.captcha.PTime) {
                chat.captcha.PTime = time;
                db.chats.update(chat);
            }
        }

    } )

    GHbot.onCallback( async (cb, chat, user) => {

        var msg = cb.message;
        var lang = user.lang;

        var id = false;
        if(chat.isGroup && cb.data.startsWith("CAPTCHA"))
        {
            id = chat.id+"_"+user.id;
            if(!(global.LGHCaptcha.hasOwnProperty(id) && global.LGHCaptcha[id].messageId == msg.message_id))
            {
                GHbot.answerCallbackQuery(user.id, cb.id, {text:l[user.lang].NOT_YOUR_CAPTCHA,show_alert:true})
                return;
            }
        }
        /*
        currently this does not work due to node-telegram-bot-api library
        im waiting for they to approve my pull
        if (cb.data.startsWith("CAPTCHA_CHANGEIMAGE")) 
        {
            //global.LGHCaptcha[id].retryes++;
            var captcha = await newCaptchaImage();
            global.LGHCaptcha[id].solution = captcha.text;

            var buttons =  global.LGHCaptcha[id].retryes <= 3 ?
                [[{text:l[chat.lang].CHANGE_IMAGE_BUTTON, callback_data:"CAPTCHA_CHANGEIMAGE:"+chat.id}]] :  [];

            var text = l[chat.lang].CAPTCHA_IMAGE_QUESTION
            .replace("{mention}", tag(usernameOrFullName(user), user.id))
            .replace("{time}",secondsToHumanTime(chat.lang, chat.captcha.time));
            var opts = {/*reply_markup:{inline_keyboard:buttons}, chat_id:-1001699286116, message_id:9661};
            GHbot.editMessageMedia(user.id, {media:"attach://"+captcha.png.toString(),type:"photo", parse_mode:"HTML"}, opts)
        }*/

        //security guards for settings
        var myCallback = cb.data.startsWith("S_CAPTCHA");
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
            var time = ST.callbackEvent(GHbot, db, currentTime, cb, chat, user, cb_prefix, returnButtons, title)

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
            var time = ST.callbackEvent(GHbot, db, currentTime, cb, chat, user, cb_prefix, returnButtons, title, minimumTimeLimit, maxTimeLimit)

            if (time != -1 && time != currentTime) {
                chat.captcha.time = time;
                db.chats.update(chat);
            }
        }
    })

}

module.exports = main;
