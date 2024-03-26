Roles is managed by plugins/userHandler.js and api/rolesManager.js

An user can have multiple roles at the same time
Every role has a level, higher level means best role priority, an user inherits the level of the higher level on its roles
An user can affect with any allowed command any other user with a level lower than him

Both users and roles has their own customPerms object, user perms object has the maximal priority
(rolesManager.js) sumUserPerms() will sum for you all permissions, including roles ordered by level and user perms itself with maximum priority, this function is all you need to know what the user can and can't do

Pre-made roles are set with specific commands (/mod, /muter, /cleaner, /helper, /free) +(unset with "un" prefix, ex: "/unmod")
To set custom roles the command will be /setrole roleName
