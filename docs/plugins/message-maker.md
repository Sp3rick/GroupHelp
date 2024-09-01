# Message maker

## Informations

**File**: `api/editors/MessageMaker.js`

**Description**: This is an [editor](../documentation/editors.md) who adds a panel to allow an user to configurate easly a message with `text`, `media` and `buttons`, then, using `MessageMaker.sendMessage` function you can send it anywhere

### Substitutions

It implements also a text substitution system extended optionally trough `config.allowExternalApi`, the substitutions are as follows:

    • {ID} = user ID

    • {NAME} = first name of user

    • {SURNAME} = user surname

    • {NAMESURNAME} = name and surname

    • {GHNAME} = name in LGH format ( [userId] name/surname )

    • {USERNAME} = user @username

    • {MENTION} = link to the user profile

    • {LANG} = user language

    • {FLAG} = user language flag

    • {GROUPNAME} = group name

    • {GROUPUSERNAME} = group username

    • {GROUPID} = group id

    ---

    config.allowExternalApi substitutions:

    Syntax: FIAT{SYMBOL:OPTION}

    • {BTC} {ETH} {BNB} {SOL} {XRP} {DOGE} {TON} {ADA} ... {XMR} = crypto price, avaiable any top2000 crypto symbol

    • {TOP1} {TOP2} ... {TOP2000} = get crypto symbol at specific classific height (max 2000) ({TOP1} will translate to "BTC", so {{TOP1}} is the same of {BTC} and will give you the crypto price)

    • Options: CAP(capitalization), VOL(24h volume), SUPPLY, RANK(cap classific), NAME, EXPLORER. (example: {BTC:CAP})

    • Convert from default to specific currency: ${number}, €{number}, £{number}, CHF{number} or ₣{number}.

    • Examples: {BNB}, €{BTC}, CHF{ETH}, £{BTC:CAP}, {XMR:SUPPLY}, €{{TOP15}} £{{TOP3}:NAME}

    • Api: https://api.coincap.io/v2/assets (https://docs.coincap.io/)


    ---

    NOT IMPLEMENTED:

    • {RULES} = group regulation text

    • {DATE} = current date

    • {TIME} = current time

    • {WEEKDAY} = week day

    • {MONTH} = current month

    • {YEAR} = current year

    • {UNIX} = seconds since 1970/1/1

    


## Objects implemented

- **[customMessage](../documentation/GHBot.md/#custommessage-object)**    
**Use cases**:  
[LGHChat](../documentation/GHBot.md/#LGHChat).rules  
[LGHWelcome](../documentation/GHBot.md/#lghwelcome-object).message    
[LGHGoodbye](../documentation/GHBot.md/#LGHGoodbye).gMsg    
[LGHGoodbye](../documentation/GHBot.md/#LGHGoodbye).pMsg    

</br>

- **[simpleMedia](../documentation/GHBot.md/#simplemedia-object)**    
**Use cases**:  
[customMessage](../documentation/GHBot.md/#LGHChat).media 