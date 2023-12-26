Open-Source re-creation of telegram group manager Group Help in nodejs, project at very initial stage

TODO:

-short term:
    
    jsdoc GHbot emit events in main.js (urgent to have advices for easier creation directly on /plugins, currently you should create the plugin in main.js and then moving plugin-related code in /plugins)
    implement time zone setting
    jsdoc db (database) object
    jsdoc GHbot object in GHbot.js
    add configuration to allow/disallow adding bot from non-admin users
    commands help panel

-medium term:
    (once bot will be declared ready to use) add code versioning system to update database when user update it
    optimize database.get, .update and .save to store in temporal array most used chats/users
    create a privacy option to allow a user deleting his data from the bot

-long  term:

    allow bot clone bot when user give a token
    support all group help functions and more




config.json documentation at: https://github.com/Sp3rick/GroupHelp/blob/main/CONFIG_DOCUMENTATION.md

look also at code documentation to contribute: https://github.com/Sp3rick/GroupHelp/blob/main/documentation.md
