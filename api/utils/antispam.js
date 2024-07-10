const {isValidUsername, isValidHost, isString, isValidId, isIpAddress } = require("./utils.js");

//Be sure to store only t.me/path
function tgLinkValidator(string)
{
    
    if(!isString(string)) return false;

    var splitted = string.split(":");
    var specialId = splitted[splitted.length-1];
    if(string.includes(":") && (isValidId(specialId) || specialId == "|hidden"))
        return string;

    if(string.includes("telegram.me/"))
        string = string.replace("telegram.me/", "t.me/");
    if(string.includes("https://t.me/"))
        string = string.replace("https://t.me/", "t.me/");
    if(string.includes("http://t.me/"))
        string = string.replace("http://t.me/", "t.me/");

    if(string.startsWith("t.me/joinchat/") && string.length < 56 )
        return string;

    if(string.startsWith("t.me/+") && string.length < 56 )
        return string;

    var username = isValidUsername(string);
    if(username) return "@"+username;
 
    return false;
}

function isTelegramLink(string)
{
    var tgLink = tgLinkValidator(string);

    if(!tgLink) return false;

    if(tgLink.startsWith("@") && (!string.includes("/") && !string.startsWith("@")))
        return false;

    return true;
}

//Be sure to store hostname only (www.google.com) or a full link with path when given (https://www.youtube.com/watch?v=dQw4w9WgXcQ)
function linksValidator(string)
{
    if(string.includes("://"))
        string = string.split("://")[1];

    var host = string.split("/")[0].toLowerCase();
    if( !isValidHost(host) || !host.includes(".") )
        return false;

    if(string.includes("/"))
        return string;

    var doms = host.split(".");
    if(doms.length == 4 && isIpAddress(host))
        return doms.join(".");
    else if(doms.length == 4)
        return false;
    if(doms.length > 2)
        return doms[doms.length-3]+"."+doms[doms.length-2]+"."+doms[doms.length-1] //max to subdomain
    if(host.length < 256)
        return host;
    return false;
}

/**
 * @param {string} string - hostname or full link, all without protocol (no http/https/ftp)
 * @param {Array<string>} whitelist - array of allowed links
 * @returns {Boolean}
 */
function isLinkWhitelisted(string, whitelist)
{
    var isIp = isIpAddress(string.split("/")[0]);
    if(!isIp && string.split("/")[0].split(".").length == 4) return true;
    if(isIp && whitelist.includes(string.split("/")[0])) return true

    string = string.toLowerCase();
    var SSplit = string.split(".");
    if(SSplit.length < 2) return false;
    var top = SSplit.at(-1).split("/")[0];
    var domain = SSplit.at(-2);
    for (var i = 0; i < whitelist.length; i++) {

        var link = whitelist[i].toLowerCase();

        var isEntireLink = link.includes("/");
        if(isEntireLink && string == link) return true
        else if(isEntireLink) continue;

        var linkSplit = link.split(".");
        var linkTop = linkSplit.at(-1);
        var linkDomain = linkSplit.at(-2);

        if(linkTop != top || linkDomain != domain) continue;

        if(linkSplit.length == 2) return true;

        if(linkSplit.length == 3)
        {
            if(SSplit.length != 3) continue;
            var subdomain = SSplit.at(-3);
            var linkSubdomain = linkSplit.at(-3);
            if(subdomain == linkSubdomain) return true;
        }
        
    }

    return false;
}

module.exports = {
    tgLinkValidator, isTelegramLink, linksValidator, isLinkWhitelisted
}