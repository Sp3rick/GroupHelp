Open-Source re-creation of telegram group manager Group Help in nodejs, contribs finally allowed!

To Install use:
$ npm i node-telegram-bot-api/yagop (or $ npm i https://github.com/yagop/node-telegram-bot-api)
$ npm i chrono-node

Run with:
$ node index.js

Dont forget to set it up on config.json!

TODO:

-short term:

    implement /admin command
    allow to set roles for user that's not in the group
    add admin commands and error checking
    add plugin punishments.js to handle punish cancel and punish set/unset commands (/ban /warn etc...)
    ask double confirm to give an user the "settings" and "roles" (roles management) permission
    handle "chat_member" event adding/removing automatically from admin list
    create a /reload command to refresh chat admins
    move additional things of main.js on a plugin
    allow on /perms to change user perms and roles +add it in a button for /info or when a role is set (/free /mod etc..)
    allow to see perms calculation trogh user perms, then roles by priority, then base group perms, going from left to right (or opposite)
    add something to allow a group admin to identify all users with special perms
    create a panel to set who can use various commands: everyone, role, admin, founder (4 switch buttons for each, for role open another panel)
    commands help panel
    notify founder and admins when bot get added in the group in thanksgiving message
    implement photo preview-mode in MessageMaker.js
    create custom function for all needed native method of TelegramBot to handle errors or crash on fail
    add setting to allow/disallow adding bot from non-admin users
    add a /forgot command to delete from the group all data about an user

-medium term:

    once bot will be declared ready to use, add code versioning system to update database when user update it
    create a privacy option to allow a user deleting his data from the bot
    custom roles
    optimize database.get, .update and .save to store in temporal array most used users
    implement time zone setting +implement it in /info
    allow a punishment and deletion for scheduled messages (thanks to msg.is_from_offline)

-long  term:

    compress chats data stored on database
    support all group help functions and more
    allow bot clone bot when user give a token
    add optionally an userbot (when active implement in tagResolver.js)




config.json documentation at: https://github.com/Sp3rick/GroupHelp/blob/main/CONFIG_DOCUMENTATION.md

Look also at some code documentation to contribute: https://github.com/Sp3rick/GroupHelp/blob/main/documentation.md

When you create a plugin you can document it on https://github.com/Sp3rick/GroupHelp/blob/main/plugins.md
