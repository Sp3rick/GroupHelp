function isNumber(str) {
    if (typeof str != "string") return false
    return !isNaN(str) && !isNaN(parseFloat(str)) 
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

}
