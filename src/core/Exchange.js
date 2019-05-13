/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

import { APIType, APIMode, TradingMode, ConnectionStatus } from './ExchangeConfig';
import { logInfo, logError } from './logger';
import StrategyManager from './StrategyManager';

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

    this.name = options.name || '';
    this.auth = options.auth || {};
    this.products = options.products || [];
    this.apiMode = options.apiMode || APIMode.PRODUCTION;
    this.tradingMode = options.tradingMode || TradingMode.LIVE;
    this.strategies = new StrategyManager(this);

    if (!APIMode[this.apiMode]) {
      const error = new Error('Invalid API Mode');
      logError('Exchange constructor error.', error);
      throw error;
    }

    if (!TradingMode[this.tradingMode]) {
      const error = new Error('Invalid Trading Mode');
      logError('Exchange constructor error.', error);
      throw error;
    }
  }

  // eslint-disable-next-line no-unused-vars
  _buy(params = {}) {
    return Promise.resolve(false);
  }

  _cancelAllOrders() {
    return Promise.resolve(false);
  }

  // eslint-disable-next-line no-unused-vars
  _cancelOrder(params = {}) {
    return Promise.resolve(false);
  }

  _connect() {
    throw new Error('Not implemented.');
  }

  _loadOrderBook() {
    throw new Error('Not implemented.');
  }

  // eslint-disable-next-line no-unused-vars
  _sell(params = {}) {
    return Promise.reject(new Error('Not implemented.'));
  }

  // eslint-disable-next-line no-unused-vars
  _sellAccountPositions(params) {
    Promise.resolve(false);
  }

  // eslint-disable-next-line no-unused-vars
  _sellProductPositions(params = {}) {
    Promise.resolve(false);
  }

  // eslint-disable-next-line no-unused-vars
  _sendOrder(params = {}) {
    Promise.resolve(false);
  }

  buy(params = {}) {
    try {
      return this.buy(params);
    } catch (error) {
      logError(`Error buying. Params: ${JSON.stringify(params)}.`, error);
      throw error;
    }
  }

  cancelOrder(params = {}) {
    try {
      return this._cancelOrder(params);
    } catch (error) {
      logError(`Error canceling order. Params: ${JSON.stringify(params)}.`, error);
      throw error;
    }
  }

  cancelAllOrders() {
    try {
      return this._cancelAllOrders();
    } catch (error) {
      logError('Error canceling all orders:', error);
      throw error;
    }
  }

  connect() {
    this.connectionStatus = ConnectionStatus.CONNECTING;
    try {
      return this._connect();
    } catch (error) {
      this.connectionStatus = ConnectionStatus.ERROR;
      logError('Error connecting to exchange:', error);
      throw error;
    }
  }

  getOrderBook() {
    return this._orderBook;
  }

  sell(params = {}) {
    try {
      logInfo(`Selling @ ${this.name} (${this.tradingMode}). Sell order:`, params);
      const result = this._sell(params);
      if (result) {
        logInfo(`Sold successfully @ ${this.name} (${this.tradingMode}). Sell order:`, params);
      } else {
        logInfo(`Error selling @ ${this.name} (${this.tradingMode}). Sell order:`, params);
      }
    } catch (error) {
      logError(`Error selling (${this.tradingMode}). Params: ${JSON.stringify(params)}.`, error);
      throw error;
    }
  }

  sellAccountPositions(params = {}) {
    try {
      return this._sellAccountPositions(params);
    } catch (error) {
      logError(`Error selling account position. Params: ${JSON.stringify(params)}.`, error);
      throw error;
    }
  }

  sellProductPositions(params) {
    try {
      return this._sellProductPositions(params);
    } catch (error) {
      logError(`Error selling product positions. Params: ${JSON.stringify(params)}.`, error);
      throw error;
    }
  }
}

export default Exchange;
