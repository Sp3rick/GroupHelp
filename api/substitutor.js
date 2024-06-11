const { LGHUserName, tag, isNumber, replaceLast } = require("./utils");
const cp = require("./cryptoPrices");
const TelegramBot = require("node-telegram-bot-api");
const GH = require("../GHbot.js");

l = global.LGHLangs;

function includesTopNumber(text) {
    const regex = /\{TOP([1-9]|[1-9][0-9]{1,2}|2000)\}/g;
    return regex.test(text);
}

function hasSubstitution(text, prefix) {
    const regex = new RegExp(`\\{${prefix.toUpperCase()}(:\\d+|:\\w+)?\\}`);
    var result = regex.test(text)
    return result;
}

/**
 * @param {string} text 
 * @param {GH.LGHUser} user 
 * @param {GH.LGHChat} chat 
 * @param {GH.LGHDatabase} db 
 * @returns {string}
 */
function substitute(text, user, chat, db)
{

    user = user || false;
    chat = chat || false;

    if(user)
    {
        var nameSurname = user.first_name+(user.last_name? " "+user.last_name : "");
        var surname = user.last_name || "{SURNAME}";
        var username = user.username ? "@"+user.username : "{USERNAME}";
        var lang = user.lang || chat.lang;
        text = text
        .replaceAll("{ID}",user.id)
        .replaceAll("{NAME}",user.first_name)
        .replaceAll("{SURNAME}",surname)
        .replaceAll("{NAMESURNAME}",nameSurname)
        .replaceAll("{GHNAME}",LGHUserName(user, db))
        .replaceAll("{USERNAME}",username)
        .replaceAll("{MENTION}",tag(nameSurname, user.id))
        .replaceAll("{LANG}",l[lang].LANG_SHORTNAME)
        .replaceAll("{FLAG}",l[lang].FLAG)
    }
    if(chat)
    {
        var username = chat.username ? "@"+chat.username : "{GROUPUSERNAME}";
        text = text
        .replaceAll("{GROUPNAME}",chat.title)
        .replaceAll("{GROUPUSERNAME}",username)
        .replaceAll("{GROUPID}",chat.id)
    }

    if(!cp.isAvaiable())
        return text;

    //set {TOP????} symbol
    while(includesTopNumber(text))
    {
        var number = text.split("{TOP")[1].split("}")[0];
        if(isNumber(number) && number <= 2000)
            text = text.replace("{TOP"+number+"}", cp.getTop(Number(number)).symbol)
        else
            text = text.replace("{TOP"+number+"}", "")
    }

    //set symbols to crypto
    cp.getCoinList().forEach((symbol)=>{
        if(symbol != "BTC") return;
        while(hasSubstitution(text, symbol))
        {
            var opts = text.split("{"+symbol)[1].split("}")[0];
            var sub = "{"+symbol+opts+"}";

            //set currency
            var currency = chat.currency;
            var [beforeSub, ...afterSub] = text.split(sub);
            afterSub = afterSub.join(sub);
            if(beforeSub.endsWith("$"))
            {
                currency = "USD";
                beforeSub = replaceLast(beforeSub, "$", "");
            }
            else if(beforeSub.endsWith("€"))
            {
                currency = "EUR";
                beforeSub = replaceLast(beforeSub, "€", "");
            }
            else if(beforeSub.endsWith("£"))
            {
                currency = "GBP";
                beforeSub = replaceLast(beforeSub, "£", "");
            }
            else if(beforeSub.endsWith("CHF"))
            {
                currency = "CHF";
                beforeSub = replaceLast(beforeSub, "CHF", "");
            }
            else if(beforeSub.endsWith("₣"))
            {
                currency = "CHF";
                beforeSub = replaceLast(beforeSub, "₣", "");
            }
            else currency = "USD";

            text = beforeSub+sub+afterSub;

            //set acutal value
            if(opts.startsWith(":CAP"))
                text = text.replace(sub, cp.getCoinCap(symbol, currency))
            else if(opts.startsWith(":VOL"))
                text = text.replace(sub, cp.getCoinVol(symbol, currency))
            else if(opts.startsWith(":SUPPLY"))
                text = text.replace(sub, cp.getCoinSupply(symbol))
            else if(opts.startsWith(":RANK"))
                text = text.replace(sub, cp.getCoin(symbol).rank)
            else if(opts.startsWith(":NAME"))
                text = text.replace(sub, cp.getCoin(symbol).name)
            else if(opts.startsWith(":EXPLORER"))
                text = text.replace(sub, cp.getCoin(symbol).explorer)
            else if(opts.length == 0)
                text = text.replace(sub, cp.getCoinPrice(symbol, currency));
            else
                text = text.replace(sub, "");
        }
    })
    


    return text;
}

module.exports = {substitute};