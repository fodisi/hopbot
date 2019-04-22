/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */

class Strategy {
  constructor(config = {}) {
    this.exchange = undefined;
    this.config = config;
    this.paused = false;
    this.id = -1;
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
