# 📋 Commands

> ### Note for devs: 
> - **`COMMAND_`** code prefix means that the command is to be resolved on languages.
> - **`COMMAND`** codes is also used to define permitted commands on [perms](../documentation/GHBot.md/#LGHPerms) object.
> - **`@`** prefix on a command code/name means that user has permission to get the reply within private chat only (e.g., `@COMMAND_RULES`).

---

Some commands can use the **`*`** prefix (e.g., `/*rules`, `/*perms`) to force a reply on private chat, only if you have the right permissions inside the group

### General Commands

- **/settings**  
  Opens the group settings.  
  **Code:** `COMMAND_SETTINGS`

- **/rules**  
  Shows the group rules.  
  **Code:** `COMMAND_RULES`  
  **Note:** **`*`** Allowed

- **/perms**  
  Shows bot permissions of a user.  
  **Code:** `COMMAND_PERMS`  
  **Note:** **`*`** Allowed

- **/staff**  
  Shows group staff with default and custom roles.  
  **Code:** `COMMAND_STAFF`  
  **Note:** **`*`** Allowed

- **/info**  
  Shows information about a group user and allows editing.  
  **Code:** `COMMAND_INFO`  
  **Note:** **`*`** Allowed

- **/me**  
  Shows information about yourself.  
  **Code:** `COMMAND_ME`  
  **Note:** **`*`** Allowed

- **/pin**  
  Pins a chat message with or without a notification.  
  **Code:** `COMMAND_PIN`  
  **Note:** **`*`** Allowed

### Punishment Commands

- **/del**  
  Deletes a message.  
  **Code:** `COMMAND_DELETE`

- **/warn**  
  Warns a user and punishes them if they reach the group warning limit.  
  **Code:** `COMMAND_WARN`

- **/unwarn**  
  Removes a warning from a user.  
  **Code:** `COMMAND_UNWARN`

- **/delwarn**  
  Warns a user and deletes a message.  
  **Code:** `COMMAND_DELWARN`

- **/kick**  
  Kicks a user out of the group.  
  **Code:** `COMMAND_KICK`

- **/delkick**  
  Kicks a user and deletes a message.  
  **Code:** `COMMAND_DELKICK`

- **/mute**  
  Disables messaging for a user.  
  **Code:** `COMMAND_MUTE`

- **/unmute**  
  Re-enables messaging for a user.  
  **Code:** `COMMAND_UNMUTE`

- **/delmute**  
  Mutes a user and deletes a message.  
  **Code:** `COMMAND_DELMUTE`

- **/ban**  
  Permanently removes a user from the group.  
  **Code:** `COMMAND_BAN`

- **/unban**  
  Unbans a user from the group.  
  **Code:** `COMMAND_UNBAN`

- **/delban**  
  Bans a user and deletes a message.  
  **Code:** `COMMAND_DELBAN`

### Role Management Commands

- **/free**  
  Assigns the free [role](roles.md) to a user.  
  **Code:** `COMMAND_FREE`

- **/unfree**  
  Removes the free [role](roles.md) from a user.  
  **Code:** `COMMAND_UNFREE`

- **/helper**  
  Assigns the helper [role](roles.md) to a user.  
  **Code:** `COMMAND_HELPER`

- **/unhelper**  
  Removes the helper [role](roles.md) from a user.  
  **Code:** `COMMAND_UNHELPER`

- **/cleaner**  
  Assigns the cleaner [role](roles.md) to a user.  
  **Code:** `COMMAND_CLEANER`

- **/uncleaner**  
  Removes the cleaner [role](roles.md) from a user.  
  **Code:** `COMMAND_UNCLEANER`

- **/muter**  
  Assigns the muter [role](roles.md) to a user.  
  **Code:** `COMMAND_MUTER`

- **/unmuter**  
  Removes the muter [role](roles.md) from a user.  
  **Code:** `COMMAND_UNMUTER`

- **/mod**  
  Assigns the moderator [role](roles.md) to a user.  
  **Code:** `COMMAND_MODERATOR`

- **/unmod**  
  Removes the moderator [role](roles.md) from a user.  
  **Code:** `COMMAND_UNMODERATOR`

- **/cofounder**  
  Assigns the cofounder [role](roles.md) to a user.  
  **Code:** `COMMAND_COFOUNDER`

- **/uncofounder**  
  Removes the cofounder [role](roles.md) from a user.  
  **Code:** `COMMAND_UNCOFOUNDER`

### Admin Commands

- **/admin**  
  Grants admin status to a user.  
  **Code:** `COMMAND_ADMINISTRATOR`

- **/unadmin**  
  Removes admin status from a user.  
  **Code:** `COMMAND_UNADMINISTRATOR`

- **/title**  
  Sets an administrator group title.  
  **Code:** `COMMAND_TITLE`

- **/untitle**  
  Removes an administrator group title.  
  **Code:** `COMMAND_UNTITLE`

### Privacy Commands

- **/forgot**  
  Removes all data about an user from your group.  
  **Code:** `COMMAND_FORGOT`

</br>