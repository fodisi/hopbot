/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */

/**
 * Base strategy class.
 */
class Strategy {
  /**
   * Creates a Strategy.
   *
   * @param {string} name An unique user-friendly name for the strategy.
   * @param {dictionary} config Strategy initial configs.
   */
  constructor(name, config = {}) {
    this.id = -1; // For future use
    this.name = name;
    this.exchange = undefined;
    this.config = config;
    this.enabled = true;
  }

  // eslint-disable-next-line no-unused-vars
  _execute(data) {
    throw new Error('Not implemented.');
  }

  execute(data) {
    this._execute(data);
  }

  setParentExchange(exchange, id) {
    this.exchange = exchange;
    this.id = id;
  }
}

export default Strategy;
