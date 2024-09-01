# GHBot documentation

## How it works

Begin point is from `index.js` which loads [plugins](./plugins.md), database and the acutal bot is then started by main.js

Other than starting the bot `main.js` emits on [GHBot](GHBot.md/#LGHInterface) some [events](events.md) with many LibreGroupHelp related integrated data ready to use, simplyfing the code

[Database](database.md) is managed by `database.js`, usually on the `db` variable, main methods are found on db.chats and db.users to manage data about them

[JSDocs Objects](GHBot.md) documentation are on `GHbot.js`, it may also implement small fixes always to make an easyer interface

[TGbot](https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md) variable will give you direct access to the [telegram-bot-api](https://github.com/yagop/node-telegram-bot-api), when possible you should use GHbot events and methods and if does not exhist the one needed create that      
*Additionally on [TGbot.me](https://core.telegram.org/bots/api#getme) is avaiable `await TGbot.getMe()` result*

Any LibreGroupHelp code should keep in mind that user should be able to delete his data in any moment, that's for respecting at best our privacy philosophy

[Github good first issues](https://github.com/Sp3rick/GroupHelp/contribute)