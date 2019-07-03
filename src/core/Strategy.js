/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */

import { logError, logDebug } from './logger';
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

  // eslint-disable-next-line no-unused-vars
  _validateConfigs(config) {
    throw new Error('Not implemented');
  }

  async execute(data) {
    if (!this.exchange) {
      logError(`Fail to execute. Strategy is not registered (id: ${this._id}).`);
      this.signal = SignalType.NONE;
      return false;
    }

    if (!this._enabled) {
      logError(`Fail to execute. Strategy is disabled (id: ${this._id}).`);
      this.signal = SignalType.NONE;
      return false;
    }

    // TODO: handle asynchronous concurrency.
    // TODO: Queue executions.
    if (this._executing) {
      logError(`Fail to execute. Strategy id "${this._id}" is already executing.`);
      this.signal = SignalType.NONE;
      return false;
    }

    try {
      this._executing = true;
      await this._execute(data);
      this._executing = false;
      return true;
    } catch (error) {
      logError(
        `Error executing strategy "${this.name}@${this.exchange.name}". Execution data: ${JSON.stringify(data)}`,
        error
      );
      return false;
    }
  }

  disable() {
    this.enable = false;
    logDebug(`Strategy id "${this._id}" disabled.`);
  }

  enable() {
    this._executionQueue = []; // Cleans up execution queue. FUTURE USE.
    this._enabled = true;
    logDebug(`Strategy id "${this._id}" enabled.`);
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

  updateConfig(config) {
    if (this._enabled || this._executing) {
      const error = new Error(`Cannot update configs for strategy id ${this._id}. Strategy is enabled or executing.`);
      logError('', error);
      throw error;
    }

    if (!this._validateConfigs(config)) {
      const error = new Error(
        `Cannot update configs for strategy id ${this._id}. Invalid configs: ${JSON.stringify(config)}.`
      );
      logError('', error);
      throw error;
    }

    this.config = config;
  }
}

export default Strategy;
