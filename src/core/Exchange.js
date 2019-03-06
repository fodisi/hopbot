/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

import { APIType, APIMode, TradingMode, ConnectionStatus } from './ExchangeConfig';

export default class Exchange {
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

  async _connect() {
    return Promise.resolve();
  }

  async _loadOrderBook() {
    return Promise.resolve();
  }

  async connect() {
    this.connectionStatus = ConnectionStatus.CONNECTING;
    try {
      await this._connect();
      await this._loadOrderBook();
    } catch (err) {
      this.connectionStatus = ConnectionStatus.CLOSED;
      throw err;
    }
  }

  async getOrderBook() {
    return this._orderBook;
  }
}

// export default { Exchange };
