/* eslint-disable no-underscore-dangle */
import Strategy from './Strategy';
import { logInfoIf, logErrorIf } from './logger';
import { SignalConfirmationType, SignalType } from './StrategyConfig';

class MultiStrategy extends Strategy {
  constructor(name, config = {}, signalOnly = false) {
    super(name, config, signalOnly);
    // Helper for quickly retrieving a strategy by name.
    // Object format: { name: index, ... }
    this._subStrategiesByName = {};
    this._subStrategies = [];
    this._buySignalConfirmationType = SignalConfirmationType.ALL;
    this._buySignalConfirmations = -1;
    this._sellSignalConfirmationType = SignalConfirmationType.ALL;
    this._sellSignalConfirmations = -1;
  }

  setBuySignalConfirmations(type = SignalConfirmationType.ALL, confirmations = 0) {
    if (this._enabled || this._executing) {
      const msg = `Cannot update BuySignalConfirmations. Strategy is enabled or executing (id: ${this._id}).`;
      logErrorIf(msg);
      throw new Error(msg);
    }

    if (type !== SignalConfirmationType.ALL && type !== SignalConfirmationType.MINIMUM) {
      throw new Error(`Invalid buy SignalConfirmationType "${type}" for strategy id "${this._id}".`);
    }

    if (type === SignalConfirmationType.ALL && this._subStrategies.length > 0) {
      this._buySignalConfirmations = this._subStrategies.length;
    } else if (type === SignalConfirmationType.MINIMUM && confirmations > 0) {
      this._buySignalConfirmations = confirmations;
    }
    this._buySignalConfirmationType = type;
  }

  setSellSignalConfirmations(type = SignalConfirmationType.ALL, confirmations = 0) {
    if (this._enabled || this._executing) {
      const msg = `Cannot update BuySignalConfirmations. Strategy is enabled or executing (id: ${this._id}).`;
      logErrorIf(msg);
      throw new Error(msg);
    }

    if (type !== SignalConfirmationType.ALL && type !== SignalConfirmationType.MINIMUM) {
      throw new Error(`Invalid sell SignalConfirmationType "${type}" for strategy id "${this._id}".`);
    }

    if (type === SignalConfirmationType.ALL && this._subStrategies.length > 0) {
      this._sellSignalConfirmations = this._subStrategies.length;
    } else if (type === SignalConfirmationType.MINIMUM && confirmations > 0) {
      this._sellSignalConfirmations = confirmations;
    }
    this._sellSignalConfirmationType = type;
  }

  updateMarketData(data) {
    this._subStrategies.forEach((subStrategy) => {
      if (subStrategy.isEnabled()) {
        subStrategy.updateMarketData(data);
      }
    });

    let buySignals = 0;
    let sellSignals = 0;
    this._subStrategies.forEach((subStrategy) => {
      if (subStrategy.signal === SignalType.BUY) {
        // eslint-disable-next-line no-plusplus
        buySignals++;
      } else if (subStrategy.signal === SignalType.SELL) {
        // eslint-disable-next-line no-plusplus
        sellSignals++;
      }
    });

    if (buySignals >= this._buySignalConfirmations) {
      this.signal = SignalType.BUY;
    } else if (sellSignals >= this._sellSignalConfirmations) {
      this.signal = SignalType.SELL;
    } else {
      this.signal = SignalType.NONE;
    }

    if (this.signal !== SignalType.NONE) {
      this.execute(data);
    }
  }

  addSubStrategy(name, config = {}) {
    // Strategy names must be unique.
    if (this._subStrategiesByName[name]) {
      throw new Error(`SubStrategy with name "${name}" already added.`);
    }

    const strategy = new Strategy(name, config, true);
    const id = this._subStrategies.length; // Current length will be object's index, considering a zero-based index.
    this._subStrategies.push(strategy);
    this._subStrategiesByName[strategy.name] = id;
    strategy.setParentExchange(this.exchange, id);
    logInfoIf(`Strategy "${strategy.name}" registered @ ${this.exchange.name} with id "${id}".`);

    if (this._buySignalConfirmationType === SignalConfirmationType.ALL) {
      this._buySignalConfirmations = this._subStrategies.length;
    }
    if (this._sellSignalConfirmationType === SignalConfirmationType.ALL) {
      this._sellSignalConfirmations = this._subStrategies.length;
    }
    return id;
  }
}

export default MultiStrategy;
