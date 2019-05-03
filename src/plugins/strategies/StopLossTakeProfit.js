/* eslint-disable no-underscore-dangle */
import Strategy from '../../core/Strategy';
import { logErrorIf, logInfoIf, LogLevel } from '../../core/logger';
import { OrderType, SignalType } from '../../core/StrategyConfig';

class StopLossTakeProfit extends Strategy {
  /**
   * Creates an {StopLossProfitSell} object.
   * @param {string} name Strategy name
   * @param {Dictionary} config Strategy params.
   *    params = {
   *        'product-id': {
   *            stopLossAt: 0.0,
   *            lossOrderType: '', // StrategyConfig.OrderType
   *            lossSize: 0.0, // Amount in Base Currency (Ex: BTC/USD, size in BTC)
   *            lossFunds: 0.0, // FUTURE USE - Amount of Funds in Quote Currency (Ex: BTC/USD, funds in USD)
   *            lossPercent: 0, // FUTURE USE - % of size to sell.
   *            lossPrice: 0.0, // Used for LIMIT orders
   *            takeProfitAt: 0.0,
   *            profitOrderType: '', // StrategyConfig.OrderType
   *            profitSize: 0.0, // Amount in Base Currency (Ex: BTC/USD, size in BTC)
   *            profitFunds: 0.0, // FUTURE USE - Amount of Funds in Quote Currency (Ex: BTC/USD, funds in USD)
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
    const config = this.config[data.productId];
    let params;

    if (!config) {
      logErrorIf(`Strategy ${this._id} - Unable to find configs for product id "${data.productId}".`);
      return;
    }

    if (!data.price || data.price <= 0) {
      logErrorIf(`Strategy ${this._id} - Param "price" must be greater than zero. Received: "${data.price}"`);
      return;
    }

    if (!this._isPriceWithinRange && data.price >= config.stopLossAt && data.price <= config.takeProfitAt) {
      this._isPriceWithinRange = true;
      logInfoIf(`Strategy ${this._id} - Triggered "isWithinPriceRange @ ${data.price}.`);
      return;
    }

    if (this._isPriceWithinRange && data.price <= config.stopLossAt) {
      params = {
        productId: data.productId,
        orderType: config.lossOrderType,
        size: config.lossSize,
        funds: config.lossSize && config.lossSize > 0 ? 0 : config.lossFunds,
        price: config.lossOrderType === OrderType.MARKET ? 0 : config.lossPrice,
      };
      this.signal = SignalType.SELL;
      logInfoIf(`StopLoss signal @ ${data.price} on ${this.exchange.name} (Strategy ${this._id} | ${this.name}).`);
    } else if (this._isPriceWithinRange && data.price >= config.takeProfitAt) {
      params = {
        productId: data.productId,
        orderType: config.profitOrderType,
        size: config.profitSize,
        funds: config.profitSize && config.profitSize > 0 ? 0 : config.profitFunds,
        price: config.profitOrderType === OrderType.MARKET ? 0 : config.profitPrice,
      };
      this.signal = SignalType.SELL;
      logInfoIf(`TakeProfit signal @ ${data.price} on ${this.exchange.name} (Strategy ${this._id} | ${this.name}).`);
    } else {
      this.signal = SignalType.NONE;
    }

    if (!this._signalOnly && this.signal === SignalType.SELL) {
      try {
        await this.exchange.sell(params);
        logInfoIf(`Sell order placed @ ${data.price} on ${this.exchange.name} (Strategy ${this._id} | ${this.name}).`);
        // TODO: handle disabling strategy.
      } catch (error) {
        logErrorIf(error, LogLevel.DETAILED);
      }
    }
  }

  updateMarketData(data = {}) {
    this.execute(data);
  }
}

export default StopLossTakeProfit;
