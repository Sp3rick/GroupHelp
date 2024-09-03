If you want an idea of what currently miss on the bot and you may want to implement it, that's the right page

-short term:

    allow to edit single user perms   
    commands help panel   

-medium term:

    allow on /perms to change user perms and roles, +add it in a button for /info or when a role is set (/free /mod etc..), +ask double confirm to give an user the "settings" and "roles" permission   
    support for anonymous admins    
    allow to customize /staff allowing to set roles to hide   
    create a privacy setting where users can ask to esclude themself from tagResolver and replace his's first name in database with "Anonymous"   
    allow to disable tagResolver log on group settings    
    allow to mute only media, or specific media type or extras    
    create a privacy option to allow a user deleting his data from the bot    
    custom roles    
    optimize database.get, .update and .save to store in temporal array most used users   
    implement time zone setting +implement it in /info    

-long  term:

    add log channel   
    chatIds anonymization on database   
    compress chats data stored on database    
    support all group help functions and more (+anti-sheduled messages[msg.is_from_offline], )    
    allow bot clone bot when user give a token    
    add optionally an userbot (when active implement in tagResolver.js)   
    user should have an option to delete also his warn or roles data from the entire database but accepting that he is going to be banned by any group where he got at least a warn and accepting that he is going to lose any acquired role on every group     
    make plugins more independed    

-other things:

    add a setting on antiflood.js to count edited messages too
    allow a plugin to add itself a button on settings page  
    implement direct private settings with /*settings     
    add a /commands command to help user to know bot commands, admin commands, and custom-group commands if avaiable    
    a check system to drop wrong formatted cb.data and waitingReply   
    allow to see perms calculation trough user perms, then roles by priority, then base group perms, going from left to right (or opposite)   
    add something to allow a group admin to identify all users with additional bot perms    
    ?add an automatic leveling system for admins? (maybe?)    
    add photo preview-mode in MessageMaker.js   
    allow to warn only usersIds who exhist on telegram, it can be checked if applyng a restriction returns true   
    add config to allow/disallow adding bot from non-admin users    
    ?identify reply_parameters and add everytime allow_sending_without_reply? (GHBot.js)    
    /geturl, by replying to a message (via reply) and writing this command, you receive the link that refers directly to that message.    
    /inactives [days] sends in private chat the list of users who have not sent a message in the last [days], with the possibility of punish them.    
    /pin [message] - sends the message through the Bot and pins it.   
    /editpin [message] - edits the current pinned message (if sent from the Bot).   
    /delpin - removes the pinned message.   
    /repin - removes and pins again the current pinned message, with notification!    
    /pinned - refers to the current pinned message.   
    /list - sends in private chat the list of users of the group with the number of messages sent by them.    
    /list roles - sends in private chat the list of all the special roles assigned to users   
    /graphic - sends a graph showing the trend of the group members.    
    /trend - sends the group's growth statistics.   
    /logdel - deletes the selected message and sends it to the Log Channel    
    /send - permits to send a post through the Bot with parse mode support    