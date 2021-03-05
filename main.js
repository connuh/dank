/**
 * @author Conner
 * @since 05/03/2021
 * @version 1.0.0
 */

/**
 * Dependencies
 */
const Discord = require("./src/discord");
const Helper = require("./src/helper");

/**
 * Variables
 */
const Client = new Discord();
const config = require("./data/config.json");

/**
 * Subscribing once to the `ready` event
 */
Client.once("ready", async () => {
  /**
   * When the client is ready, we post
   * "pls shop" to the channel_id 
   * specified in data/config.json
   */
  console.log(`[memer] Fetching Shop!`);
  Client.getShop(config.memer.channel_id);
});

/**
 * Subscribing to the `message_create` evemt
 */
Client.on("message_create", async msg => {
  /**
   * If the message.author.id is not equal
   * to that of "Dank Memer" or there are no
   * embeds, we return
   */
  if(msg.author.id !== "270904126974590976" || msg.embeds.length === 0) return;

  try {
    /**
     * Attempting to parse the embed, this will
     * return an object if available otherwise
     * it returns `null`
     */
    const parsed = Helper.parseItem(msg.embeds[0].description);
    /**
     * We post the Discord webhook containing
     * all of the information about the sale!
     */
    await Helper.postItem(parsed);

    console.log(`[memer] Posted to Webhook!`);

    /**
     * We setTimeout for the reset + 1 minute
     * because I can't be bothered doing cron jobs... 
     */
    setTimeout(() => {
      console.log(`[memer] Fetching Shop!`);
      Client.getShop(config.memer.channel_id);
    }, (parsed.reset.replace(/m/g, "") * 60000) + 60 * 1000);
  } catch { };
});

/**
 * Initalise the Client using the token
 * found in data/config.json
 */
Client.init(config.token);