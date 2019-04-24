/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */

import { logInfoIf, LogLevel } from './logger';

/**
 * Base strategy class.
 */
class Strategy {
  /**
   * Creates a Strategy.
   *
   * @param {string} name An unique user-friendly name for the strategy.
   * @param {dictionary} params Strategy initial configs.
   */
  constructor(name, params = {}) {
    this._executing = false;
    this._params = params;
    this._executionQueue = [];
    this._id = -1;
    this._exchange = undefined;
    this._enabled = true;
    this.name = name;
  }

  // eslint-disable-next-line no-unused-vars
  _execute(data) {
    throw new Error('Not implemented.');
  }

  execute(data) {
    if (!this._exchange) {
      logInfoIf(`Fail to execute. Strategy is not registered (id: ${this._id}).`, LogLevel.DEEP);
      return false;
    }

    if (!this._enabled) {
      logInfoIf(`Fail to execute. Strategy is disabled (id: ${this._id}).`, LogLevel.DEEP);
      return false;
    }

    // TODO: handle asynchronous concurrency.
    if (this._executing) {
      logInfoIf(`Fail to execute. Strategy is already executing (id: ${this._id}).`);
      return false;
    }

    this._executing = true;
    this._execute(data);
    this._executing = false;
    return true;
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
    this._exchange = exchange;
    this._id = id;
  }

  updateParams(params) {
    if (this._enabled || this._executing) {
      throw new Error(`Cannot update params. Strategy is enabled or executing (id: ${this._id}).`);
    }

    this._params = params;
  }
}

export default Strategy;
