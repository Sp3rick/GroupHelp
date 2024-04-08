const {isString, usernameOrFullName} = require("./utils.js");

//Roles with string name is intended as a pre-made role
//pre-made roles chat.roles[role] will contain only "users" array, data about the role are stored on global.roles[role]
//TODO: add admin role that's the role given automaticallywith custom permissions based on telegram permissions bindings
//So a function to convert telegram permissions to our customPerms object


/** 
 * @typedef {Object} customPerms
 * @property {Array} commands - Array of allowed commands
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
 * @property {Number} warnCount - number of user warns
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
function newPerms(commands, flood, link, tgLink, forward, quote, porn, night, media, roles, settings)
{
    commands = commands || [];
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
    
    flood = (flood === false) ? -1 : flood;
    link = (link === false) ? -1 : link;
    tgLink = (tgLink === false) ? -1 : tgLink;
    forward = (forward === false) ? -1 : forward;
    quote = (quote === false) ? -1 : quote;
    porn = (porn === false) ? -1 : porn;
    night = (night === false) ? -1 : night;
    roles = (roles === false) ? -1 : roles;
    settings = (settings === false) ? -1 : settings;


    var defaultPermissions = {
        commands: commands,
        flood: flood,
        link: link,
        tgLink: tgLink,
        forward: forward,
        quote: quote,
        porn: porn,
        night : night,
        media: media,
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
        level: 0,
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
function newUser(user, perms, adminPerms, roles, warnCount, fullName, title)
{
    
    if(user) fullName = usernameOrFullName(user);
    
    perms = perms || newPerms();
    adminPerms = adminPerms || newPerms();
    roles = roles || [];
    warnCount = warnCount || 0;
    fullName = fullName;
    title = title || "";

    var userData = {
        perms: perms,
        adminPerms: adminPerms,
        roles: roles,
        warnCount: warnCount,
        fullName : fullName,
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

function getRoleName(role, chat) //Chat required only if role is number (custom role)
{
    if(isString(role))
        return global.roles[role].name
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

function renameRole(role, chat, newName) //Premade roles can't be renamed
{

}

function changeRoleEmoji(role, chat, newName) //Premade roles can't change emoji
{

}

//Set role to user
function setRole(chat, userId, role)
{
    chat.users[userId].roles.push(role);

    //this if should run only if it is a pre-made role
    if(!chat.roles.hasOwnProperty(role))
        chat.roles[role] = {users:[]};

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

function adminToPerms(admin)
{

    var perms = newPerms();
    var restrictCommands = ["COMMAND_WARN","COMMAND_KICK","COMMAND_MUTE","COMMAND_BAN"]

    if(admin.status != "administrator")return perms;

    if(admin.can_manage_chat)
        perms = newPerms(["COMMAND_PERMS", "COMMAND_STAFF", "COMMAND_RULES"],1,1,1,1,1,1,1,1,0);
    if(admin.can_delete_messages)
        perms.commands.push("COMMAND_DELETE");
    if(admin.can_restrict_members)
        restrictCommands.forEach(c=>perms.commands.push(c));
    if(admin.can_promote_members)
        perms.roles = 1;
    if(admin.can_change_info)
        {perms.commands.push("COMMAND_SETTINGS");perms.settings=1};
    if(admin.can_pin_messages)
        perms.commands.push("COMMAND_PIN");
    
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

    })

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

    var flood, link, tgLink, forward, quote, porn, night, media, roles, settings;

    flood = (perms1.flood == 0) ? perms2.flood : perms1.flood; //if perms1 is neutral inherit from second
    link = (perms1.link == 0) ? perms2.link : perms1.link;
    tgLink = (perms1.tgLink == 0) ? perms2.tgLink : perms1.tgLink;
    forward = (perms1.forward == 0) ? perms2.forward : perms1.forward;
    quote = (perms1.quote == 0) ? perms2.quote : perms1.quote;
    porn = (perms1.porn == 0) ? perms2.porn : perms1.porn;
    night = (perms1.night == 0) ? perms2.night : perms1.night;
    media = (perms1.media == 0) ? perms2.media : perms1.media;
    roles = (perms1.roles == 0) ? perms2.roles : perms1.roles;
    settings = (perms1.settings == 0) ? perms2.settings : perms1.settings;

    return newPerms(commands, flood, link, tgLink, forward, quote, porn, night, media, roles, settings)

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

    var perms = newPerms();

    if(!chat.users.hasOwnProperty(userId))
        return perms;
    var roles = orderRolesByPriority(chat.users[userId].roles, chat);
    roles.forEach((role)=>{
        var rolePerms = getRolePerms(role);
        perms = sumPermsPriority(rolePerms, perms);
    })

    var adminPerms = getAdminPerms(chat, userId);
    perms = sumPermsPriority(adminPerms, perms);

    var userPerms = getUserPerms(chat, userId);
    perms = sumPermsPriority(userPerms, perms);

    return perms;

}

module.exports = {newPerms, newRole, newUser, newPremadeRolesObject,
    getUserRoles, getRoleUsers, getUserPerms, getAdminPerms, getUserLevel, getRolePerms, getRoleName, getRoleEmoji, getRoleLevel, getPremadeRoles,
    deleteRole, deleteUser, renameRole, changeRoleEmoji,
    setRole, unsetRole,
    adminToPerms, reloadAdmins, sumPermsPriority, orderRolesByPriority, sumUserPerms}
