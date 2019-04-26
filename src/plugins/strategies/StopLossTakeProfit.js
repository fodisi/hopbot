import Strategy from '../../core/Strategy';
import { logErrorIf } from '../../core/logger';

class StopLossTakeProfit extends Strategy {
  /**
   * Creates an {StopLossProfitSell} object.
   * @param {string} name Strategy name
   * @param {Dictionary} config Strategy params.
   *    params = {
   *        'product-id': {
   *            stopLossAt: 0.0,
   *            lossOrderType: '', // StrategyConfig.OrderType
   *            lossSize: 0., // Amount in Quote Currency (Ex: BTC/USD, size in BTC)
   *            lossAmount: 0.0, // FUTURE USE - Amount in Quote Currency (Ex: BTC/USD, size in BTC)
   *            lossPrice: '', // Used for LIMIT orders
   *            takeProfitAt: 0.0,
   *            profitOrderType: '', // StrategyConfig.OrderType
   *            profitSize: 0., // Amount in Quote Currency (Ex: BTC/USD, size in BTC)
   *            profitAmount: 0.0, // FUTURE USE - Amount in Quote Currency (Ex: BTC/USD, size in BTC)
   *            profitPrice: '', // Used for LIMIT orders
   *        }
   *    }
   * @see {StrategyConfig.OrderType}
   */
  constructor(name, config = {}) {
    super(name || 'StopLossProfitSell', config);
  }

  _execute(data = {}) {
    if (!data.product || !this.config[data.product]) {
      logErrorIf(`Product is empty or config not found. Received product: "${data.product}":`);
      return;
    }

    if (!data.price || data.price <= 0) {
      logErrorIf(`Invalid param "price". Received: "${data.price}"`);
      return;
    }

    const config = this.config[data.product];
    if (data.price <= config.stopLossAt) {
      // sell
      return;
    }

    if (data.price >= config.stopProfitAt) {
      // sell
    }
  }
}

export default StopLossTakeProfit;
