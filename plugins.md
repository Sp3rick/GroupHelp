<b>Rules Plugin</b>

Editable from /settings menù, creates the /rules command

Adds on "user" a custom object "rules" with following elements:

text : text of rules
entities : entities of rules text
format : boolean, true if message should be formatted (enabled by default), mean that entities will be passed on sendMessage function

Note: if format is false or entities unavaiable set message parse_mode to HTML (User should see changing format as switching betheen HTML and Formatted)
