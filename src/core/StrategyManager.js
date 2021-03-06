import { logDebug } from './logger';

/* eslint-disable no-underscore-dangle */

class StrategyManager {
  constructor(exchange) {
    // Helper for quickly retrieving a strategy by name.
    // Object format: { name: index, ... }
    this._strategiesByName = {};
    this._strategies = [];
    this._exchange = exchange;
  }

  _setStrategyStatus(identifier, enabled) {
    const id = this._strategies[identifier] ? identifier : this.getStrategyId(identifier);
    if (id === -1) {
      throw new Error(`Invalid identifier "${identifier}".`);
    }

    if (enabled) {
      this._strategies[id].enable();
    } else {
      this._strategies[id].disable();
    }
  }

  disableStrategy(identifier) {
    this._setStrategyStatus(identifier, false);
  }

  enableStrategy(identifier) {
    this._setStrategyStatus(identifier, true);
  }

  updateMarketData(data) {
    this._strategies.forEach((strategy) => {
      if (strategy.isEnabled()) {
        strategy.updateMarketData(data);
      }
    });
  }

  getStrategyId(name) {
    return this._strategiesByName[name] || -1;
  }

  registerStrategy(strategy) {
    // Strategy names must be unique.
    if (this._strategiesByName[strategy.name]) {
      throw new Error(`Strategy with name "${strategy.name}" already exists.`);
    }

    const id = this._strategies.length; // Current length will be object's index, considering a zero-based index.
    this._strategies.push(strategy);
    this._strategiesByName[strategy.name] = id;
    strategy.setParentExchange(this._exchange, id);
    logDebug(`Strategy "${strategy.name}" registered @ ${this._exchange.name} with id "${id}".`);
    return id;
  }
}

export default StrategyManager;
