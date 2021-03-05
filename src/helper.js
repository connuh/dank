/**
 * @author Conner
 * @since 05/03/2021
 * @version 1.0.0
 */

/**
 * Dependencies
 */
const p = require("phin");

/**
 * Variables
 */
const config = require("../data/config.json");

/**
 * Helper Class
 */
class Helper {
  /**
   * @param {String} item 
   * @returns {Object}
   * 
   * Yes, I made this a seperate class
   * due to how ugly it looks, get over it.
   */
  static parseItem = item => {
    try {
      return {
        reset: item.split("resets in ")[1].split(")")[0],
        name: item.split("\n")[1].split("**")[1].split("**")[0],
        emoji: item.split("\n")[1].split(" **")[0].split(" ")[1],
        price: item.split("\n")[1].split("[")[1].split("]")[0],
        discount: item.split("\n")[1].split("***")[1].split("%")[0],
        description: item.split("\n")[2].replace(/\*/g, "")
      }
    } catch {
      throw new Error("Invalid Embed!");
    }
  }

  /**
   * @param {Object} data
   * @param {String} data.reset
   * @param {String} data.name
   * @param {String} data.emoji
   * @param {String} data.price
   * @param {String} data.discount
   * @param {String} data.description
   * @returns {Boolean}
   */
  static postItem = async (data = { reset: null, name: null, emoji: null, price: null, discount: null, description: null }) => {
    try {
      /**
       * Sends a POST request to the webhook
       * specified in `config.memer.webhook`
       */
      let body = await(await p({
        method: "POST",
        url: config.memer.webhook,
        headers: {
          "Content-Type": "application/json"
        },
        data: {
          embeds: [
            {
              title: `There is a Lightning Sale @ ${data.discount}% OFF!`,
              url: "https://github.com/connuh/dank",
              description: `**${data.name}** ─ **${data.price}**\n\n${data.description}`,
              thumbnail: {
                url: `https://cdn.discordapp.com/emojis/${data.emoji.split(":")[2].split(">")[0]}.png?v=1`
              },
              footer: {
                text: `Resets in ${data.reset}!`
              }
            }
          ]
        }
      })).body.toString();

      /**
       * If the length of the body is 0
       * this means the webhook sent succesfully
       */
      if(body.length === 0) return true;
      throw new Error("Invalid Webhook!");
    } catch {
      throw new Error("Invalid Webhook!");
    }
  }
}

module.exports = Helper;