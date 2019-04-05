/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

import { APIType, APIMode, TradingMode, ConnectionStatus } from './ExchangeConfig';
import { logError } from './logger';
import { debugMode } from './engine';

class Exchange {
  constructor(options = {}) {
    this.isTrading = false;
    this.isExecuting = false;
    this.apiUri = '';
    this.wsUri = '';
    this.auth = options.auth || {};
    this.connectionStatus = ConnectionStatus.CLOSED;
    this.apiType = APIType.REST;
    this.apiMode = options.apiMode || APIMode.PRODUCTION;
    this.tradingMode = options.tradingMode || TradingMode.LIVE;
    this.authClient = undefined;
    this.publicClient = undefined;
    this._orderBook = undefined;

    if (!APIMode[this.apiMode]) {
      throw new Error('Invalid API Mode');
    }

    if (!TradingMode[this.tradingMode]) {
      throw new Error('Invalid Trading Mode');
    }
  }

  _connect() {
    throw new Error('Not implemented.');
  }

  _loadOrderBook() {
    throw new Error('Not implemented.');
  }

  // eslint-disable-next-line no-unused-vars
  _sell(params) {
    return Promise.reject(new Error('Not implemented.'));
  }

  connect() {
    this.connectionStatus = ConnectionStatus.CONNECTING;
    try {
      return this._connect();
    } catch (error) {
      this.connectionStatus = ConnectionStatus.ERROR;
      debugMode && logError(error);
      throw error;
    }
  }

  getOrderBook() {
    return this._orderBook;
  }

  async sell(params) {
    try {
      // logError('SELL');
      return await this._sell(params);
    } catch (error) {
      debugMode && logError(error);
      throw error;
    }
  }
}

export default Exchange;
