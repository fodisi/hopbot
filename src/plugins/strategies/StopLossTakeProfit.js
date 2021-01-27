/* eslint-disable no-underscore-dangle */
import Strategy from '../../core/Strategy';
import { logError, logDebug, logTrace, logInfo, logWarn } from '../../core/logger';
import { OrderType, SignalType } from '../../core/StrategyConfig';
import { TradingMode } from '../../core/ExchangeConfig';
import { getSellProductFromInstrument } from '../../helpers/interoperability';

/**
 * @name StopLossTakeProfit
 * @description A strategy that allows set StopLoss and TakeProfit targets.
 */
class StopLossTakeProfit extends Strategy {
  /**
   * @typedef InstrumentConfig Specific configs for the instrument id.
   * @type { Object }
   * @property { number } stopLossAt The price that triggers a stop loss sell order.
   * @property { string } lossOrderType The order type('LIMIT', 'MARKET') to be used for the stop loss order.
   * @property { number } lossSize Amount in Base Currency (Ex: BTC/USD, size in BTC)
   * @property { number } lossFunds Amount of Funds in Quote Currency (Ex: BTC/USD, funds in USD)
   * @property { number } lossPercent Percent (%) of available balance size to sell.
   * @property { number } lossPrice Used for LIMIT orders. Sell price for the stop loss limit order.
   * @property { number } takeProfitAt The price that triggers a take profit sell order.
   * @property { string } profitOrderType The order type('LIMIT', 'MARKET') to be used for the take profit order.
   * @property { number } profitSize Amount in Base Currency (Ex: BTC/USD, size in BTC)
   * @property { number } profitFunds Amount of Funds in Quote Currency (Ex: BTC/USD, funds in USD)
   * @property { number } profitPercent Percent (%) of available balance size to sell.
   * @property { number } profitPrice Used for LIMIT orders. Sell price for the take profit limit order.
   */
  /**
   * Creates an {StopLossProfitSell} object.
   * @param {string} name Strategy name
   * @param {Object.<string, InstrumentConfig>} config Strategy configs for a set of instruments (at least one).
   * @see {StrategyConfig.OrderType}
   */
  constructor(name, config = {}, signalOnly = false) {
    super(name || 'StopLossProfitSell', config, signalOnly);
    // Controls if price action is within strategy's price range to avoid false triggers and conflicts with other strategies.
    this._isPriceWithinRange = false;
    // Identifies if strategy was already executed or not.
    this._executed = false;

    if (!this._validateConfigs(config)) {
      throw new Error('Unable to create strategy StopLossTakeProfit. Invalid config.');
    }
  }

  enable() {
    super.enable();
    logInfo(`Strategy "${this.name}" enabled with the following params:`, this.config);
    Object.keys(this.config).forEach((instrument) => {
      const data = this.config[instrument];
      const product = getSellProductFromInstrument(instrument, this.exchange.name);
      const availableBalance = this.exchange._balances[product].available;
      if (availableBalance && (data.lossPercent === 0 || data.profitPercent === 0)) {
        logWarn(
          `You have ${product} ${availableBalance} available, but you are not using "lossPercent" or "profitPercent".`
        );
      }
    });
  }

  async _execute(data = {}) {
    if (this._executed) {
      logError(
        `Strategy ${this._id} - Already executed on ${this.exchange.name} for instrument id "${data.instrumentId}".`
      );
      return;
    }

    const config = this.config[data.instrumentId];
    let params;

    if (!config) {
      logError(`Strategy ${this._id} - Unable to find configs for instrument id "${data.instrumentId}".`);
      return;
    }

    if (!data.price || data.price <= 0) {
      logError(
        `Strategy ${this._id} - Param "price" is required and must be greater than zero. Received: "${data.price}"`
      );
      return;
    }

    if (!this._isPriceWithinRange && data.price >= config.stopLossAt && data.price <= config.takeProfitAt) {
      this._isPriceWithinRange = true;
      logDebug(`Strategy ${this._id} - Triggered "isWithinPriceRange @ ${data.price}.`);
    }

    const availableBalance = [TradingMode.LIVE, TradingMode.PAPER].includes(this.exchange.tradingMode)
      ? this.exchange._balances[getSellProductFromInstrument(data.instrumentId, this.exchange.name)].available || 0
      : 1; // For now, if not Live, just needs to be bigger than zero to pass test below.

    if (this._isPriceWithinRange && data.price <= config.stopLossAt && availableBalance > 0) {
      let lossSize = 0;
      if (config.lossSize && config.lossSize > 0) {
        // eslint-disable-next-line prefer-destructuring
        lossSize = config.lossSize <= availableBalance ? config.lossSize : availableBalance;
      } else if (config.lossPercent && config.lossPercent > 0) {
        lossSize = (config.lossPercent * availableBalance) / 100;
      }
      params = {
        instrumentId: data.instrumentId,
        orderType: config.lossOrderType,
        size: lossSize, // Assumes config.lossSize or lossPercent * available balance.
        funds: lossSize > 0 ? 0 : config.lossFunds,
        price: config.lossOrderType === OrderType.MARKET ? 0 : config.lossPrice,
      };
      this.signal = SignalType.SELL;
      logDebug(`StopLoss signal @ ${data.price} on ${this.exchange.name} (Strategy ${this._id} | ${this.name}).`);
    } else if (this._isPriceWithinRange && data.price >= config.takeProfitAt && availableBalance > 0) {
      let profitSize = 0;
      if (config.profitSize && config.profitSize > 0) {
        // eslint-disable-next-line prefer-destructuring
        profitSize = config.profitSize <= availableBalance ? config.profitSize : availableBalance;
      } else if (config.profitPercent && config.profitPercent > 0) {
        profitSize = (config.profitPercent * availableBalance) / 100;
      }
      params = {
        instrumentId: data.instrumentId,
        orderType: config.profitOrderType,
        size: profitSize, // Assumes config.profitSize or profitPercent * available balance.
        funds: profitSize > 0 ? 0 : config.profitFunds,
        price: config.profitOrderType === OrderType.MARKET ? 0 : config.profitPrice,
      };
      this.signal = SignalType.SELL;
      logDebug(`TakeProfit signal @ ${data.price} on ${this.exchange.name} (Strategy ${this._id} | ${this.name}).`);
    } else {
      this.signal = SignalType.NONE;
    }

    logTrace(
      `isPriceWithinRange: ${this._isPriceWithinRange}\tCurPrice: ${data.price};\tstopLossAt: ${
        config.stopLossAt
      }\ttakeProfitAt${config.takeProfitAt}\tAvailableBalance: ${availableBalance}\tSignal ${this.signal}`
    );

    if (!this._signalOnly && this.signal === SignalType.SELL) {
      try {
        this._executed = true;
        const result = await this.exchange.sell(params);
        logInfo('StopLossTakeProfit sell result received:', result);
      } catch (error) {
        this._executed = false;
        logError('', error);
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  _validateConfigs(config) {
    logDebug('Validating strategy configs.', config);
    let valid = true;
    Object.values(config).forEach((element) => {
      if (!valid) {
        return;
      }

      if (element.stopLossAt <= 0 || element.takeProfitAt <= 0) {
        logError('config.stopLossAt <= 0 || config.takeProfitAt <= 0');
        valid = false;
        return;
      }
      if (element.stopLossAt >= element.takeProfitAt) {
        logError('config.stopLossAt >= config.takeProfitAt');
        valid = false;
        return;
      }
      if (!OrderType[element.lossOrderType] || !OrderType[element.profitOrderType]) {
        logError('!OrderType[config.lossOrderType] || !OrderType[config.profitOrderType]');
        valid = false;
        return;
      }
      if (element.lossOrderType === OrderType.LIMIT && element.lossPrice <= element.stopLossAt) {
        logError('config.lossOrderType === OrderType.LIMIT && config.lossPrice <= config.stopLossAt');
        valid = false;
        return;
      }
      if (element.profitOrderType === OrderType.LIMIT && element.profitPrice <= element.takeProfitAt) {
        logError('config.profitOrderType === OrderType.LIMIT && config.profitPrice <= config.takeProfitAt');
        valid = false;
        return;
      }
      if (element.lossSize <= 0 && element.lossFunds <= 0 && element.lossPercent <= 0) {
        logError('config.lossSize <= 0 && config.lossFunds <= 0 && config.lossPercent <= 0');
        valid = false;
        return;
      }
      if (element.profitSize <= 0 && element.profitFunds <= 0 && element.profitPercent <= 0) {
        logError('config.profitSize <= 0 && config.profitFunds <= 0 && config.profitPercent <= 0');
        valid = false;
        return;
      }
      if (element.lossPercent > 100 || element.profitPercent > 100) {
        logError('config.lossPercent > 100 || config.profitPercent > 100');
        valid = false;
      }
    });

    return valid;
  }

  async updateMarketData(data = {}) {
    if (!this._executed) {
      await this.execute(data);
    }
  }
}

export default StopLossTakeProfit;
