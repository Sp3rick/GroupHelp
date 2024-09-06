# Roles

You can set roles to every user on your group, the main use of roles is giving an user authority level on the group and give them a defined set of [permissions](perms.md), both relative to your group and bot

You can see what roles are assigned to users on your group using `/staff`

## Admin role

The most important role is the [Administrator](https://telegram.org/blog/supergroups), an user can get this role with `/admin` command (advised) or [directly trough your group settings](https://telegram.org/blog/admin-revolution#admin-rights), by fact it's the role directly correlated with the acutal admin from telegram side, you can change admin title using `/title`

LibreGroupHelp will bind the telegram admin permissions to match with the correlated commands and functions

If for example by telegram settings your admin can remove users, he will automatically obtain this LibreGroupHelp commands: `/kick`, `/warn`, `/mute`, `/ban`

---

## Bot roles

LibreGroupHelp aims to provide a more granular control about permissions of your users and staffers, a granularity that trough telegram admins function can't be reached, that's why you can give the role `/muter` to allow a staffer to use just the `/mute` command, 

Currently these are the roles implemented by default from LibreGroupHelp:

- **👑 Founder**    
  The role avaiable only for group owner    
  **Commands:** `All`   
  **Promotion:** Telegram settings (transfer ownership)     
  **🔏 Bot permissions:** `All`     
  **📗 Authority:** 100     
    <br/><br/>           

- **⚜️ Co-Founder**  
  The role to give full bot permissions to an user  
  **Commands:** `All`   
  **Promotion:** `/cofounder`, `/uncofounder`  
  **🔏 Bot permissions:** `All`     
  **📗 Authority:** 90  
    <br/><br/>    

- **👮 Administrator**  
  The role given to every group admin on telegram  
  **Commands:** Depends on admin permissions  
  **Promotion:** `/admin`, `/unadmin` or [Telegram settings](https://telegram.org/blog/admin-revolution#admin-rights)    
  **🔏 Bot permissions:** `immune`, `flood`, `spam`, `nsfw`, `night`, `media`, `alphabets`, `words`, `length` (for `roles` and `settings` depends on telegram admin permissions)    
  **📗 Authority:** 0       
  <br/><br/>

  - **👷🏻‍♂️ Moderator**  
  A role that helps moderating your group 
  **Commands:** `/rules`, `/info`, `/pin`, `/geturl`, `/delete`, `/info`, `/pin`, `/kick`, `/warn`, `/unwarn`, `/mute`, `/unmute`, `/ban`, `/unban`     
  **Promotion:** `/admin`, `/unadmin` or [Telegram settings](https://telegram.org/blog/admin-revolution#admin-rights)    
  **🔏 Bot permissions:** `immune`, `flood`, `spam`, `nsfw`, `night`, `media`, `alphabets`, `words`, `length`      
  **📗 Authority:** 60           
  <br/><br/>

- **🙊 Muter**  
  Staffer who can mute users  
  **Commands:** `/rules`, `/mute`, `/unmute`  
  **Promotion:** `/muter`, `/unmuter`  
  **🔏 Bot permissions:** none      
  **📗 Authority:** 40  
  <br/><br/>

- **🛃 Cleaner**  
  Staffer who can delete messages from your group   
  **Commands:** `/rules`, `/delete`     
  **Promotion:** `/cleaner`, `/uncleaner`  
  **🔏 Bot permissions:** none    
  **📗 Authority:** 20  
  <br/><br/>

- **⛑ Helper**  
  An user that contributes to the group support  
  **Commands:** `/rules`, `/info`, `/geturl`   
  **Promotion:** `/helper`, `/unhelper`     
  **🔏 Bot permissions:** none    
  **📗 Authority:** 10  
  <br/><br/>

- **🔓 Free**  
  An user free from any bot restriction  
  **Commands:** none    
  **Promotion:** `/free`, `/unfree`     
  **🔏 Bot permissions:** `immune`, `flood`, `spam`, `nsfw`, `night`, `media`, `alphabets`, `words`, `length`   
  **📗 Authority:** 0   


---

## Custom roles

Custom roles is a functionality still not implemented but we aim to add as soon as possible, the priority depends from the acutal request from users

Custom roles will unlock you the possibility to create your own group roles with any Role Level and any permission set you want, speeding up your administration work

</br>
