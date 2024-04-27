const fs = require( "fs" );
const { usernameOrFullName, isNumber, code } = require("./utils");

if(!global.LGHTagToId) global.LGHTagToId = {};
if(!global.LGHIdToTag) global.LGHIdToTag = {};

dbInnerDir = global.directory;
TRFolder = dbInnerDir+"/database/tagResolver";

tagToIdFile = TRFolder+"/tagToId.json";
idToTagFile = TRFolder+"/idToTag.json";

function load(config) {
    if (!fs.existsSync(TRFolder))
        fs.mkdirSync(TRFolder);
    if (!fs.existsSync(tagToIdFile))
        fs.writeFileSync(tagToIdFile, JSON.stringify(global.LGHTagToId));
    if (!fs.existsSync(idToTagFile))
        fs.writeFileSync(idToTagFile, JSON.stringify(global.LGHIdToTag));

    global.LGHTagToId = JSON.parse(fs.readFileSync(tagToIdFile, "utf-8"));
    global.LGHIdToTag = JSON.parse(fs.readFileSync(idToTagFile, "utf-8"));

    setInterval(()=>{
        save()
    }, config.saveTagResolverSeconds*1000)
}

function save() {
    if (!fs.existsSync(TRFolder))
        fs.mkdirSync(TRFolder);

    fs.writeFileSync(tagToIdFile, JSON.stringify(global.LGHTagToId));
    fs.writeFileSync(idToTagFile, JSON.stringify(global.LGHIdToTag));
}

function log(user) {
    var tag = user.username || false;
    var userId = user.id || false;
    if (tag && userId) {
        global.LGHTagToId[tag] = userId;
        global.LGHIdToTag[userId] = tag;
    }
}

function logUsers(users) {
    users.forEach(user => log(user));
}

function logEntities(entities) {
    entities.forEach((entity) => {
        if (entity.hasOwnProperty("user"))
            log(entity.user);
    });
}

function logMsg(msg) {
    if (msg.hasOwnProperty("from"))
        log(msg.from);

    if (msg.hasOwnProperty("reply_to_message") && msg.reply_to_message.hasOwnProperty("from"))
        log(msg.reply_to_message.from);

    if (msg.hasOwnProperty("quote") && msg.quote.hasOwnProperty("entities"))
        logEntities(msg.quote.entities);

    if (msg.hasOwnProperty("via_bot"))
        log(msg.via_bot);

    if (msg.hasOwnProperty("entities"))
        logEntities(msg.entities);

    if (msg.hasOwnProperty("caption_entities"))
        logEntities(msg.caption_entities);

    if (msg.hasOwnProperty("new_chat_members"))
        logUsers(msg.new_chat_members);

    if (msg.hasOwnProperty("left_chat_member"))
        log(msg.left_chat_member);

    if (msg.hasOwnProperty("chat_shared") && msg.chat_shared.hasOwnProperty("users"))
        logUsers(msg.chat_shared.users);
}

function logCb(cb) {
    if (cb.hasOwnProperty("message"))
        logMsg(cb.message);
}

function logMembers(members) {
    members.forEach((member) => {
        if (!member.hasOwnProperty("user")) return;
        log(member.user);
    });
}

function getId(tag) {
    if (global.LGHTagToId.hasOwnProperty(tag))
        return global.LGHTagToId[tag];
    return false;
}

function getTag(userId) {
    if (global.LGHIdToTag.hasOwnProperty(userId))
        return global.LGHIdToTag[userId];
    return false;
}

function getCommandTargetUserId(msg) {
    if (!msg.command) return false;

    if (msg.hasOwnProperty("reply_to_message"))
        return msg.reply_to_message.from.id;

    if (msg.hasOwnProperty("entities") && msg.entities.length > 1)
        if (msg.entities[1].type == "text_mention")
            return msg.entities[1].user.id;

    if (msg.command.splitArgs && msg.command.splitArgs.length > 0) {

        var firstArg = msg.command.splitArgs[0];
        if (isNumber(firstArg) && Number(firstArg) > 99999 && Number(firstArg) < 999999999999)
            return Number(firstArg);

        var username = firstArg;
        if (firstArg.includes("t.me/"))
            username = firstArg.split("t.me/")[1];
        if (firstArg.startsWith("@"))
            username = firstArg.replace("@", "");

        return getId(username);
    }

    return msg.from.id;
}

function LGHUserNameByTarget(msg, userId) {
    var LGHUserName = msg.hasOwnProperty("reply_to_message") ?
        usernameOrFullName(msg.reply_to_message.from) + " " : (getTag(userId) ? "@" + getTag(userId) + " " : "");
    LGHUserName += "[" + code(userId) + "] ";
    return LGHUserName;
}

function storeMembers(members, db)
{
    members.forEach((member)=>{
        if(!db.users.exhist(member.user.id))
            db.users.add(member.user)
    })
}

//currently not use GHbot, getAdmins seems to be already safe
async function getAdmins(TGbot, chatId, db) {
    var adminList = await TGbot.getChatAdministrators(chatId);
    logMembers(adminList);

    //remove deleted accounts
    for (var i = 0; i < adminList.length; ++i)
        if (adminList[i].user.first_name.length == 0)
            adminList.splice(i, 1)

    if (db) storeMembers(adminList, db);

    return adminList
}

module.exports = {
    load, save,
    log, logUsers, logEntities, logMsg, logCb, logMembers,
    getId, getTag, getCommandTargetUserId,
    LGHUserNameByTarget, storeMembers, getAdmins,
};