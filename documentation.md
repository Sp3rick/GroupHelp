General code info

A new user is added to database when does write in private chat to the bot or when add him to a groups (other users may be stored in other groups configurations)

"TGbot" variable is for using the bot with all its methods, "bot" is equal to access to bot data (bot = await TGbot.getMe())

while coding keep in mind that user should be able to delete his data in any moment, this for respecting the privacy philosophy of LibreGroupHelp (exception can be when user is banned from a group or is a staff where will be stored ONLY the userId)

<b>Language info</b>

The bot has a different language configuration for every chat (private, and groups)
when LibreGroupHelp is added to a group(and add it to the database) the default group language will be inherited from the user who added the bot, if the user is not in the database  (ps. find how to use telegram function to set this a bot can be added only from an admin)

Global variables language-related:

var langKeys = Object.keys(l); 
var loadedLangs = Object.keys(l).length; Total number of loaded languages

<b>What is done</b>

Add/Removing bot from group handling (not implemented the latter options after  message)
    -Thanksgiving with some hint
    -Settings and lang configuration hint

"Hello" message when user write in private chat at bot with:
    - Add me to a group, Group link and Channel link options fully implemented
    - Informations option partially implemented
    - Support partially implemented
    - Language selector fully implemented

Group settings with open here or in private chat option with:
    -Group lang selector

