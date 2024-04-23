const { LGHUserName, tag } = require("./utils");

l = global.LGHLangs;

function substitute(text, user, chat, db)
{

    user = user || false;
    chat = chat || false;

    if(user)
    {
        var nameSurname = user.first_name+(user.last_name? " "+user.last_name : "");
        var surname = user.last_name || "{SURNAME}";
        var username = user.username ? "@"+user.username : "{USERNAME}";
        text = text
        .replaceAll("{ID}",user.id)
        .replaceAll("{NAME}",user.first_name)
        .replaceAll("{SURNAME}",surname)
        .replaceAll("{NAMESURNAME}",nameSurname)
        .replaceAll("{GHNAME}",LGHUserName(user, db))
        .replaceAll("{USERNAME}",username)
        .replaceAll("{MENTION}",tag(nameSurname, user.id))
        .replaceAll("{LANG}",l[user.lang].LANG_SHORTNAME)
        .replaceAll("{FLAG}",l[user.lang].FLAG)
    }
    if(chat)
    {
        var username = chat.username ? "@"+chat.username : "{GROUPUSERNAME}";
        text = text
        .replaceAll("{GROUPNAME}",chat.title)
        .replaceAll("{GROUPUSERNAME}",username)
        .replaceAll("{GROUPID}",chat.id)
    }

    return text;
}

module.exports = {substitute};