General code info

A new user is added to database when does write in private chat to the bot or when add him to a groups (other users may be stored in other groups configurations)

"TGbot" variable is for using the bot with all its methods, "bot" is equal to access to bot data (bot = await TGbot.getMe())

while coding keep in mind that user should be able to delete his data in any moment, this for respecting the privacy philosophy of LibreGroupHelp (exception can be when user is banned from a group or is a staff where will be stored ONLY the userId)

<b>Language info</b>

The bot has a different language configuration for every chat (private, and groups)
when LibreGroupHelp is added to a group(and add it to the database) the default group language will be inherited from the user who added the bot, if the user is not in the database  (ps. find how to use telegram function to set this a bot can be added only from an admin)


<b>What is done</b>
Add/Removing bot from group handling (with NEW_GROUP "thanks" when added)
