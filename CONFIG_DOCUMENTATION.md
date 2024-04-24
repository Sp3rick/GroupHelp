<b> config.json documentation</b>

<b>Essential settings</b>

botToken:
    Your bot token that you can get from @BotFather

botStaff:
    Array of userId(String) considered bot staff


<b>Privacy settings</b>

deleteChatDataAfterBotRemove:
    If enabled all chat data (configurations included) will be deleted from bot database when you kick the bot from a group

overwriteChatDataIfReAddedToGroup:
    If enabled chat data and configurations will be regenerated if bot has been re-added to the group (similiar to deleteChatDataAfterBotRemove,)


<b>Other settings</b>

reserveLang:
    Principal language for the bot, this will be used to overwrite other languages with incompleted translations, we advise to keep it unchanged or use a full implemented language

saveDatabaseSeconds:
    Number of seconds of how often loaded chats should be written on disk, useful to prevent data loss on crash

preventSetUselessRoles:
    Disallow from setting roles if it does not change the user status in the group

chatWhitelist:
    Array, if there are at least one element the bot will work only on this chat ids

privateWhitelist:
    Boolean, true if chat whitelist includes private chats, useless if chatWhitelist has no elements

chatBlacklist:
    Bot wont more handle requests of chat ids in this array


<b>Plugin settings</b>

ANTIFLOOD_msgMin:
    minimum allowed number of messages to triggher the antiflood

ANTIFLOOD_msgMax:
    maximum allowed number of messages to triggher the antiflood

ANTIFLOOD_timeMin:
    minimum allowed time in which N messages should be sent to triggher the antiflood

ANTIFLOOD_timeMax:
    maximum allowed time in which N messages should be sent to triggher the antiflood

minWarns:
    minimum allowed warns in settings

maxWarns:
    maximum allowed warns in settings


