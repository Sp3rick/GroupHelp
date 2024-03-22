Open-Source re-creation of telegram group manager Group Help in nodejs, contribs finally allowed!

Note: install dependency with "npm i yagop/node-telegram-bot-api" for latest version of api (required)
TODO:

-short term:

    jsdoc GHbot emit events in main.js (urgent to have advices for easier creation directly on /plugins, currently you should create the plugin in main.js and then moving plugin-related code in /plugins)
    implement time zone setting
    jsdoc db (database) object
    jsdoc GHbot object in GHbot.js
    add configuration to allow/disallow adding bot from non-admin users
    commands help panel
    notify founder and admins when bot get added in the group in thanksgiving message
    handle "chat_member" event adding/removing automatically from admin list
    implement photo preview-mode in MessageMaker.js

-medium term:
    (once bot will be declared ready to use) add code versioning system to update database when user update it
    optimize database.get, .update and .save to store in temporal array most used chats/users
    create a privacy option to allow a user deleting his data from the bot

-long  term:

    support all group help functions and more
    allow bot clone bot when user give a token




config.json documentation at: https://github.com/Sp3rick/GroupHelp/blob/main/CONFIG_DOCUMENTATION.md

Look also at some code documentation to contribute: https://github.com/Sp3rick/GroupHelp/blob/main/documentation.md

When you create a plugin you can document it on https://github.com/Sp3rick/GroupHelp/blob/main/plugins.md
