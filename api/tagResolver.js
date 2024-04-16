const fs = require( "fs" );

if(!global.LGHTagToId) global.LGHTagToId = {};
if(!global.LGHIdToTag) global.LGHIdToTag = {};

var dbInnerDir = global.directory;
var TRFolder = dbInnerDir+"/database/tagResolver";

var tagToIdFile = TRFolder+"/tagToId.json";
var idToTagFile = TRFolder+"/idToTag.json";

var tagResolver = {

    load : function(){
        if(!fs.existsSync(TRFolder))
            fs.mkdirSync(TRFolder);
        if(!fs.existsSync(tagToIdFile))
            fs.writeFileSync(tagToIdFile, JSON.stringify(global.LGHTagToId));
        if(!fs.existsSync(idToTagFile))
            fs.writeFileSync(idToTagFile, JSON.stringify(global.LGHIdToTag));

        global.LGHTagToId  = JSON.parse(fs.readFileSync(tagToIdFile, "utf-8"));
        global.LGHIdToTag = JSON.parse(fs.readFileSync(idToTagFile, "utf-8"));
    },

    save : function(){

        if(!fs.existsSync(TRFolder))
            fs.mkdirSync(TRFolder);

        fs.writeFileSync(tagToIdFile, JSON.stringify(global.LGHTagToId));
        fs.writeFileSync(idToTagFile, JSON.stringify(global.LGHIdToTag));

    },

    log : function(msg){
        if(!msg.hasOwnProperty("from"))
            return;

        var tag = msg.from.username || false;
        var userId = msg.from.id || false;
        if(tag && userId)
        {
            global.LGHTagToId[tag] = userId;
            global.LGHIdToTag[userId] = tag;
        }
    },

    getId : function(tag)
    {
        if(global.LGHTagToId.hasOwnProperty(tag))
            return global.LGHTagToId[tag];
        return false;
    },

    getTag : function(userId)
    {
        if(global.LGHIdToTag.hasOwnProperty(userId))
            return global.LGHIdToTag[tag];
        return false;
    },

    getCommandTargetUserId : function(msg)
    {

        if(!msg.command) return false;

        if(msg.hasOwnProperty("reply_to_message"))
            return msg.reply_to_message.from.id;

        if(msg.hasOwnProperty("entities") && msg.entities.length > 1)
            if(msg.entities[1].type == "text_mention")
                return msg.entities[1].user.id;
        
        if(msg.command.splitArgs && msg.command.splitArgs.length > 0){

            var username = msg.command.splitArgs[0];
            if(msg.command.splitArgs[0].includes("t.me/"))
                username = msg.command.splitArgs[0].split("t.me/")[1];
            if(msg.command.splitArgs[0].startsWith("@"))
                username = msg.command.splitArgs[0].replace("@","");

            return this.getId(username);
        }

        return false;
    }

}

module.exports = tagResolver;