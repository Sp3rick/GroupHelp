# Roles Manager

## Informations

**File**: `usersHandler.js`

**Description**: This plugin manage users data and roles in the group, implements also `api/utils/rolesManager.js` to give an external interface to deal with roles

Adds on `global.roles[roleName]` data about these pre-made roles: `founder`, `moderator`, `muter`, `cleaner`, `helper`, `free`.

**Commands**: `/reload`, `/staff`, `/info`, `/perms`, `/forgot`


## Objects implemented

- **[LGHRole](../documentation/GHBot.md/#lghrole-object)**    
**Use cases**:  
[LGHChat](../documentation/GHBot.md#LGHChat).roles 

</br>

- **[LGHPerms](../documentation/GHBot.md/#lghperms-object)**  
**Use cases**:  
[LGHChat](../documentation/GHBot.md#LGHChat).basePerms   
[LGHChat](../documentation/GHBot.md#LGHChat).adminPerms    
[LGHUser](../documentation/GHBot.md#LGHUser).perms   
[LGHRole](../documentation/GHBot.md#LGHRole).perms   

</br>

- **[userStatus](../documentation/GHBot.md/#userstatus-object)**  
**Use cases**:    
[LGHChat](../documentation/GHBot.md#LGHChat).users   

</br>
