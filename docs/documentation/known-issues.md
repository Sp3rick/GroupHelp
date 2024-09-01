# Known possible bugs:

-sometimes db.chats.update in plugins may be not used at all because you can still edit the global object cause to reference, not using it may cause some issue. +if global reference get cleared too early code may try to access and inexistent variable

-cleanHTML() may be not applyed in some text where it should, and nothing assure that it's 100% able to clean everything needed for telegram api

-if you add a new permission on userPerms object, every userPerms object should be updated adding that, otherwise this may cause incorrect result in sumUserPerms

-in some unkown cases you may get stuck in exceptions menu and SafeGram.js will block any user request due too high accumulated volume of something pending

-permissions setup on first bot adding to groups is not the same as using /reload that's more complete