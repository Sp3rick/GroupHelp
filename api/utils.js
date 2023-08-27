function isNumber(str) {
    if (typeof str != "string") return false
    return !isNaN(str) && !isNaN(parseFloat(str)) 
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function parseCommand(text){

    var prefix = text[0];
    if( prefix == "/" || prefix == "!" || prefix == "." || prefix == "," || prefix == ";" ){

        console.log( "Command prefix: " + prefix );

        var temp = text.replace( prefix, "" );

        var botCommand = temp.split(" ")[0]; //the entire start@usernamebot
        var command = botCommand.split("@")[0];
        var bot = botCommand.split("@")[1];

        var args;
        var splitArgs;
        if( temp.split(" ").lentgh > 1)
        {
            args = temp.split(" ")[1];
            splitArgs = args.split(" ");
        }
        else
        {
            args = false;
            splitArgs = false;
        }


        var cmd = {
            text : text,
            prefix : prefix,
            botCommand : botCommand,
            command : command,
            bot: bot,
            args : args,
            splitArgs : splitArgs,

        }

        return cmd;


    }
    else{

        return false //is not a command

    }

}

function isValidChat(chat){

    if ( !chat.hasOwnProperty("id") || !chat.hasOwnProperty("title") || !chat.hasOwnProperty("type")){

        return false;

    }
    return true

}

function isValidUser(user){

    if ( !user.hasOwnProperty("id") || !user.hasOwnProperty("first_name") || !user.hasOwnProperty("last_name") || user.hasOwnProperty("type") ){

        return false;

    }
    return true

}

module.exports = 
{

    isNumber : isNumber,
    randomInt : randomInt,
    isValidChat : isValidChat,
    isValidUser : isValidUser,
    parseCommand : parseCommand

}
