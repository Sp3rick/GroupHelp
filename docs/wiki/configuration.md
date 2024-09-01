# Configuration guide (config.json)

## Essential settings

**botToken**: `String`       
Your bot token gaven from [@BotFather](https://t.me/BotFather) (ex. `4839574812:AAFD39kkdpWt3ywyRZergyOLMaJhac60qc`)

**botStaff**: `Array<userIds>`  
List of User Ids considered bot staff (ex. `[33224765, 82399935]`)


## Privacy settings

**deleteChatDataAfterBotRemove**: `Boolean`  
If enabled all chat data will be deleted from bot database when you kick the bot from a group

**overwriteChatDataIfReAddedToGroup**: `Boolean`      
If enabled chat data and configurations will be regenerated if bot has been re-added to the group overwriting the old one

**allowExternalApi**: `Boolean`   
Allow to gather additional data by various online api's, that's may reveal the ip of your server, default to false


## Other settings

**reserveLang**: `String`    
Main bot language, this will be used to overwrite other languages with incompleted translations, we advise to keep it unchanged or use a full implemented language

**saveDatabaseSeconds**: `Number`    
Number of seconds of how often loaded chats should be written on disk, useful to prevent data loss on crash

**saveTagResolverSeconds**: `Number`       
Number of seconds of how often tagResolver data should be saved on disk

**maxCallbackAge**: `Number`    
Maximum number of seconds a callback button should be old to be accepted by the bot, you can reduce this in case of incompatible callbacks after an update that cause crash

**preventSetUselessRoles**: `Boolean`   
Disallow from setting roles if it does not change the user status in the group

**chatWhitelist**: `Array<userIds>`        
If there are at least one element the bot will work only on these chat ids (ex. `[-10294995433434, -429930035587]`)

**privateWhitelist**: `Boolean`  
True if chat whitelist should ignore also private chats not included in chatWhitelist, useless if chatWhitelist is disabled

**chatBlacklist**: `Array<userIds>`   
Bot wont more handle requests of Chat Ids on this list (ex. `[-10294995433434, -429930035587]`)


## Plugin settings

**ANTIFLOOD_msgMin**: `Number`      
minimum settable number of messages to triggher the antiflood

**ANTIFLOOD_msgMax**: `Number`        
maximum settable number of messages to triggher the antiflood

**ANTIFLOOD_timeMin**: `Number`    
minimum settable time in which N messages should be sent to triggher the antiflood

**ANTIFLOOD_timeMax**: `Number`     
maximum settable time in which N messages should be sent to triggher the antiflood

**minWarns**: `Number`      
minimum settable warns on settings

**maxWarns**: `Number`      
maximum settable warns on settings

</br>