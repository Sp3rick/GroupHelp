const {genUserList, bold, isString, anonymizeAdmins, LGHUserName, loadChatUserId, isAdminOfChat} = require("./utils.js");
l = global.LGHLangs;

//Roles with string name is intended as a pre-made role
//pre-made roles chat.roles[role] will contain only "users" array, data about the role are stored on global.roles[role]
//TODO: add admin role that's the role given automaticallywith custom permissions based on telegram permissions bindings
//So a function to convert telegram permissions to our customPerms object


/** 
 * @typedef {Object} customPerms
 * @property {Array} commands - Array of allowed commands
 * @property {1|0|-1} immune - disallow from punish this user
 * @property {1|0|-1} flood - permission to flood messages
 * @property {1|0|-1} link - permission to send link
 * @property {1|0|-1} tgLink - permission to send telegram links/usernamess
 * @property {1|0|-1} forward - permission to forward messages from anywhere
 * @property {1|0|-1} quote - permission to quote from anywhere
 * @property {1|0|-1} porn - bypass porn/gore checks
 * @property {1|0|-1} night - bypass any night mode  limitation
 * @property {1|0|-1} media - bypass any media limitation
 * @property {1|0|-1} roles - permission to change roles of lower level users
 * @property {1|0|-1} settings - permission to change bot group settings
 */

/** 
 * @typedef {Object} userStatus
 * @property {customPerms} perms - customPerms object for all user-specific permissions
 * @property {Array<String|Number>} roles - array user roles, string for pre-made roles, number for custom roles (user-made)
 * @property {customPerms} adminPerms - customPerms object for user permissions if admin
 * @property {String} title - user administrator title
 */

/** 
 * @typedef {Object} GHRole
 * @property {String} name - role name
 * @property {customPerms} perms - customPerms object applyed at lowest priority on any user in this role
 * @property {Array<Number|String>} users - array of userId in this role
 */

/**
 * @typedef {Object<string, GHRole>} GHRoles
 * @description Object representing a list of roles, the numeral keys means custom role, the named keys means pre-made role
 */

/**
 * 
 * @return {customPerms}
 *      Get a default customPerms object
 */
function newPerms(commands, immune, flood, link, tgLink, forward, quote, porn, night, media, roles, settings)
{
    commands = commands || [];
    immune = immune || 0;
    flood = flood || 0;
    link = link || 0;
    tgLink = tgLink || 0;
    forward = forward || 0;
    quote = quote || 0;
    porn = porn || 0;
    night = night || 0;
    media = media || 0;
    roles = roles || 0;
    settings = settings || 0;
    
    immune = (immune === false) ? -1 : immune;
    flood = (flood === false) ? -1 : flood;
    link = (link === false) ? -1 : link;
    tgLink = (tgLink === false) ? -1 : tgLink;
    forward = (forward === false) ? -1 : forward;
    quote = (quote === false) ? -1 : quote;
    porn = (porn === false) ? -1 : porn;
    night = (night === false) ? -1 : night;
    media = (media === false) ? -1 : media;
    roles = (roles === false) ? -1 : roles;
    settings = (settings === false) ? -1 : settings;


    var defaultPermissions = {
        commands: commands,
        immune: immune,
        flood: flood,
        link: link,
        tgLink: tgLink,
        forward: forward,
        quote: quote,
        porn: porn,
        night : night,
        media: media,
        roles : roles,
        settings: settings,
    }
    
    return defaultPermissions;
}

/**
 * 
 * @return {GHRole}
 *      Get a default GHRole object
 */
function newRole(name, emoji, level, perms, users)
{
    name = name || "role";
    (emoji === false) ? "👤" : emoji; emoji = emoji || "👤";
    (level === false) ? 0 : level; level = level || 0;
    perms = perms || newPerms();
    users = users || [];

    var defualtRole = {
        name: name,
        emoji: emoji,
        level: level,
        perms: perms,
        users: users,
    }

    return defualtRole;
}

/**
 * 
 * @return {GHRoles}
 *      Get a GHRoles object for pre-made roles that's already set (on global.roles)
 *      if you get it, only roles[role].users should be useful, perms and name data should be took from global role
 */
function newPremadeRolesObject()
{
    var roles = {};
    var rolesList = getPremadeRoles();

    rolesList.forEach((role)=>{
        roles[role] = {users: []};
    })

    return roles;
}

/**
 * 
 * @return {userStatus}
 *      Get a default userStatus object
 */
function newUser(user, perms, adminPerms, roles, title)
{   
    perms = perms || newPerms();
    adminPerms = adminPerms || newPerms();
    roles = roles || [];
    title = title || "";

    var userData = {
        firstJoin: false,
        perms: perms,
        adminPerms: adminPerms,
        roles: roles,
        title: title,
    }

    return userData
}

function getUserRoles(chat, userId)
{
    return chat.users[userId].roles;
}

function getRoleUsers(chat, role)
{
    return chat.roles[role].users;
}

function getUserPerms(chat, userId)
{
    return chat.users[userId].perms;
}

function getAdminPerms(chat, userId)
{
    return chat.users[userId].adminPerms;
}

function getUserLevel(chat, userId)
{
    if(!chat.users.hasOwnProperty(userId)) return 0;
    var roles = chat.users[userId].roles

    var level = 0;
    roles.forEach(role=>{
        var roleLevel = getRoleLevel(role, chat);
        if(roleLevel > level)
            level = roleLevel;
    })

    return level;
}

function getRolePerms(role, chat) //Chat required only if role is number (custom role)
{
    if(isString(role))
        return global.roles[role].perms
    return chat.roles[role].perms
}

function getRoleName(role, lang, chat) //Chat required only if role is number (custom role)
{
    if(isString(role))
        return l[lang][global.roles[role].name]
    return chat.roles[role].name
}

function getRoleEmoji(role, chat) //Chat required only if role is number (custom role)
{
    if(isString(role))
        return global.roles[role].emoji
    return chat.roles[role].emoji
}

function getRoleLevel(role, chat)  //Chat required only if role is number (custom role)
{
    if(isString(role))
        return global.roles[role].level
    return chat.roles[role].level
}

function getPremadeRoles()
{
    return Object.keys(global.roles);
}

function getChatRoles(chat)
{
    return Object.keys(chat.roles);
}

function getFullRoleName(role, lang, chat)
{
    return getRoleEmoji(role, chat)+" "+getRoleName(role, lang, chat);
}

//Delete every role reference
function deleteRole(chat, role)
{
    delete chat.roles[role];

    var users = Object.keys(chat.users)
    users.forEach((userId)=>{
        chat.users[userId].roles = chat.users[userId].roles.filter(value=>value!=role);
    })

    return chat;
}

function deleteUser(chat, userId)
{
    delete chat.users[userId];

    var roles = Object.keys(chat.roles)
    roles.forEach((role)=>{
        chat.roles[role].users = chat.roles[role].users.filter(value=>value!=userId);
    })

    return chat;
}

function forgotUser(chat, userId)
{
    getChatRoles(chat).forEach((role)=>{
        if(getRoleUsers(chat, role).includes(userId)) unsetRole(chat, userId, role);
    })

    Object.keys(chat.users).forEach((curUserId)=>{if(curUserId == userId) delete chat.users[userId]});
    chat.admins.forEach((admin, index)=>{if(admin.user.id == userId) delete chat.admins[index]});

    var WJIndex = chat.welcome.joinList.indexOf(Number(userId));
    if(WJIndex == -1) chat.welcome.joinList.indexOf(String(userId));
    chat.welcome.joinList.splice(WJIndex, 1);

    return chat;
}

function renameRole(role, chat, newName) //Premade roles can't be renamed
{

}

function changeRoleEmoji(role, chat, newName) //Premade roles can't change emoji
{

}

//Set role to user
function setRole(chat, userId, role)
{

    if(!chat.roles.hasOwnProperty(role)) //this if should run only if it is a pre-made role
        chat.roles[role] = {users:[]};

    if(!chat.users.hasOwnProperty(userId))
        chat.users[userId] = newUser();

    if(!chat.users[userId].roles.includes(role))
        chat.users[userId].roles.push(role);

    if(!chat.roles[role].users.includes(userId))
        chat.roles[role].users.push(userId);

    return chat;
}

//Remove role from user
function unsetRole(chat, userId, role)
{
    var roleIndex = chat.users[userId].roles.indexOf(role);
    chat.users[userId].roles.splice(roleIndex, 1);

    var userIndex = chat.roles[role].users.indexOf(userId);
    chat.roles[role].users.splice(userIndex, 1);

    return chat;
}

//add user to the chat
function addUser(chat, user)
{
    chat.users[user.id] = newUser(user);

    //restore roles that user may already have
    var userRoles = [];
    getChatRoles(chat).forEach((role)=>{
        var roleUsers = getRoleUsers(chat, role);     
        if(roleUsers.includes(user.id))
            userRoles.push(role);   
    })
    chat.users[user.id].roles = userRoles;

    return chat;
}

//admin translation management
function adminToPerms(admin)
{
    //NOTE: other permissions may be avaiable for every admin on chat.adminPerms
    var perms = newPerms();
    var restrictCommands = ["COMMAND_WARN","COMMAND_UNWARN","COMMAND_KICK","COMMAND_MUTE","COMMAND_UNMUTE","COMMAND_BAN","COMMAND_UNBAN"]
    var promoteCommands = ["COMMAND_FREE", "COMMAND_HELPER", "COMMAND_ADMINISTRATOR", "COMMAND_UNFREE", "COMMAND_UNHELPER", "COMMAND_UNADMINISTRATOR"]
    var promoteAndRestrictCommands = ["COMMAND_MUTER", "COMMAND_MODERATOR", "COMMAND_UNMUTER", "COMMAND_UNMODERATOR"]
    var promoteAndDeleteCommands = ["COMMAND_CLEANER", "COMMAND_UNCLEANER"]

    if(admin.status != "administrator")return perms;

    if(admin.can_manage_chat)
        perms = newPerms(["@COMMAND_ME"],1,1,1,1,1,1,1,1,1);
    if(admin.can_delete_messages)
        perms.commands.push("COMMAND_DELETE");
    if(admin.can_restrict_members)
        restrictCommands.forEach(c=>perms.commands.push(c));
    if(admin.can_promote_members)
        {perms.roles = 1; promoteCommands.forEach(c=>perms.commands.push(c));}
    if(admin.can_change_info)
        {perms.commands.push("COMMAND_SETTINGS");perms.settings=1};
    if(admin.can_pin_messages)
        perms.commands.push("COMMAND_PIN");

    if(admin.can_promote_members && admin.can_restrict_members)
        promoteAndRestrictCommands.forEach(c=>perms.commands.push(c));

    if(admin.can_promote_members && admin.can_delete_messages)
        promoteAndDeleteCommands.forEach(c=>perms.commands.push(c));
    
    return perms;

}
function reloadAdmins(chat, admins)
{
    //clear adminPerms for every user
    var emptyPerms = newPerms();
    var chatUsers = Object.keys(chat.users);
    chatUsers.forEach(userId=>{chat.users[userId].adminPerms = emptyPerms});

    //acutally loads admins
    admins.forEach(member=>{

        var userId = member.user.id
        if(!chat.users.hasOwnProperty(userId)){
            chat.users[userId] = newUser(member.user);
}
        if(member.status == "creator")
            chat = setRole(chat, userId, "founder");
        if(member.status == "administrator")
            chat.users[userId].adminPerms = adminToPerms(member);

        if(member.custom_title)
            chat.users[userId].title = member.custom_title;
        else if(chat.users[userId].hasOwnProperty("title"))
            delete chat.users[userId].title;

    })

    //store basic object
    var anonAdminList = anonymizeAdmins(admins)
    chat.admins = anonAdminList;

    return chat;
}

/**
 * @param {customPerms} perms1 - higest priority permission
 * @param {customPerms} perms2 - lower priority permission
 * @return {customPerms}
 *      Sum two permissions object to get a single permission result
 */
function sumPermsPriority(perms1, perms2)
{

    var commands = [];
    perms1.commands.forEach(command => {commands.push(command)});
    perms2.commands.forEach(command => {commands.push(command)});
    commands = commands.filter((item,pos)=>{return commands.indexOf(item)==pos}) //remove duplicates

    var immune, flood, link, tgLink, forward, quote, porn, night, media, roles, settings;

    immune = (perms1.immune == 0) ? perms2.immune : perms1.immune; //if perms1 is neutral inherit from second
    flood = (perms1.flood == 0) ? perms2.flood : perms1.flood;
    link = (perms1.link == 0) ? perms2.link : perms1.link;
    tgLink = (perms1.tgLink == 0) ? perms2.tgLink : perms1.tgLink;
    forward = (perms1.forward == 0) ? perms2.forward : perms1.forward;
    quote = (perms1.quote == 0) ? perms2.quote : perms1.quote;
    porn = (perms1.porn == 0) ? perms2.porn : perms1.porn;
    night = (perms1.night == 0) ? perms2.night : perms1.night;
    media = (perms1.media == 0) ? perms2.media : perms1.media;
    roles = (perms1.roles == 0) ? perms2.roles : perms1.roles;
    settings = (perms1.settings == 0) ? perms2.settings : perms1.settings;

    return newPerms(commands, immune, flood, link, tgLink, forward, quote, porn, night, media, roles, settings)

}
function orderRolesByPriority(roles, chat) //Chat required only if role is number (custom role)
{
    chat = chat || 0;

    //.concat() to prevent shallow copy
    //order from smaller role level to bigger
    var newRoles = roles.concat().sort((role1, role2) => {
        var role1Level = getRoleLevel(role1, chat);
        var role2Level = getRoleLevel(role2, chat);
        return role1Level - role2Level;
    })

    return newRoles;
}
/**
 * @return {customPerms}
 *      Get complete object of effective user permissions counting her roles
 */
function sumUserPerms(chat, userId)
{

    //calculating user permissions//
    var perms = chat.basePerms;
    if(isAdminOfChat(chat, userId))
    {
        var baseAdminPerms = chat.adminPerms;
        perms = sumPermsPriority(baseAdminPerms, perms);
    }

    if(!chat.users.hasOwnProperty(userId))
        return perms;
    var roles = orderRolesByPriority(chat.users[userId].roles, chat);
    roles.forEach((role)=>{
        var rolePerms = getRolePerms(role);
        perms = sumPermsPriority(rolePerms, perms);
    })

    var adminPerms = getAdminPerms(chat, userId);
    perms = sumPermsPriority(adminPerms, perms);

    //higher priority calculation
    var userPerms = getUserPerms(chat, userId);
    perms = sumPermsPriority(userPerms, perms);


    //additional permissions//
    //add warn permission if correlated to punishment
    if(!perms.commands.includes("COMMAND_WARN"))
    {
        if(chat.warns.punishment == 2 && perms.commands.includes("COMMAND_KICK"))
            perms.commands.push("COMMAND_WARN")
        if(chat.warns.punishment == 3 && perms.commands.includes("COMMAND_MUTE"))
            perms.commands.push("COMMAND_WARN")
        if(chat.warns.punishment == 4 && perms.commands.includes("COMMAND_BAN"))
            perms.commands.push("COMMAND_WARN")
    }
    if(!perms.commands.includes("COMMAND_UNWARN"))
    {
        if(chat.warns.punishment == 3 && perms.commands.includes("COMMAND_UNMUTE"))
            perms.commands.push("COMMAND_UNWARN")
        if(chat.warns.punishment == 4 && perms.commands.includes("COMMAND_UNBAN"))
            perms.commands.push("COMMAND_UNWARN")
    }

    //add mixed commands
    if(perms.commands.includes("COMMAND_DELETE"))
    {
        if(perms.commands.includes("COMMAND_WARN"))
            perms.commands.push("COMMAND_DELWARN")
        if(perms.commands.includes("COMMAND_KICK"))
            perms.commands.push("COMMAND_DELKICK")
        if(perms.commands.includes("COMMAND_MUTE"))
            perms.commands.push("COMMAND_DELMUTE")
        if(perms.commands.includes("COMMAND_BAN"))
            perms.commands.push("COMMAND_DELBAN")
    }

    return perms;

}


////////////////////
/**
 * @typedef {import('../GHbot.js').LGHChat} LGHChat
 */
/**
 * @param {LGHChat} chat
 */
function genStaffListMessage(lang, chat, db)
{

    var text = bold(l[lang].GROUP_STAFF.toUpperCase())+"\n\n";

    var rolesList = orderRolesByPriority(getChatRoles(chat), chat).reverse();
    rolesList.forEach(roleKey=>{

        if(getRoleUsers(chat, roleKey).length == 0) return;

        text += bold(getFullRoleName(roleKey, lang, chat));

        text+="\n";

        var userIds = getRoleUsers(chat, roleKey);
        text += genUserList(userIds, chat, db);

        text+="\n";
        
    })

    var adminIds = [];
    chat.admins.forEach(admin=>{
        if(admin.status == "creator") return;
        if(admin.is_anonymous) return;
        adminIds.push(admin.user.id);
    })
    if(adminIds.length != 0)
    {
        text+="👮🏼"+bold(l[lang].ADMINISTRATOR)+"\n";
        text += genUserList(adminIds, chat, db);
    }

    return text;

}

function userToTarget(chat, user)
{
    var id = user.id;
    var name = LGHUserName(user);
    var perms = sumUserPerms(chat, user.id)

    return {id, name, perms, user};
}

function userIdToTarget(TGbot, chat, userId, db)
{  
    var tookUser = db.users.get(userId);
    if(!tookUser) tookUser = loadChatUserId(TGbot, chat.id, userId, db);
    if(!tookUser) tookUser = {id:userId};

    targetName = LGHUserName(tookUser);
    var targetPerms = sumUserPerms(chat, userId);

    return {id:userId, name: targetName, perms: targetPerms, user: tookUser};
}

module.exports = {
    newPerms, newRole, newUser, newPremadeRolesObject,
    getUserRoles, getRoleUsers, getUserPerms, getAdminPerms, getUserLevel, getRolePerms, getRoleName, getRoleEmoji, getRoleLevel, getPremadeRoles, getChatRoles, getFullRoleName,
    deleteRole, deleteUser, forgotUser, renameRole, changeRoleEmoji,
    setRole, unsetRole, addUser,
    adminToPerms, reloadAdmins, sumPermsPriority, orderRolesByPriority, sumUserPerms,
    genStaffListMessage, userToTarget, userIdToTarget
}
