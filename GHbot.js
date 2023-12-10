/**
 * @typedef {import("node-telegram-bot-api")} TelegramBot
 */

/**
 * @typedef {Object} LibreGHelp
 * @property {TelegramBot} GHbot - Test
 * @property {TelegramBot} TGbot - Test
 * @property {Object} db - Test
 */

/**
 * @class
 * @classdesc
 * @param {LibreGHelp} LibreGHelp -Test
 */
function main(LibreGHelp)
{

    /**
    * @type {Object}
    */
    this.GHbot = LibreGHelp.GHbot;

    /**
     * @type {TelegramBot}
     */
    this.TGbot = LibreGHelp.TGbot;

    /**
     * @type {Object}
     */
    this.db = LibreGHelp.db;


    /**
     * @type {Object}
     */
    this.config = LibreGHelp.config;

}

module.exports = main;
