const {isString} = require("./utils.js");

//Roles with string name is intended as a pre-made role
//pre-made roles chat.roles[role] will contain only "users" array, data about the role are stored on global.roles[role]

/** 
 * @typedef {Object} customPerms
 * @property {Array} commands - Array of allowed commands
 * @property {1|0|-1} flood - permission to flood messages
 * @property {1|0|-1} link - permission to send link
 * @property {1|0|-1} tgLink - permission to send telegram links/usernamess
 * @property {1|0|-1} forward - permission to forward messages from anywhere
 * @property {1|0|-1} quote - permission to quote from anywhere
 * @property {1|0|-1} porn - bypass porn/gore checks
 * @property {1|0|-1} nigth - bypass any nigth mode  limitation
 * @property {1|0|-1} media - bypass any media limitation
 */

/** 
 * @typedef {Object} userStatus
 * @property {Number} warnCount - number of user warns
 * @property {customPerms} perms - customPerms object for all user-specific permissions
 * @property {Array<String|Number>} roles - array user roles, string for pre-made roles, number for custom roles (user-made)
 */

/** 
 * @typedef {Object} GHRoles
 * @property {String} name - role name
 * @property {customPerms} perms - customPerms object applyed at lowest priority on any user in this role
 * @property {Array<Number|String>} users - array of userId in this role
 */

/**
 * 
 * @return {customPerms}
 *      Get a default customPerms object
 */
function newPerms(commands, flood, link, tgLink, forward, quote, porn, nigth, media)
{
    commands = commands || [];
    flood = flood || 0;
    link = link || 0;
    tgLink = tgLink || 0;
    forward = forward || 0;
    quote = quote || 0;
    porn = porn || 0;
    nigth = nigth || 0;
    media = media || 0;
    
    flood = (flood === false) ? -1 : flood;
    link = (link === false) ? -1 : link;
    tgLink = (tgLink === false) ? -1 : tgLink;
    forward = (forward === false) ? -1 : forward;
    quote = (quote === false) ? -1 : quote;
    porn = (porn === false) ? -1 : porn;
    nigth = (nigth === false) ? -1 : nigth;
    media = (media === false) ? -1 : media;


    var defaultPermissions = {
        commands: commands,
        flood: flood,
        link: link,
        tgLink: tgLink,
        forward: forward,
        quote: quote,
        porn: porn,
        nigth : nigth,
        media: media,
    }
    
    return defaultPermissions;
}

/**
 * 
 * @return {GHRoles}
 *      Get a default GHRoles object
 */
function newRole(name, perms, users)
{
    name = name || "role";
    perms = perms || newPerms();
    users = users || [];

    var defualtRole = {
        name: name,
        perms: perms,
        users: users,
    }

    return defualtRole;
}


/**
 * 
 * @return {userStatus}
 *      Get a default userStatus object
 */
function newUser(warnCount, perms, roles)
{
    warnCount = warnCount || 0;
    perms = perms || newPerms();
    roles = roles || [];

    var userData = {
        warnCount: warnCount,
        perms: perms,
        roles: roles,
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

function getPremadeRoles()
{

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

function setRole(chat, userId, role)
{
    chat.users[userId].roles.push(role);
    chat.roles[role].users.push(userId);

    return chat;
}

function unsetRole(chat, userId, role)
{
    var roleIndex = chat.users[userId].roles.indexOf(role);
    chat.users[userId].roles.splice(roleIndex, 1);

    var userIndex = chat.roles[role].users.indexOf(userId);
    chat.roles[role].users.splice(userIndex, 1);

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

    var flood, link, tgLink, forward, quote, porn, nigth, media;

    flood = (perms1.flood == 0) ? perms2.flood : perms1.flood; //if perms1 is neutral inherit from second
    link = (perms1.link == 0) ? perms2.link : perms1.link;
    tgLink = (perms1.tgLink == 0) ? perms2.tgLink : perms1.tgLink;
    forward = (perms1.forward == 0) ? perms2.forward : perms1.forward;
    quote = (perms1.quote == 0) ? perms2.quote : perms1.quote;
    porn = (perms1.porn == 0) ? perms2.porn : perms1.porn;
    nigth = (perms1.nigth == 0) ? perms2.nigth : perms1.nigth;
    media = (perms1.media == 0) ? perms2.media : perms1.media;

    return newPerms(commands, flood, link, tgLink, forward, quote, porn, nigth, media)

}

module.exports = {newPerms, newRole, newUser,
    getUserRoles, getRoleUsers, getUserPerms, getRolePerms, getRoleName, getPremadeRoles,
    deleteRole, deleteUser,
    setRole, unsetRole,
    sumPermsPriority}
