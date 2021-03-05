/**
 * @author Conner
 * @since 05/03/2021
 * @version 1.0.05
 */

/**
 * Dependencies
 */
const { EventEmitter } = require("events");
const WS = require("ws");
const p = require("phin");

/**
 * Variables
 */
const WS_URL = "wss://gateway.discord.gg/?encoding=json&v=8";

/**
 * Discord Class
 */
class Discord extends EventEmitter {
  constructor() {
    /**
     * We call constructor to invoke
     * a new EventEmitter
     */
    super();

    /**
     * Variables
     */
    this.token = null;
    this.settings = {
      socket: null,
      heartbeat: {
        interval: null,
        sequence: null
      }
    };

    this.toEmit = [ "READY", "MESSAGE_CREATE" ];
  }

  /**
   * @param {String} data
   * 
   * Sends JSON to the WebSocket
   * which we define in the `init` function
   */
  send = data => {
    this.settings.socket.send(JSON.stringify(data));
  }

  /**
   * Sends the heartbeat using
   * the correct sequence from `this.settings`
   */
  heartbeat = () => {
    this.send({
      op: 1,
      d: this.settings.heartbeat.sequence
    });
  }

  /**
   * @param {String} data
   * 
   * Handles all data received from
   * the WebSocket (this.settings.socket.onmessage)
   */
  handle = ({ data }) => {
    try {
      /**
       * Parse the JSON so we're able to
       * use a switch-case with message OP's
       */
      let message = JSON.parse(data);

      switch(message.op) {
        /**
         * If message.op IS 10
         */
        case 10: {
          /**
           * Authenticates with the WebSocket
           */
          this.send({
            op: 2,
            d: {
              token: this.token,
              intents: 513,
              properties: {
                $os: "linux"
              }
            }
          });

          /**
           * Defines `this.settings.heartbeat.int` as a setInterval() with the timeout
           * the WebSocket specified (message.d.heartbeat_interval)
           */
          this.settings.heartbeat.int = setInterval(this.heartbeat, message.d.heartbeat_interval);

          break;
        }

        case 0: {
          /**
           * OP 0 contains a message sequence
           * that we have to send in the heartbeat
           */
          this.settings.heartbeat.sequence = message.s;
        }
      }

      /**
       * If this.toEmit ([ "READY", "MESSAGE.CREATE" ]) contains the
       * current event (message type) then we will emit this to the client
       */
      if(this.toEmit.indexOf(message.t) !== -1) this.emit(message.t.toLowerCase(), message.d);
    } catch { };
  }

  /**
   * @param {String} token
   * 
   * Sets up the initial connection
   * and defines `this.settings.socket`
   */
  init = token => {
    this.token = token;

    this.settings.socket = new WS(WS_URL);
    this.settings.socket.onmessage = this.handle;
  }

  /**
   * @param {String|Number} channel_id 
   * @returns {Boolean} 
   */
  getShop = async channel_id => {
    try {
      /**
       * Makes a POST request to the 
       * Discord channel specified in
       * config.memer.channel_id
       */
      let body = await(await (p({
        method: "POST",
        url: `https://discord.com/api/v8/channels/${channel_id}/messages`,
        headers: {
          "Content-Type": "application/json",
          "Authorization": this.token
        },
        data: {
          content: "pls shop"
        }
      }))).body.toString();

      /**
       * Parses the body as JSON
       */
      body = JSON.parse(body);

      /**
       * If `body.id` exists, message was sucesfully
       * sent so, we return true otherwise return false
       */
      if(body.id) return true;
      return false;
    } catch {
      return false; 
    };
  }
}

module.exports = Discord;