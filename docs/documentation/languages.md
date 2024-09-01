## Language info

LibeGrouHelp has a language configuration for users (user.lang) and for groups (chat.lang)

When our bot is added to a group the default group language will be inherited from the user who added LGH Bot

*Note: currently LGH does not inherit the user language from it's device telegram settings, but it's planned as a future feature*

`global.LGHLangs` is an object with every language translation loaded   
Usually plugins get that using `l = global.LGHLangs`   
To translate use this format: `l[lang].KEY`

Don't bother for missing keys in case of missing translation, every missing key is already replaced with the english one version


## Extend bot dictionary

The main language is english, so open `langs/en_en.json` and simply insert new parameters there

```json
"FLAG" : "🇬🇧",
"LANG_SELECTOR" : "🇬🇧 English",
"LANG_NAME" : "International English",
"LANG_SHORTNAME" : "English",
"LANG_CHOOSE" : "🇬🇧 Choose your language",
"LANG_CHOOSE_GROUP" : "🇬🇧 Choose group language",
"EXAMPLE_MESSAGE" : "This a new item on dictionary for wiki example"
```