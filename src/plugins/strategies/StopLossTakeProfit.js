/* eslint-disable no-underscore-dangle */
import Strategy from '../../core/Strategy';
import { logError, logDebug, logTrace } from '../../core/logger';
import { OrderType, SignalType } from '../../core/StrategyConfig';
import { getSellProductFromInstrument } from '../../helpers/interoperability';

class StopLossTakeProfit extends Strategy {
  /**
   * Creates an {StopLossProfitSell} object.
   * @param {string} name Strategy name
   * @param {Dictionary} config Strategy params.
   *    params = {
   *        'instrument-id': {
   *            stopLossAt: 0.0,
   *            lossOrderType: '', // StrategyConfig.OrderType
   *            lossSize: 0.0, // Amount in Base Currency (Ex: BTC/USD, size in BTC)
   *            lossFunds: 0.0, // FUTURE USE - Amount of Funds in Quote Currency (Ex: BTC/USD, funds in USD)
   *            lossPercent: 0, // FUTURE USE - % of available balance size to sell.
   *            lossPrice: 0.0, // Used for LIMIT orders
   *            takeProfitAt: 0.0,
   *            profitOrderType: '', // StrategyConfig.OrderType
   *            profitSize: 0.0, // Amount in Base Currency (Ex: BTC/USD, size in BTC)
   *            profitFunds: 0.0, // FUTURE USE - Amount of Funds in Quote Currency (Ex: BTC/USD, funds in USD)
   *            profitPercent: 0.0, // FUTURE USE - % of available balance size to sell.
   *            profitPrice: 0.0, // Used for LIMIT orders
   *        }
   *    }
   * @see {StrategyConfig.OrderType}
   */
  constructor(name, config = {}, signalOnly = false) {
    super(name || 'StopLossProfitSell', config, signalOnly);
    // Controls if price action is within strategy's price range to avoid false triggers and conflicts with other strategies.
    this._isPriceWithinRange = false;
    // TODO: Validate config params.
  }

  async _execute(data = {}) {
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
      return;
    }

    if (this._isPriceWithinRange && data.price <= config.stopLossAt) {
      let lossSize = 0;
      if (config.lossSize && config.lossSize > 0) {
        // eslint-disable-next-line prefer-destructuring
        lossSize = config.lossSize;
      } else if (config.lossPercent && config.lossPercent > 0) {
        const availableBalance =
          this.exchange._balances[getSellProductFromInstrument(data.instrumentId, this.exchange.name)].available || 0;
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
    } else if (this._isPriceWithinRange && data.price >= config.takeProfitAt) {
      let profitSize = 0;
      if (config.profitSize && config.profitSize > 0) {
        // eslint-disable-next-line prefer-destructuring
        profitSize = config.profitSize;
      } else if (config.profitPercent && config.profitPercent > 0) {
        const availableBalance =
          this.exchange._balances[getSellProductFromInstrument(data.instrumentId, this.exchange.name)].available || 0;
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

    logTrace(`IsPriceWithinRange: ${this._isPriceWithinRange}`);
    logTrace(`Signal ${this.signal}`);
    if (!this._signalOnly && this.signal === SignalType.SELL) {
      try {
        await this.exchange.sell(params);
        // TODO: handle disabling strategy.
      } catch (error) {
        logError('', error);
      }
    }
  }

  updateMarketData(data = {}) {
    this.execute(data);
  }
}

export default StopLossTakeProfit;
