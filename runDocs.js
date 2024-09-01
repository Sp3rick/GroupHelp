const fs = require('fs');
const jsdoc2md = require('jsdoc-to-markdown');

const data = fs.readFileSync("./GHbot.js", "utf-8").replaceAll("&","|");
const docs = jsdoc2md.renderSync({source: data, "no-cache": true})
.replaceAll("<code>TelegramBot</code>", "[<code>TelegramBot</code>](https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md)")
.replaceAll(`<code>TelegramBot.`, `<code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>`)

const head = 
`## TelegramBot api

You can finnd documentation about TelegramBot Objects on [telegram-bot-api](https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md) github

---

The down below lines are generated with [jsdoc2md](https://github.com/jsdoc2md/jsdoc-to-markdown)


`

fs.writeFileSync("./docs/documentation/GHBot.md", head+docs)

console.log("JSDoc to Markdown successfull, now run `mkdocs serve`\n"+
    "Install guide for mkdocs: https://www.mkdocs.org/user-guide/installation/")
