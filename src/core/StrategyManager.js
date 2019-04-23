/* eslint-disable no-underscore-dangle */

class StrategyManager {
  constructor() {
    // Helper for quickly retrieving a strategy by name.
    // Object format: { name: index, ... }
    this._strategiesByName = {};
    this._strategies = [];
  }

  registerStrategy(strategy) {
    // Strategy names must be unique.
    if (this._strategiesByName[strategy.name]) {
      throw new Error(`Strategy with name "${strategy.name}" already exists.`);
    }

    const id = this._strategies.length; // Current length will be object's index, considering a zero-based index.
    this._strategies.push(strategy);
    this._strategiesByName[strategy.name] = id;
    strategy.setParentExchange(this, id);
    return id;
  }

  getStrategyId(name) {
    return this._strategiesByName[name] || -1;
  }

  disableStrategy(identifier) {
    this._enableDisableStrategy(identifier, false);
  }

  enableStrategy(identifier) {
    this._enableDisableStrategy(identifier, true);
  }

  _enableDisableStrategy(identifier, value) {
    const id = this._strategies[identifier] ? identifier : this.getStrategyId(identifier);

    if (id === -1) {
      throw new Error(`Invalid identifier "${identifier}".`);
    }

    this._strategies[id].enabled = value;
  }
}

export default StrategyManager;
