/**NOTE:
 * to be sure that api is going to give you valid values without errors check if isAvaiable() returns true
 */

const https = require('https');
isLoaded = false;
topCrypto = {}; //BTC : {object}
topCryptoArray = [];
fiatRates = {}; //EUR : rateUsd

function bodyGet(url)
{return new Promise((resolve, reject)=>{

    https.get(url, res => {

        var data ="";
        res.on('data', chunk => {
            data+=chunk;
        });

        res.on('end', () => {
            resolve(JSON.parse(data));
            return;
        });

    }).on('error', err => {
        resolve(false);
        return;
    });

})}

async function updatePrices()
{try {
    
    var request = await bodyGet("https://api.coincap.io/v2/assets?limit=2000");
    if(!request) return;
    topCryptoArray = request.data;
    
    if(!(topCryptoArray.length > 0)) return;

    topCrypto = {};
    topCryptoArray.forEach((crypto, index) => {
        topCrypto[crypto.symbol] = topCryptoArray[index];
    });


    request = await bodyGet("https://api.coincap.io/v2/rates?type=fiat");
    if(!request) return;
    newFiatRates = request.data;

    fiatRates = {};
    newFiatRates.forEach((rate, index) => {
        if(rate.type == "crypto") return;
        fiatRates[rate.symbol] = Number(rate.rateUsd);
    })

    if(!isLoaded) isLoaded = true;

} catch (error) {
    
}}

function cutPrice(number)
{
    var result = Number(number).toFixed(10).slice(0,12);
    result = Number(result);
    if(result > 9)
        result = result.toFixed(2);
    return Number(result);
}

function convert(price, currency)
{
    var fiat = getCurrencyPrice(currency);
    return ( (price/1) * (1/fiat) );
}

function humanPrice(number)
{
    let numberString = number.toString();
    
    let parts = numberString.split(".");
    let integerPart = parts[0];
    let decimalPart = parts[1] ? "." + parts[1] : "";

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return integerPart + decimalPart;
}

function priceToNumber(textNum)
{
    return Number(textNum.replaceAll(",","").replaceAll(".",""));
}

function supplyToBlock(currentSupply) {

    // Initial reward per block
    const initialRewardPerBlock = 50; // In Bitcoin

    // Calculate the number of halvings occurred since the beginning of the Bitcoin blockchain
    let halvings = 0;
    let totalBlocks = 0;
    let supply = 0;
    while (supply < currentSupply) {
        supply += initialRewardPerBlock * Math.pow(0.5, halvings) * 210000;
        totalBlocks += 210000;
        halvings++;
    }

    // Calculate the current block
    const remainingSupply = supply - currentSupply;
    const remainingBlocks = remainingSupply / (initialRewardPerBlock * Math.pow(0.5, halvings - 1));
    const currentBlock = totalBlocks - remainingBlocks;

    return currentBlock;
}
/////////////////

async function load()
{
    await updatePrices();
    setInterval( ()=>{
    updatePrices();
    }, 600000 ); //10 minutes
}

function isAvaiable()
{
    return isLoaded;
}

/**
 * Returns an object representing a cryptocurrency.
 * @typedef {Object} CoincapCrypto representing a cryptocurrency.
 * @property {string} id - Cryptocurrency ID.
 * @property {string} rank - Cryptocurrency rank.
 * @property {string} symbol - Cryptocurrency symbol.
 * @property {string} name - Full name of the cryptocurrency.
 * @property {?string} supply - Circulating supply of the cryptocurrency.
 * @property {?string} maxSupply - Maximum supply of the cryptocurrency.
 * @property {?string} marketCapUsd - Market capitalization in USD of the cryptocurrency (can be null).
 * @property {?string} volumeUsd24Hr - 24-hour trading volume in USD (can be null).
 * @property {?string} priceUsd - Price in USD of the cryptocurrency (can be null).
 * @property {?string} changePercent24Hr - Percentage change in the last 24 hours (can be null).
 * @property {?string} vwap24Hr - 24-hour volume-weighted average price (can be null).
 * @property {string} explorer - Cryptocurrency explorer URL.
 */


/**
 * @param {string} symbol 
 * @return {CoincapCrypto}
 */
function getTop(height)
{
    return topCryptoArray[height-1];
}

/**
 * @param {string} symbol 
 * @return {CoincapCrypto}
 */
function getCoin(symbol)
{
    if(!topCrypto[symbol]) return false;
    return topCrypto[symbol];
}

function getCurrencyPrice(currency)
{
    return Number(fiatRates[currency]);
}

function getCoinPrice(symbol, currency)
{
    currency = currency || "USD";

    var price = Number(getCoin(symbol).priceUsd);
    price = convert(price, currency);

    return humanPrice(cutPrice(price));
}

function getCoinCap(symbol, currency)
{
    currency = currency || "USD";
    
    var cap = Number(getCoin(symbol).marketCapUsd);
    cap = convert(cap, currency).toFixed(0);

    return humanPrice(cap);
}

function getCoinVol(symbol, currency)
{
    currency = currency || "USD";
    
    var vol = Number(getCoin(symbol).volumeUsd24Hr);
    vol = convert(vol, currency).toFixed(0);

    return humanPrice(vol);
}

function getCoinSupply(symbol)
{    
    var supply = Number(getCoin(symbol).supply);
    supply = cutPrice(supply);

    return humanPrice(supply);
}

function getCoinMaxSupply(symbol, currency)
{
    currency = currency || "USD";
    
    var maxSupply = Number(getCoin(symbol).maxSupply);
    if(maxSupply == null) return "∞";
    supply = cutPrice(maxSupply);

    return humanPrice(maxSupply);
}

function getCoinList()
{
    return Object.keys(topCrypto);
}

//it's not accurate due to api bitcoin supply imprecision
function halvingLeftBlocks()
{
    var curBlock = supplyToBlock(priceToNumber(getCoinSupply("BTC")));
   
    var halvings = Math.trunc(curBlock / 210000);
    var leftBlocks = 210000 - (curBlock - (halvings * 210000));

    return leftBlocks
}


//https://api.coincap.io/v2/assets?limit=2000

module.exports = {
    load, isAvaiable,
    getTop, 
    getCoin, getCoinPrice, getCoinCap, getCoinVol, getCoinSupply, getCoinMaxSupply,
    getCoinList,
}