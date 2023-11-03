<b> config.json documentation</b>

<b>Essential settings</b>

botToken:
    Your bot token that you can get from @BotFather


<b>Privacy settings</b>

deleteChatDataAfterBotRemove:
    If enabled all chat data (configurations included) will be deleted from bot database when you kick the bot from a group

overwriteChatDataIfReAddedToGroup:
    If enabled chat data and configurations will be regenerated if bot has been re-added to the group (similiar to deleteChatDataAfterBotRemove,)


<b>Other settings</b>

reserveLang:
    Principal language for the bot, this will be used to overwrite other languages with incompleted translations, we advise to keep it unchanged or use a full implemented language

botStaff:
    Array of userId(String) considered bot staff
