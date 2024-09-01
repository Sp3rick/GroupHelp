# Permissions

Permissions is the system that define what the user is allowed or disallowed to do inside your group, what commands he can and can't use, and trough [roles](roles.md) authority level, who he can penalize and who not

An user inherits the autorithy level from the higher level among his roles

You can always see the permissions and level that an user owns using `/perms`

---

## Calculating user permissions

The calculation of user permissions is made by levels of priority based on this order (the following list goes from lowest priority to higher):


- **👥 Group basic permissions**  
  The basic group permissions that's applied by default to every user, that has lowest priority on perms calculation     
  **🔧 How to edit:** `/settings` -> `Other (button)` -> `Permissions` -> `Commands permissions`   
  <br/><br/>

- **👲 Admin basic permissions**  
  Basic group permissions that's applied to every group administrator   
  **🔧 How to edit:** `/settings` -> `Other (button)` -> `Permissions` -> `Commands permissions`   
  <br/><br/>

- **🎓 Roles permissions**  
  Permission set of each [role](roles.md/#bot-roles), priority ordered from lowest role Authority level to higher   
  **🔧 How to edit:** [Bot roles promotion commands](roles.md/#bot-roles)   
  <br/><br/>

- **👮 Admin permissions**  
  Permissions inhered from administrator telegram settings, if an admin can do an action trough telegram, he will be able to do so also trough LibreGroupHelp    
  **🔧 How to edit:** `/admin`, `/perms` or telegram settings
  <br/><br/>
  
- **👤 User permissions**  
  Permission applyed only to that one specific user, it takes over maximum priority on perms calculation, essential for more granular permissions control    
  **🔧 How to edit:** Currently not implemented   
  <br/><br/>


Each permission can be either ✅ allowing wise, 🔘 neutral, or ❌ disallowing wise, as example, if `Group basic permissions` (lowest priority) allows the `/rules` command, but `User permissions` (highest priority) disallow it, this user won't be able to use `/rules`

Neutral state instead, allows an higher priority level to inherit from lowest, when creating custom roles we advise you to use always the neutral state if the role you are making is not limitation-focused

</br>