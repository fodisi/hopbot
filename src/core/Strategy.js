/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */

import { logErrorIf } from './logger';

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
    this._executing = false;
    this._executionQueue = [];
    this._id = -1;
    this._enabled = true;
    this.exchange = undefined;
    this.config = config;
    this.name = name;
  }

  // eslint-disable-next-line no-unused-vars
  _execute(data) {
    throw new Error('Not implemented.');
  }

  execute(data) {
    if (!this.exchange) {
      logErrorIf(`Fail to execute. Strategy is not registered (id: ${this._id}).`);
      return false;
    }

    if (!this._enabled) {
      logErrorIf(`Fail to execute. Strategy is disabled (id: ${this._id}).`);
      return false;
    }

    // TODO: handle asynchronous concurrency.
    // TODO: Queue executions.
    if (this._executing) {
      logErrorIf(`Fail to execute. Strategy is already executing (id: ${this._id}).`);
      return false;
    }

    try {
      this._executing = true;
      this._execute(data);
      this._executing = false;
      return true;
    } catch (error) {
      logErrorIf(`Error executing strategy "${this.name}@${this.exchange.name}". Execution data:`, data);
      logErrorIf(`Error:`, error);
      return false;
    }
  }

  disable() {
    this.enable = false;
  }

  enable() {
    this._executionQueue = []; // Cleans up execution queue.
    this._enabled = true;
  }

  isEnabled() {
    return this._enabled;
  }

  setParentExchange(exchange, id) {
    this.exchange = exchange;
    this._id = id;
  }

  updateParams(params) {
    if (this._enabled || this._executing) {
      const msg = `Cannot update params. Strategy is enabled or executing (id: ${this._id}).`;
      logErrorIf(msg);
      throw new Error(msg);
    }

    this.config = params;
  }
}

export default Strategy;
