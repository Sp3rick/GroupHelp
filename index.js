global.LGHVersion = "0.1.2";
global.directory = __dirname; //used from /api/database.js
const fs = require("fs");
const util = require('util')
const config = JSON.parse( fs.readFileSync( __dirname + "/config.json" ) )

console.log("Starting...")
console.log( "Libre group help current version: " + global.LGHVersion )

function print(text)
{
    console.log( "[index.js] " + text )
}

async function main()
{

    console.log( "Loading languages..." )
    var l = {}//Object that store all languages
    var rLang = config.reserveLang;
    l[rLang] = JSON.parse( fs.readFileSync( __dirname + "/langs/" + rLang + ".json") ); //default language to fix others uncompleted langs
    console.log( "-loaded principal language: \"" + l[rLang].LANG_NAME + "\" " + rLang )

    var langs = fs.readdirSync( __dirname + "/langs" );
    langs = langs.slice( langs.indexOf(rLang + ".json")+1 );

    var defaultLangObjects = Object.keys(l[rLang])
    langs.forEach( (langFile) => {

        var fileName = langFile.replaceAll( ".json", "" );
        l[fileName] = JSON.parse( fs.readFileSync( __dirname + "/langs/" + langFile ) );
        console.log("-loaded language: \"" + l[fileName].LANG_NAME + "\" " + fileName);

        defaultLangObjects.forEach( (object) => { //detect and fill phrases from incompleted languages with default language (config.reserveLang)

            if( !l[fileName].hasOwnProperty( object ) )
            {

                console.log( "  identified missing paramenter " + object + ", replacing from " + rLang );
                l[fileName][object] = l[rLang][object];

            };

        } )
        
    } );

    global.LGHLangs = l; //add global reference


    //load bot
    var LGHelpBot = require( "./main.js" );
    var {GHbot, TGbot, db} = await LGHelpBot(config);
    

    //load modules and run their function
    console.log( "Loading modules..." )
    var directory = fs.readdirSync( __dirname + "/plugins/" );
    directory.forEach( (fileName) => {

        var func = require( __dirname + "/plugins/" + fileName );
        func({GHbot : GHbot, TGbot : TGbot, db : db, config : config})
        console.log( "\tloaded " + fileName)

    } )




    console.log("#LibreGroupHelp started#")



}
main();

