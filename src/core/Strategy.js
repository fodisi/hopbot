/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */

import { logErrorIf } from './logger';
import { SignalType } from './StrategyConfig';

/**
 * Base strategy class.
 */
class Strategy {
  /**
   * Creates a Strategy.
   *
   * @param {string} name An unique user-friendly name for the strategy.
   * @param {dictionary} config Strategy initial configs.
   * @param {bool} signalOnly true, the strategy will generate signals only. false, will execute the strategy.
   */
  constructor(name, config = {}, signalOnly = false) {
    this._executing = false;
    this._executionQueue = [];
    this._id = -1;
    this._enabled = false;
    this._signalOnly = signalOnly;
    this.exchange = undefined;
    this.config = config;
    this.name = name;
    this.signal = SignalType.NONE;
  }

  // eslint-disable-next-line no-unused-vars
  async _execute(data) {
    return Promise.reject(new Error('Not implemented.'));
  }

  execute(data) {
    if (!this.exchange) {
      logErrorIf(`Fail to execute. Strategy is not registered (id: ${this._id}).`);
      this.signal = SignalType.NONE;
      return false;
    }

    if (!this._enabled) {
      logErrorIf(`Fail to execute. Strategy is disabled (id: ${this._id}).`);
      this.signal = SignalType.NONE;
      return false;
    }

    // TODO: handle asynchronous concurrency.
    // TODO: Queue executions.
    if (this._executing) {
      logErrorIf(`Fail to execute. Strategy id "${this._id}" is already executing.`);
      this.signal = SignalType.NONE;
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
    this._executionQueue = []; // Cleans up execution queue. FUTURE USE.
    this._enabled = true;
  }

  isEnabled() {
    return this._enabled;
  }

  setParentExchange(exchange, id) {
    this.exchange = exchange;
    this._id = id;
  }

  // Useful when using Strategy aggregators.
  updateMarketData(data = {}) {
    throw new Error('Not implemented.');
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
