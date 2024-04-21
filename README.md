Open-Source re-creation of telegram group manager Group Help in nodejs, contribs finally allowed!

To Install use:
$ npm i node-telegram-bot-api/yagop (or $ npm i https://github.com/yagop/node-telegram-bot-api)
$ npm i chrono-node

Run with:
$ node index.js

Dont forget to set it up on config.json!

TODO:

-short term:

    create a panel to set who can use various commands: everyone, role, admin, founder (4 switch buttons for each, for role open another panel)
    commands help panel
    notify founder and admins when bot get added in the group in thanksgiving message
    add setting to allow/disallow adding bot from non-admin users
    add a whitelist configuration to let bot work only on some groups
    --below low priority--
    allow on /perms to change user perms and roles +add it in a button for /info or when a role is set (/free /mod etc..)
    allow to see perms calculation trough user perms, then roles by priority, then base group perms, going from left to right (or opposite)
    add something to allow a group admin to identify all users with special perms
    exclude founder from admin list
    ?add target object also for callback?
    ?add an automatic leveling system for admins? (maybe?)
    add optionally the possibility to redirect warn permission instead of COMMAND_WARN to the command of punishment (?active by default?)
    ask double confirm to give an user the "settings" and "roles" (roles management) permission
    implement photo preview-mode in MessageMaker.js

-medium term:

    create a privacy setting where users can ask to esclude themself from tagResolver and replace his's first name in database with "Anonymous"
    allow to mute only media, or specific media type or extras
    once bot will be declared ready to use, add code versioning system to update database when user update it
    create a privacy option to allow a user deleting his data from the bot
    custom roles
    optimize database.get, .update and .save to store in temporal array most used users
    implement time zone setting +implement it in /info
    allow a punishment and deletion for scheduled messages (thanks to msg.is_from_offline)

-long  term:

    add log channel
    compress chats data stored on database
    support all group help functions and more
    allow bot clone bot when user give a token
    add optionally an userbot (when active implement in tagResolver.js)

known possible bugs:
sometimes db.chats.update in plugins is not used at all because you can still edit the global object cause to reference, not using it may cause some issue. 
if bot is expecting a message from an user it will take the reply from any chat the user write
cleanHTML() may be not applyed in some text where it should, the function probably clean everything needed to clean for telegram api


config.json documentation at: https://github.com/Sp3rick/GroupHelp/blob/main/CONFIG_DOCUMENTATION.md

Look also at some code documentation to contribute: https://github.com/Sp3rick/GroupHelp/blob/main/documentation.md

When you create a plugin you can document it on https://github.com/Sp3rick/GroupHelp/blob/main/plugins.md
