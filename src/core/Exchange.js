/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

import { APIType, APIMode, TradingMode, ConnectionStatus } from './ExchangeConfig';
import { logErrorIf } from './logger';

class Exchange {
  constructor(options = {}) {
    this.isTrading = false;
    this.isExecuting = false;
    this.apiType = APIType.REST;
    this.apiUri = '';
    this.wsUri = '';
    this.connectionStatus = ConnectionStatus.CLOSED;
    this.authClient = undefined;
    this.publicClient = undefined;
    this._orderBook = undefined;

    this.auth = options.auth || {};
    this.products = options.products || [];
    this.apiMode = options.apiMode || APIMode.PRODUCTION;
    this.tradingMode = options.tradingMode || TradingMode.LIVE;

    if (!APIMode[this.apiMode]) {
      throw new Error('Invalid API Mode');
    }

    if (!TradingMode[this.tradingMode]) {
      throw new Error('Invalid Trading Mode');
    }
  }

  _connect() {
    return Promise.resolve();
  }

  _loadOrderBook() {
    return false;
  }

  async connect() {
    this.connectionStatus = ConnectionStatus.CONNECTING;
    try {
      if (await this._connect()) {
        Promise.resolve(true);
      }
    } catch (err) {
      this.connectionStatus = ConnectionStatus.ERROR;
      logErrorIf(`test: ${err}`);
      throw err;
    }
  }

  getOrderBook() {
    return this._orderBook;
  }
}

export default Exchange;
