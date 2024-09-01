## TelegramBot api

You can finnd documentation about TelegramBot Objects on [telegram-bot-api](https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md) github

---

The down below lines are generated with [jsdoc2md](https://github.com/jsdoc2md/jsdoc-to-markdown)


## Classes

<dl>
<dt><a href="#LGHInterface">LGHInterface</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#testObject">testObject()</a> ⇒ <code><a href="#LGHChat">LGHChat</a></code></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#AnonTGUser">AnonTGUser</a> : <code>Object</code></dt>
<dd><p>Basic anonymized user object</p>
</dd>
<dt><a href="#Punishment">Punishment</a> : <code>0</code> | <code>1</code> | <code>2</code> | <code>3</code> | <code>4</code></dt>
<dd><p>Punishment to apply</p>
<ul>
<li>0: off</li>
<li>1: warn</li>
<li>2: kick</li>
<li>3: mute</li>
<li>4: ban</li>
</ul>
</dd>
<dt><a href="#LGHPunish">LGHPunish</a> : <code>Object</code></dt>
<dd><p>antispam.js settings Object.</p>
</dd>
<dt><a href="#LGHChatBasedPunish">LGHChatBasedPunish</a> : <code>Object</code></dt>
<dd><p>Object to reresent different punish settings for more chat types</p>
</dd>
<dt><a href="#LGHAlphabetBasedPunish">LGHAlphabetBasedPunish</a> : <code>Object</code></dt>
<dd><p>Object to reresent different punish settings for messages containing various Alphabets</p>
</dd>
<dt><a href="#TargetUser">TargetUser</a> : <code>Object</code></dt>
<dd><p>Object that refers to a target user</p>
</dd>
<dt><a href="#LGHPerms">LGHPerms</a> : <code>Object</code></dt>
<dd><p>LGHPerms Object.</p>
</dd>
<dt><a href="#simpleMedia">simpleMedia</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#customMessage">customMessage</a> : <code>Object</code></dt>
<dd><p>object of MessageMaker</p>
</dd>
<dt><a href="#LGHAdminAdds">LGHAdminAdds</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#LGHAdmin">LGHAdmin</a> : <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>ChatAdministratorRights</code> | <code><a href="#LGHAdminAdds">LGHAdminAdds</a></code></dt>
<dd></dd>
<dt><a href="#LGHAdminList">LGHAdminList</a> : <code><a href="#LGHAdmin">Array.&lt;LGHAdmin&gt;</a></code></dt>
<dd></dd>
<dt><a href="#userStatus">userStatus</a> : <code>Object</code></dt>
<dd><p>object with data about an user in a group</p>
</dd>
<dt><a href="#LGHRole">LGHRole</a> : <code>Object</code></dt>
<dd><p>if pre-made role (string key) only users object should be used</p>
</dd>
<dt><a href="#LGHWarns">LGHWarns</a> : <code>Object</code></dt>
<dd><p>warns.js plugin related data</p>
</dd>
<dt><a href="#LGHWelcome">LGHWelcome</a> : <code>Object</code></dt>
<dd><p>welcome.js settings Object.</p>
</dd>
<dt><a href="#LGHFloodAdds">LGHFloodAdds</a> : <code>Object</code></dt>
<dd><p>antiflood.js settings additional Object elements.</p>
</dd>
<dt><a href="#LGHFlood">LGHFlood</a> : <code><a href="#LGHFloodAdds">LGHFloodAdds</a></code> | <code><a href="#LGHPunish">LGHPunish</a></code></dt>
<dd><p>antiflood.js settings Object.</p>
</dd>
<dt><a href="#LGHSpamTgLinksAdds">LGHSpamTgLinksAdds</a> : <code>Object</code></dt>
<dd><p>antispam.js settings Object additional items.</p>
</dd>
<dt><a href="#LGHSpamTgLinks">LGHSpamTgLinks</a> : <code><a href="#LGHSpamTgLinksAdds">LGHSpamTgLinksAdds</a></code> | <code><a href="#LGHPunish">LGHPunish</a></code></dt>
<dd><p>antispam.js settings about Telegram Links Object.</p>
</dd>
<dt><a href="#LGHSpamLinksAdds">LGHSpamLinksAdds</a> : <code>Object</code></dt>
<dd><p>antispam.js spam links Object additional items.</p>
</dd>
<dt><a href="#LGHSpamLinks">LGHSpamLinks</a> : <code><a href="#LGHSpamLinksAdds">LGHSpamLinksAdds</a></code> | <code><a href="#LGHPunish">LGHPunish</a></code></dt>
<dd><p>antispam.js settings about Links Object.</p>
</dd>
<dt><a href="#LGHSpamForward">LGHSpamForward</a> : <code><a href="#LGHChatBasedPunish">LGHChatBasedPunish</a></code></dt>
<dd><p>antispam.js settings about foward.</p>
</dd>
<dt><a href="#LGHSpamQuote">LGHSpamQuote</a> : <code><a href="#LGHChatBasedPunish">LGHChatBasedPunish</a></code></dt>
<dd><p>antispam.js settings about quote.</p>
</dd>
<dt><a href="#LGHSpam">LGHSpam</a> : <code>Object</code></dt>
<dd><p>antispam.js settings Object.</p>
</dd>
<dt><a href="#LGHGoodbye">LGHGoodbye</a> : <code>Object</code></dt>
<dd><p>goodbye.js settings</p>
</dd>
<dt><a href="#LGHCaptcha">LGHCaptcha</a> : <code>Object</code></dt>
<dd><p>captcha.js settings</p>
</dd>
<dt><a href="#LGHMedia">LGHMedia</a> : <code>Object</code></dt>
<dd><p>media.js settings, if LGHPunish is disabled the object will be deleted (undefinied)</p>
</dd>
<dt><a href="#CustomChat">CustomChat</a> : <code>Object</code></dt>
<dd><p>Additional chat elements for chat object by LibreGroupHelp</p>
</dd>
<dt><a href="#LGHChat">LGHChat</a> : <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>Chat</code> | <code><a href="#CustomChat">CustomChat</a></code></dt>
<dd><p>Full LGH chat object given by LGHBot events, custom items avaiable if working about a group</p>
</dd>
<dt><a href="#CustomUser">CustomUser</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#LGHUser">LGHUser</a> : <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>User</code> | <code><a href="#CustomUser">CustomUser</a></code></dt>
<dd><p>Custom chat object given by LGHBot events, custom items avaiable if working about a group</p>
</dd>
<dt><a href="#ParsedCommand">ParsedCommand</a> : <code>Object</code></dt>
<dd><p>ParsedCommand Object.</p>
</dd>
<dt><a href="#CustomCommand">CustomCommand</a> : <code>Object</code></dt>
<dd><p>Additional items to command for LGH</p>
</dd>
<dt><a href="#CustomMessage">CustomMessage</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#LGHMessage">LGHMessage</a> : <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>Message</code> | <code><a href="#CustomMessage">CustomMessage</a></code></dt>
<dd><p>Custom chat object given by LGHBot events, custom items avaiable if working about a group</p>
</dd>
<dt><a href="#CustomCallback">CustomCallback</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#LGHCallback">LGHCallback</a> : <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>CallbackQuery</code> | <code><a href="#CustomCallback">CustomCallback</a></code></dt>
<dd><p>Custom callback object given by LGHBot events, custom items may be avaiable</p>
</dd>
<dt><a href="#chatsDatabase">chatsDatabase</a> : <code>Object</code></dt>
<dd><p>Object containing chat-related database functions.</p>
</dd>
<dt><a href="#usersDatabase">usersDatabase</a> : <code>Object</code></dt>
<dd><p>Object containing user-related database functions.</p>
</dd>
<dt><a href="#LGHDatabase">LGHDatabase</a> : <code>Object</code></dt>
<dd><p>Type returned by the getDatabase function.</p>
</dd>
<dt><a href="#LibreGHelp">LibreGHelp</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="LGHInterface"></a>

## LGHInterface
**Kind**: global class  

* [LGHInterface](#LGHInterface)
    * [new LGHInterface(LibreGHelp)](#new_LGHInterface_new)
    * [.GHbot](#LGHInterface+GHbot) : [<code>LGHInterface</code>](#LGHInterface)
    * [.TGbot](#LGHInterface+TGbot) : [<code>TelegramBot</code>](https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md)
    * [.db](#LGHInterface+db) : [<code>LGHDatabase</code>](#LGHDatabase)
    * [.config](#LGHInterface+config) : <code>Object</code>
    * [.onMessage(handler)](#LGHInterface+onMessage)
    * [.onCallback(handler)](#LGHInterface+onCallback)
    * [.sendMessage(userId, chatId, text, options)](#LGHInterface+sendMessage) ⇒ <code>Boolean</code> \| <code>Promise.&lt;TelegramBot.Message&gt;</code>
    * [.sendPhoto(userId, chatId, photo, options, fileOptions)](#LGHInterface+sendPhoto) ⇒ <code>Boolean</code> \| <code>Promise.&lt;TelegramBot.Message&gt;</code>
    * [.editMessageMedia(userId, media, options)](#LGHInterface+editMessageMedia) ⇒ <code>Boolean</code> \| <code>Promise.&lt;TelegramBot.Message&gt;</code>
    * [.editMessageText(userId, text, options)](#LGHInterface+editMessageText) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [.answerCallbackQuery(userId, callbackId, options)](#LGHInterface+answerCallbackQuery) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [.banChatMember(userId, chatId, targetId, options)](#LGHInterface+banChatMember) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [.unbanChatMember(userId, chatId, targetId, options)](#LGHInterface+unbanChatMember) ⇒ <code>Promise.&lt;Boolean&gt;</code>
    * [.restrictChatMember(userId, chatId, targetId, options)](#LGHInterface+restrictChatMember) ⇒ <code>Promise.&lt;Boolean&gt;</code>

<a name="new_LGHInterface_new"></a>

### new LGHInterface(LibreGHelp)

| Param | Type | Description |
| --- | --- | --- |
| LibreGHelp | [<code>LibreGHelp</code>](#LibreGHelp) | Libre Group Help telegram bot handler |

<a name="LGHInterface+GHbot"></a>

### lghInterface.GHbot : [<code>LGHInterface</code>](#LGHInterface)
**Kind**: instance property of [<code>LGHInterface</code>](#LGHInterface)  
<a name="LGHInterface+TGbot"></a>

### lghInterface.TGbot : [<code>TelegramBot</code>](https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md)
**Kind**: instance property of [<code>LGHInterface</code>](#LGHInterface)  
<a name="LGHInterface+db"></a>

### lghInterface.db : [<code>LGHDatabase</code>](#LGHDatabase)
**Kind**: instance property of [<code>LGHInterface</code>](#LGHInterface)  
<a name="LGHInterface+config"></a>

### lghInterface.config : <code>Object</code>
**Kind**: instance property of [<code>LGHInterface</code>](#LGHInterface)  
<a name="LGHInterface+onMessage"></a>

### lghInterface.onMessage(handler)
LGHbot message event handler

**Kind**: instance method of [<code>LGHInterface</code>](#LGHInterface)  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | handler function |

<a name="LGHInterface+onCallback"></a>

### lghInterface.onCallback(handler)
LGHbot callback event handler

**Kind**: instance method of [<code>LGHInterface</code>](#LGHInterface)  

| Param | Type | Description |
| --- | --- | --- |
| handler | <code>function</code> | handler function |

<a name="LGHInterface+sendMessage"></a>

### lghInterface.sendMessage(userId, chatId, text, options) ⇒ <code>Boolean</code> \| <code>Promise.&lt;TelegramBot.Message&gt;</code>
LGHbot safely send message under user request limit

**Kind**: instance method of [<code>LGHInterface</code>](#LGHInterface)  
**Returns**: <code>Boolean</code> \| <code>Promise.&lt;TelegramBot.Message&gt;</code> - - returns true on success, false if request has been dropped out  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>number</code> \| <code>string</code> | id of user that's the cause of your request |
| chatId | <code>number</code> \| <code>string</code> | chat where message should be sent |
| text | <code>String</code> | text of message |
| options | <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>SendMessageOptions</code> | additional telegram options |

<a name="LGHInterface+sendPhoto"></a>

### lghInterface.sendPhoto(userId, chatId, photo, options, fileOptions) ⇒ <code>Boolean</code> \| <code>Promise.&lt;TelegramBot.Message&gt;</code>
LGHbot safely send message under user request limit

**Kind**: instance method of [<code>LGHInterface</code>](#LGHInterface)  
**Returns**: <code>Boolean</code> \| <code>Promise.&lt;TelegramBot.Message&gt;</code> - - returns true on success, false if request has been dropped out  

| Param | Type | Description |
| --- | --- | --- |
| userId |  |  |
| chatId | <code>number</code> \| <code>string</code> | chat where message should be sent |
| photo | <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>InputMediaPhoto</code> | photo |
| options | <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>SendPhotoOptions</code> | additional telegram options |
| fileOptions | <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>FileOptions</code> | file metadata |

<a name="LGHInterface+editMessageMedia"></a>

### lghInterface.editMessageMedia(userId, media, options) ⇒ <code>Boolean</code> \| <code>Promise.&lt;TelegramBot.Message&gt;</code>
**Kind**: instance method of [<code>LGHInterface</code>](#LGHInterface)  
**Returns**: <code>Boolean</code> \| <code>Promise.&lt;TelegramBot.Message&gt;</code> - - returns true on success, false if request has been dropped out  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>number</code> \| <code>string</code> | id of user that's the cause of your request |
| media | <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>InputMedia</code> | input media |
| options | <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>EditMessageMediaOptions</code> |  |

<a name="LGHInterface+editMessageText"></a>

### lghInterface.editMessageText(userId, text, options) ⇒ <code>Promise.&lt;Boolean&gt;</code>
LGHbot safely edit message under user request limit

**Kind**: instance method of [<code>LGHInterface</code>](#LGHInterface)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - - returns true on success, false if request has been dropped out  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>number</code> \| <code>string</code> | id of user that's the cause of your request |
| text | <code>String</code> | text of message |
| options | <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>EditMessageTextOptions</code> | additional telegram options |

<a name="LGHInterface+answerCallbackQuery"></a>

### lghInterface.answerCallbackQuery(userId, callbackId, options) ⇒ <code>Promise.&lt;Boolean&gt;</code>
LGHbot safely answerCallbackQuert under user request limit

**Kind**: instance method of [<code>LGHInterface</code>](#LGHInterface)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - - returns true on success, false if request has been dropped out  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>number</code> \| <code>string</code> | id of user that's the cause of your request |
| callbackId | <code>number</code> \| <code>string</code> | id of user that's the cause of your request |
| options | <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>AnswerCallbackQueryOptions</code> | additional telegram options |

<a name="LGHInterface+banChatMember"></a>

### lghInterface.banChatMember(userId, chatId, targetId, options) ⇒ <code>Promise.&lt;Boolean&gt;</code>
LGHbot safely answerCallbackQuert under user request limit

**Kind**: instance method of [<code>LGHInterface</code>](#LGHInterface)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - - returns true on success, false if request has been dropped out  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>number</code> \| <code>string</code> | id of user that's the cause of your request |
| chatId | <code>number</code> \| <code>string</code> | - chat where message should be sent |
| targetId | <code>number</code> \| <code>string</code> | id of user that should be banned |
| options | <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>BanOptions</code> | additional telegram options |

<a name="LGHInterface+unbanChatMember"></a>

### lghInterface.unbanChatMember(userId, chatId, targetId, options) ⇒ <code>Promise.&lt;Boolean&gt;</code>
LGHbot safely answerCallbackQuert under user request limit

**Kind**: instance method of [<code>LGHInterface</code>](#LGHInterface)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - - returns true on success, false if request has been dropped out  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>number</code> \| <code>string</code> | id of user that's the cause of your request |
| chatId | <code>number</code> \| <code>string</code> | - chat where message should be sent |
| targetId | <code>number</code> \| <code>string</code> | id of user that should be unbanned |
| options | <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>UnbanOptions</code> | additional telegram options |

<a name="LGHInterface+restrictChatMember"></a>

### lghInterface.restrictChatMember(userId, chatId, targetId, options) ⇒ <code>Promise.&lt;Boolean&gt;</code>
LGHbot safely answerCallbackQuert under user request limit

**Kind**: instance method of [<code>LGHInterface</code>](#LGHInterface)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - - returns true on success, false if request has been dropped out  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>number</code> \| <code>string</code> | id of user that's the cause of your request |
| chatId | <code>number</code> \| <code>string</code> | - chat where message should be sent |
| targetId | <code>number</code> \| <code>string</code> | id of user to restrict |
| options | <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>RestrictChatMemberOptions</code> | additional telegram options |

<a name="PermissionStatus"></a>

## PermissionStatus : <code>enum</code>
Permission status
- 1: allowed
- 0: neutral
- -1: denied

**Kind**: global enum  
**Properties**

| Name | Type | Default |
| --- | --- | --- |
| ALLOWED | <code>number</code> | <code>1</code> | 
| NEUTRAL | <code>number</code> | <code>0</code> | 
| DENIED | <code>number</code> | <code>-1</code> | 

<a name="testObject"></a>

## testObject() ⇒ [<code>LGHChat</code>](#LGHChat)
**Kind**: global function  
**Returns**: [<code>LGHChat</code>](#LGHChat) - testing jsdoc advices  
<a name="AnonTGUser"></a>

## AnonTGUser : <code>Object</code>
Basic anonymized user object

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>String</code> \| <code>Number</code> | userId |

<a name="Punishment"></a>

## Punishment : <code>0</code> \| <code>1</code> \| <code>2</code> \| <code>3</code> \| <code>4</code>
Punishment to apply
- 0: off
- 1: warn
- 2: kick
- 3: mute
- 4: ban

**Kind**: global typedef  
<a name="LGHPunish"></a>

## LGHPunish : <code>Object</code>
antispam.js settings Object.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| punishment | [<code>Punishment</code>](#Punishment) | Punishment to apply [0:off/1:warn/2:kick/3:mute/4:ban]. |
| PTime | <code>Number</code> \| <code>null</code> | Available if punishment is set to warn/mute/ban, contains seconds of punishment. |
| delete | <code>boolean</code> \| <code>null</code> | True if deletion is enabled as side effect. |

<a name="LGHChatBasedPunish"></a>

## LGHChatBasedPunish : <code>Object</code>
Object to reresent different punish settings for more chat types

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| channels | [<code>LGHPunish</code>](#LGHPunish) | Punish to apply for channels. |
| groups | [<code>LGHPunish</code>](#LGHPunish) | Punish to apply for groups. |
| users | [<code>LGHPunish</code>](#LGHPunish) | Punish to apply for users. |
| bots | [<code>LGHPunish</code>](#LGHPunish) | Punish to apply for bots. |

<a name="LGHAlphabetBasedPunish"></a>

## LGHAlphabetBasedPunish : <code>Object</code>
Object to reresent different punish settings for messages containing various Alphabets

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| arabic | [<code>LGHPunish</code>](#LGHPunish) | Punish to apply for messages containing arabic characters. |
| cyrillic | [<code>LGHPunish</code>](#LGHPunish) | Punish to apply for messages containing cyrillic (russian) characters. |
| chinese | [<code>LGHPunish</code>](#LGHPunish) | Punish to apply for messages containing chinese characters. |
| latin | [<code>LGHPunish</code>](#LGHPunish) | Punish to apply for messages containing latin characters. |

<a name="TargetUser"></a>

## TargetUser : <code>Object</code>
Object that refers to a target user

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> \| <code>number</code> | Telegram user Id |
| name | <code>string</code> | Full LGH name identifier: "fullName [id]" |
| perms | [<code>LGHPerms</code>](#LGHPerms) | LGHPerms with perms of target |
| user | <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>User</code> \| <code>null</code> | If avaiable, target basic user object |

<a name="LGHPerms"></a>

## LGHPerms : <code>Object</code>
LGHPerms Object.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| commands | <code>Array.&lt;string&gt;</code> | Array of commands, if starts with "COMMAND_" means its to be translated, otherwise is the literal command. |
| immune | [<code>PermissionStatus</code>](#PermissionStatus) | Active if this user can't receive any punishment (kick/warn/mute/ban) [1/0/-1]. |
| flood | [<code>PermissionStatus</code>](#PermissionStatus) | Permission to flood messages [1/0/-1]. |
| link | [<code>PermissionStatus</code>](#PermissionStatus) | Permission to send links [1/0/-1]. |
| tgLink | [<code>PermissionStatus</code>](#PermissionStatus) | Permission to send telegram links/usernames [1/0/-1]. |
| forward | [<code>PermissionStatus</code>](#PermissionStatus) | Permission to forward messages from anywhere [1/0/-1]. |
| quote | [<code>PermissionStatus</code>](#PermissionStatus) | Permission to quote from anywhere [1/0/-1]. |
| porn | [<code>PermissionStatus</code>](#PermissionStatus) | Bypass porn/gore checks [1/0/-1]. |
| night | [<code>PermissionStatus</code>](#PermissionStatus) | Bypass any night mode limitation [1/0/-1]. |
| media | [<code>PermissionStatus</code>](#PermissionStatus) | Bypass any media limitation [1/0/-1]. |
| alphabets | [<code>PermissionStatus</code>](#PermissionStatus) | Bypass any alphabets characters limitations [1/0/-1]. |
| words | [<code>PermissionStatus</code>](#PermissionStatus) | Bypass banned words limitations [1/0/-1]. |
| length | [<code>PermissionStatus</code>](#PermissionStatus) | Bypass message length limitations [1/0/-1]. |
| roles | [<code>PermissionStatus</code>](#PermissionStatus) | Permission to change roles of lower level users [1/0/-1]. |
| settings | [<code>PermissionStatus</code>](#PermissionStatus) | Permission to change bot group settings [1/0/-1]. |

<a name="simpleMedia"></a>

## simpleMedia : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>String</code> \| <code>null</code> | Type of media (audio, photo, video, video_note, animation, sticker, document) or false |
| fileId | <code>String</code> | media fileId or false |
| options | <code>Object</code> | additional options for TelegramBot |

<a name="customMessage"></a>

## customMessage : <code>Object</code>
object of MessageMaker

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| text | <code>String</code> | Text of messsage |
| entities | <code>Array.&lt;TelegramBot.MessageEntity&gt;</code> | Telegram entities of text |
| roles | <code>Array.&lt;String&gt;</code> | array user roles, string for pre-made roles, number for custom roles (user-made) |
| format | <code>Boolean</code> | true if message should be formatted (enabled by default), mean that entities should be passed on sendMessage function |
| media | [<code>simpleMedia</code>](#simpleMedia) | user administrator title |
| buttons | <code>String</code> | can be transformed in inline_keyboard with parseTextToInlineKeyboard() |
| buttonsParsed | <code>Array.&lt;TelegramBot.KeyboardButton&gt;</code> | already parsed buttons ready to use for inline_keyboard |

<a name="LGHAdminAdds"></a>

## LGHAdminAdds : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| user | [<code>AnonTGUser</code>](#AnonTGUser) | Basic anonymized user object |
| status | <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>ChatMemberStatus</code> |  |

<a name="LGHAdmin"></a>

## LGHAdmin : <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>ChatAdministratorRights</code> \| [<code>LGHAdminAdds</code>](#LGHAdminAdds)
**Kind**: global typedef  
<a name="LGHAdminList"></a>

## LGHAdminList : [<code>Array.&lt;LGHAdmin&gt;</code>](#LGHAdmin)
**Kind**: global typedef  
<a name="userStatus"></a>

## userStatus : <code>Object</code>
object with data about an user in a group

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| firtJoin | <code>Number</code> | Unix number of first user join time in seconds, false if unknown (managed by welcome.js) |
| perms | [<code>LGHPerms</code>](#LGHPerms) | LGHPerms object for all user-specific permissions |
| adminPerms | [<code>LGHPerms</code>](#LGHPerms) | LGHPerms object for user permissions if admin |
| roles | <code>Array.&lt;String&gt;</code> | array user roles, string for pre-made roles, number for custom roles (user-made) |
| title | <code>String</code> \| <code>undefined</code> | user administrator title |
| waitingReply | <code>String</code> \| <code>null</code> | string with callback data hirarchy if bot is expecting a message from user on group |

<a name="LGHRole"></a>

## LGHRole : <code>Object</code>
if pre-made role (string key) only users object should be used

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>String</code> \| <code>null</code> | role name |
| emoji | <code>String</code> \| <code>null</code> | emoji for the role |
| level | <code>Number</code> \| <code>null</code> | role level, higher level users can use commands that affect  lower level users |
| perms | [<code>LGHPerms</code>](#LGHPerms) \| <code>null</code> | LGHPerms object applyed at lowest priority on any user in this role |
| users | <code>Array.&lt;String&gt;</code> | array of userId in this role |

<a name="LGHWarns"></a>

## LGHWarns : <code>Object</code>
warns.js plugin related data

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| timed | <code>Object.&lt;string, Number&gt;</code> | ([userId]: [endTime, endTime, endTime]) contains necerray data to revoke scheduled warns when  time is over |
| count | <code>Object.&lt;string, Number&gt;</code> | ([userId]: number) countains count of warns for each user |
| limit | <code>Number</code> | number of warns after wich should be applyed a punishment |
| punishment | <code>2</code> \| <code>3</code> \| <code>4</code> | punishment when limit is hit [2:kick/3:mute/4:ban] |
| PTime | <code>Number</code> \| <code>null</code> | avaiable if punishment is set to warn/mute/ban, contains seconds of punishment |

<a name="LGHWelcome"></a>

## LGHWelcome : <code>Object</code>
welcome.js settings Object.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| state | <code>boolean</code> | True if welcome is enabled (default false). |
| once | <code>boolean</code> | True if should be sent only at first user join (default false). |
| clean | <code>boolean</code> | True if last welcome message on the group should be (default false). |
| joinList | <code>Array.&lt;(string\|number)&gt;</code> | cronology of users that joined the group over time. |
| lastWelcomeId | <code>string</code> \| <code>number</code> \| <code>boolean</code> | MessageId of last welcome message sent, useful if clean is enabled, false if never sent one before. |
| message | [<code>customMessage</code>](#customMessage) | CustomMessage object. |

<a name="LGHFloodAdds"></a>

## LGHFloodAdds : <code>Object</code>
antiflood.js settings additional Object elements.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| messages | <code>Number</code> | Number of messages needed to trigger the Antiflood. |
| time | <code>Number</code> | Seconds within the specified message should be sent to trigger the Antiflood. |

<a name="LGHFlood"></a>

## LGHFlood : [<code>LGHFloodAdds</code>](#LGHFloodAdds) \| [<code>LGHPunish</code>](#LGHPunish)
antiflood.js settings Object.

**Kind**: global typedef  
<a name="LGHSpamTgLinksAdds"></a>

## LGHSpamTgLinksAdds : <code>Object</code>
antispam.js settings Object additional items.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| usernames | <code>Boolean</code> | True if usernames should be considered as spam. |
| bots | <code>Boolean</code> | True if bots should be considered as spam. |
| exceptions | <code>Array.&lt;String&gt;</code> | Array of Telegram exceptions, may contain "Name:Id", `Name:|hidden` (for hidden users), or t.me link, or @username, "Name" |

<a name="LGHSpamTgLinks"></a>

## LGHSpamTgLinks : [<code>LGHSpamTgLinksAdds</code>](#LGHSpamTgLinksAdds) \| [<code>LGHPunish</code>](#LGHPunish)
antispam.js settings about Telegram Links Object.

**Kind**: global typedef  
<a name="LGHSpamLinksAdds"></a>

## LGHSpamLinksAdds : <code>Object</code>
antispam.js spam links Object additional items.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| exceptions | <code>Array.&lt;String&gt;</code> | Array of strings of allowed links or hostnames. |

<a name="LGHSpamLinks"></a>

## LGHSpamLinks : [<code>LGHSpamLinksAdds</code>](#LGHSpamLinksAdds) \| [<code>LGHPunish</code>](#LGHPunish)
antispam.js settings about Links Object.

**Kind**: global typedef  
<a name="LGHSpamForward"></a>

## LGHSpamForward : [<code>LGHChatBasedPunish</code>](#LGHChatBasedPunish)
antispam.js settings about foward.

**Kind**: global typedef  
<a name="LGHSpamQuote"></a>

## LGHSpamQuote : [<code>LGHChatBasedPunish</code>](#LGHChatBasedPunish)
antispam.js settings about quote.

**Kind**: global typedef  
<a name="LGHSpam"></a>

## LGHSpam : <code>Object</code>
antispam.js settings Object.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| tgLinks | [<code>LGHSpamTgLinks</code>](#LGHSpamTgLinks) | rules and exceptions for telegram links considered as spam |
| links | [<code>LGHSpamLinks</code>](#LGHSpamLinks) | rules and exceptions for all links considered as spam |
| forward | [<code>LGHSpamForward</code>](#LGHSpamForward) | rules and exceptions for all forwarded messages considered as spam |
| quote | [<code>LGHSpamQuote</code>](#LGHSpamQuote) | rules and exceptions for all quoted messages considered as spam |

<a name="LGHGoodbye"></a>

## LGHGoodbye : <code>Object</code>
goodbye.js settings

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| group | <code>Boolean</code> | True if goodbye should be sent on group |
| clear | <code>Boolean</code> | True if last goodbye message should be deleted before sending a new one |
| lastId | <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>MessageId</code> | messageId of last goodbye message sent on group |
| gMsg | [<code>CustomMessage</code>](#CustomMessage) | Goodbye message to send on group |
| private | <code>Boolean</code> | True if goodbye should be sent on private chat |
| pMsg | [<code>CustomMessage</code>](#CustomMessage) | Goodbye message to send on private chat |

<a name="LGHCaptcha"></a>

## LGHCaptcha : <code>Object</code>
captcha.js settings

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| state | <code>Boolean</code> | True if welcome is enabled (default false). |
| mode | <code>string</code> | Type of captcha, can be "image" (default "image"). |
| time | <code>Number</code> | Time limit to solve the captcha |
| once | <code>boolean</code> | True if should be sent only at first user join (from welcome.js) (default false). |
| fails | <code>boolean</code> | True if captcha should notify on group that someone failed the captcha (default false). |
| punishment | [<code>Punishment</code>](#Punishment) | Punishment to apply [1:warn/2:kick/3:mute/4:ban]. |
| PTime | <code>Number</code> | Available if punishment is set to warn/mute/ban, contains seconds of punishment. |

<a name="LGHMedia"></a>

## LGHMedia : <code>Object</code>
media.js settings, if LGHPunish is disabled the object will be deleted (undefinied)

**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| photo | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| video | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| album | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| gif | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| voice | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| audio | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| sticker | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| sticker_video | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| dice | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| emoji_video | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| emoji_premium | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| video_note | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| file | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| game | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| contact | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| poll | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| location | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| capital | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| payment | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| via_bot | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| story | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| spoiler | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| spoiler_media | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| giveaway | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| mention | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| text_mention | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| hashtag | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| cashtag | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| command | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| url | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| email | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| number | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| bold | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| italic | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| underline | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| striketrough | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| quoteblock | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| closed_blockquote | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| code | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| pre_code | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| textlink | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| scheduled | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 
| effect | [<code>LGHPunish</code>](#LGHPunish) \| <code>undefined</code> | 

<a name="CustomChat"></a>

## CustomChat : <code>Object</code>
Additional chat elements for chat object by LibreGroupHelp

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| admins | [<code>LGHAdminList</code>](#LGHAdminList) \| <code>null</code> | array with known admins objects (user data anonymized) |
| lang | <code>String</code> \| <code>null</code> | current chat lang |
| currency | <code>String</code> \| <code>null</code> | currency of chat, default to USD |
| link | <code>string</code> \| <code>null</code> | group access link |
| isGroup | <code>Boolean</code> | temporary item, result of `(chat.type == "supergroup" || chat.type == "group")` |
| users | <code>Object.&lt;string, userStatus&gt;</code> \| <code>null</code> | Object-IdName based data about every user in the group (ex. users[643547] access data of userId 643547) |
| roles | <code>Object.&lt;string, LGHRole&gt;</code> \| <code>null</code> | data about a specific role, full role Object if it's a custom role (key with a number) |
| basePerms | [<code>LGHPerms</code>](#LGHPerms) | base permissions applyed to every user |
| adminPerms | [<code>LGHPerms</code>](#LGHPerms) | base permissions applyed to admin |
| warns | [<code>LGHWarns</code>](#LGHWarns) \| <code>null</code> | warns.js plugin related data |
| rules | [<code>customMessage</code>](#customMessage) \| <code>null</code> | rules.js plugin related data |
| welcome | [<code>LGHWelcome</code>](#LGHWelcome) \| <code>null</code> | welcome.js plugin related data |
| flood | [<code>LGHFlood</code>](#LGHFlood) \| <code>null</code> | antiflood.js plugin related data |
| spam | [<code>LGHSpam</code>](#LGHSpam) \| <code>null</code> | antispam.js plugin related data |
| captcha | [<code>LGHCaptcha</code>](#LGHCaptcha) \| <code>null</code> | captcha.js plugin related data |
| goodbye | [<code>LGHGoodbye</code>](#LGHGoodbye) \| <code>null</code> | goodbye.js plugin related data |
| alphabets | [<code>LGHAlphabetBasedPunish</code>](#LGHAlphabetBasedPunish) \| <code>null</code> | alphabets.js plugin related data |
| media | [<code>LGHMedia</code>](#LGHMedia) \| <code>null</code> | media.js plugin related data |

<a name="LGHChat"></a>

## LGHChat : <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>Chat</code> \| [<code>CustomChat</code>](#CustomChat)
Full LGH chat object given by LGHBot events, custom items avaiable if working about a group

**Kind**: global typedef  
<a name="CustomUser"></a>

## CustomUser : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| perms | [<code>LGHPerms</code>](#LGHPerms) \| <code>null</code> | temporary object with summary of user permissions |
| lang | <code>String</code> | current user lang |
| waitingReply | <code>String</code> | set to true if the bot is expecting a message from the user |

<a name="LGHUser"></a>

## LGHUser : <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>User</code> \| [<code>CustomUser</code>](#CustomUser)
Custom chat object given by LGHBot events, custom items avaiable if working about a group

**Kind**: global typedef  
<a name="ParsedCommand"></a>

## ParsedCommand : <code>Object</code>
ParsedCommand Object.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The original text input. |
| prefix | <code>string</code> | The prefix used in the command (e.g., "/", "!", "."). |
| botCommand | <code>string</code> | The command with bot name (e.g., "start@usernamebot"). |
| name | <code>string</code> | The name of the command. |
| bot | <code>string</code> | The bot name (if available). |
| args | <code>string</code> \| <code>boolean</code> | The arguments of the command (optional). |
| splitArgs | <code>Array.&lt;string&gt;</code> \| <code>boolean</code> | The split arguments of the command (optional). |

<a name="CustomCommand"></a>

## CustomCommand : <code>Object</code>
Additional items to command for LGH

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| target | [<code>TargetUser</code>](#TargetUser) \| <code>null</code> | Optional temporary object with data about a target LGH user in the command, false if no target found |

<a name="CustomMessage"></a>

## CustomMessage : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| chat | [<code>LGHChat</code>](#LGHChat) | Always original chat object where the message is coming from |
| command | [<code>ParsedCommand</code>](#ParsedCommand) \| [<code>CustomCommand</code>](#CustomCommand) | result of message text parsed with parseCommand() |
| target | [<code>TargetUser</code>](#TargetUser) \| <code>null</code> | Optional temporary object with data about a command target |
| waitingReply | <code>string</code> \| <code>null</code> | Optional temporary object with waitingReply data for the selected chat |
| waitingReplyTarget | [<code>TargetUser</code>](#TargetUser) \| <code>null</code> | Optional temporary object with data about a target LGH user, false if no target found |

<a name="LGHMessage"></a>

## LGHMessage : <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>Message</code> \| [<code>CustomMessage</code>](#CustomMessage)
Custom chat object given by LGHBot events, custom items avaiable if working about a group

**Kind**: global typedef  
<a name="CustomCallback"></a>

## CustomCallback : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| chat | [<code>LGHChat</code>](#LGHChat) | Always original chat object where the callback is coming from |
| target | [<code>TargetUser</code>](#TargetUser) | Optional temporary object with data about a target LGH user in the command, false if no target found |

<a name="LGHCallback"></a>

## LGHCallback : <code><a href="https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md">TelegramBot.</a>CallbackQuery</code> \| [<code>CustomCallback</code>](#CustomCallback)
Custom callback object given by LGHBot events, custom items may be avaiable

**Kind**: global typedef  
<a name="chatsDatabase"></a>

## chatsDatabase : <code>Object</code>
Object containing chat-related database functions.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| add | <code>function</code> | Function to add a new chat to the database. ------------------------------------ `function(TelegramBot.Chat): boolean` |
| delete | <code>function</code> | Function to delete a chat from the database. ------------------------------------ `function(TelegramBot.ChatId): boolean` |
| exhist | <code>function</code> | Function to check if a chat exhists in the database. ------------------------------------ `function(TelegramBot.ChatId): boolean` |
| get | <code>function</code> | Function to retrieve a chat from the database. ------------------------------------ `function(LGHChat): boolean` |
| update | <code>function</code> | Function to update a chat in the database. ------------------------------------ `function(LGHChat): boolean` |
| save | <code>function</code> | Function to save a chat to the database. ------------------------------------ `function(TelegramBot.ChatId): boolean` |

<a name="usersDatabase"></a>

## usersDatabase : <code>Object</code>
Object containing user-related database functions.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| add | <code>function</code> | Function to add a new user to the database. ------------------------------------ `function(TelegramBot.User): boolean` |
| delete | <code>function</code> | Function to delete a user from the database. ------------------------------------ `function(TelegramBot.ChatId): boolean` |
| exhist | <code>function</code> | Function to check if a user exhists in the database. ------------------------------------ `function(TelegramBot.ChatId): boolean` |
| get | <code>function</code> | Function to retrieve a user from the database. ------------------------------------ `function(TelegramBot.ChatId): LGHUser` |
| update | <code>function</code> | Function to update a user in the database. ------------------------------------ `function(LGHUser): boolean` |

<a name="LGHDatabase"></a>

## LGHDatabase : <code>Object</code>
Type returned by the getDatabase function.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| innerDir | <code>string</code> | Location where the database folder should be placed (and/or generated). |
| dir | <code>string</code> | Full path to the database folder. |
| chatsDir | <code>string</code> | Full path to the chats folder within the database. |
| usersDir | <code>string</code> | Full path to the users folder within the database. |
| chats | [<code>chatsDatabase</code>](#chatsDatabase) | Object containing chat-related database functions. |
| users | [<code>usersDatabase</code>](#usersDatabase) | Object containing user-related database functions. |
| unload | <code>function</code> | Function to unload chats from memory. |

<a name="LibreGHelp"></a>

## LibreGHelp : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| GHbot | [<code>LGHInterface</code>](#LGHInterface) | Public interface for LGH Functions |
| TGbot | [<code>TelegramBot</code>](https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md) | Raw telegram bot api |
| db | [<code>LGHDatabase</code>](#LGHDatabase) | Database interface |

