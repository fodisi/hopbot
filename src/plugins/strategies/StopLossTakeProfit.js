/* eslint-disable no-underscore-dangle */
import Strategy from '../../core/Strategy';
import { logErrorIf, logInfoIf } from '../../core/logger';
import { OrderType } from '../../core/StrategyConfig';

class StopLossTakeProfit extends Strategy {
  /**
   * Creates an {StopLossProfitSell} object.
   * @param {string} name Strategy name
   * @param {Dictionary} config Strategy params.
   *    params = {
   *        'product-id': {
   *            stopLossAt: 0.0,
   *            lossOrderType: '', // StrategyConfig.OrderType
   *            lossSize: 0., // Amount in Base Currency (Ex: BTC/USD, size in BTC)
   *            lossFunds: 0.0, // FUTURE USE - Amount of Funds in Quote Currency (Ex: BTC/USD, funds in USD)
   *            lossPrice: '', // Used for LIMIT orders
   *            takeProfitAt: 0.0,
   *            profitOrderType: '', // StrategyConfig.OrderType
   *            profitSize: 0., // Amount in Base Currency (Ex: BTC/USD, size in BTC)
   *            profitFunds: 0.0, // FUTURE USE - Amount of Funds in Quote Currency (Ex: BTC/USD, funds in USD)
   *            profitPrice: '', // Used for LIMIT orders
   *        }
   *    }
   * @see {StrategyConfig.OrderType}
   */
  constructor(name, config = {}) {
    super(name || 'StopLossProfitSell', config);
    // Controls if price action is within strategy's price range to avoid false triggers and conflicts with other strategies.
    this._isWithinPriceRange = false;
    // TODO: Validate config params.
  }

  _execute(data = {}) {
    const config = this.config[data.productId];

    if (!config) {
      logErrorIf(`Strategy ${this._id} - Unable to find configs for product id "${data.productId}".`);
      return;
    }

    if (!data.price || data.price <= 0) {
      logErrorIf(`Strategy ${this._id} - Param "price" must be greater than zero. Received: "${data.price}"`);
      return;
    }

    if (!this._isWithinPriceRange && data.price >= config.stopLossAt && data.price <= config.takeProfitAt) {
      this._isWithinPriceRange = true;
      logInfoIf(`Strategy ${this._id} - Triggered "isWithinPriceRange @ ${data.price}.`);
      return;
    }

    if (this._isWithinPriceRange && data.price <= config.stopLossAt) {
      // sell
      const params = {
        productId: data.productId,
        orderType: config.lossOrderType,
        size: config.lossSize,
        funds: config.lossSize && config.lossSize > 0 ? 0 : config.lossFunds,
        price: config.lossOrderType === OrderType.MARKET ? 0 : config.lossPrice,
      };
      this._exchange.sell(params);
      return;
    }

    if (this._isWithinPriceRange && data.price >= config.takeProfitAt) {
      const params = {
        productId: data.productId,
        orderType: config.profitOrderType,
        size: config.profitSize,
        funds: config.profitSize && config.profitSize > 0 ? 0 : config.profitFunds,
        price: config.profitOrderType === OrderType.MARKET ? 0 : config.profitPrice,
      };
      this._exchange.sell(params);
    }
  }
}

export default StopLossTakeProfit;
