function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

function stringArrayToNumber(array)
{
    array.forEach((item, index)=>{array[index] = Number(item)});
    return array;
}

//generate smaller missing number in array or add one new
function genSmallerOrNew(array)
{
    var index = 0;
    while(true)
    {
        if(!array.includes(index))
            return index;
        else
            index++;
    }
}
//////////////////

//TODO: identify and block (resolve(false)) for a while users that are acutally spamming requests


global.LGHPendingMessages = {};
maxUserRequests = 3; //maximum requests of a single user that bot can handle in same moment

//this function contines loop until arrives
function forceHandleRequest(bot, method, ...args)
{return new Promise( async (resolve, reject) =>{
    while(true)
    {
        var retryes = 0;
        if(retryes > 10){resolve(false); return;}

        try {
            var result = await bot[method](...args);
            resolve(result);
            return;
        } catch (error) {
            //console.log(error) //uncomment this to handle undiscovered loop traps
            if(error.code != "ETELEGRAM")
            {
                console.log("Unknown error in forceHandleRequest()");
                console.log(error);
                return;
            }
            var errDescription = error.response.body.description;
            console.log("SafeTelegram.js loop error: " +errDescription); //uncomment to futher debug
            if(errDescription.includes("Too Many Requests")){}
            else if(errDescription.includes("query is too old"))
                {resolve(false); return;}
            else
                {reject(error); return;}
        }

        ++retryes;
        await sleep(5000);
    }
} )}

//handle safely any request limiting each user who is the cause of the request (NOTE: if needed in args chatId should be inserted twice)
function pushUserRequest(bot, method, userId, ...args)
{return new Promise( async (resolve, reject) => {

    var PM = global.LGHPendingMessages;
    var limit = maxUserRequests;

    //prepare for request
    if(!PM.hasOwnProperty(userId)) PM[userId] = {};
    var key = genSmallerOrNew( stringArrayToNumber( Object.keys(PM[userId]) ) );
    if(key > limit){ resolve(false); console.log("[SafeTelegram.js] a request has been dropped out");return;}//drop out //reject(new Error("LGH_USER_REQUESTS_LIMIT_HIT"))

    //request
    PM[userId][key] = forceHandleRequest(bot, method, ...args);
    try {
        var result = await PM[userId][key];
        resolve(result);
    } catch (error) {
        reject(error);
    }
    delete PM[userId][key];
    return;

} )}

module.exports = {forceHandleRequest, pushUserRequest}