/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

import { APIType, APIMode, TradingMode, ConnectionStatus } from './ExchangeConfig';
import { logErrorIf } from './logger';
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
    this.strategies = new StrategyManager();

    if (!APIMode[this.apiMode]) {
      throw new Error('Invalid API Mode');
    }

    if (!TradingMode[this.tradingMode]) {
      throw new Error('Invalid Trading Mode');
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
    } catch (err) {
      logErrorIf('Error buying:');
      logErrorIf(err);
      throw err;
    }
  }

  cancelOrder(params = {}) {
    try {
      return this._cancelOrder(params);
    } catch (err) {
      logErrorIf('Error canceling order:');
      logErrorIf(err);
      throw err;
    }
  }

  cancelAllOrders() {
    try {
      return this._cancelAllOrders();
    } catch (err) {
      logErrorIf('Error canceling all orders:');
      logErrorIf(err);
      throw err;
    }
  }

  connect() {
    this.connectionStatus = ConnectionStatus.CONNECTING;
    try {
      return this._connect();
    } catch (error) {
      this.connectionStatus = ConnectionStatus.ERROR;
      logErrorIf('Error connecting to exchange:');
      logErrorIf(error);
      throw error;
    }
  }

  getOrderBook() {
    return this._orderBook;
  }

  sell(params = {}) {
    try {
      return this._sell(params);
    } catch (err) {
      logErrorIf('Error selling:');
      logErrorIf(err);
      throw err;
    }
  }

  sellAccountPositions(params = {}) {
    try {
      return this._sellAccountPositions(params);
    } catch (err) {
      logErrorIf('Error selling account position:');
      logErrorIf(err);
      throw err;
    }
  }

  sellProductPositions(params) {
    try {
      return this._sellProductPositions(params);
    } catch (err) {
      logErrorIf('Error selling product positions:');
      logErrorIf(err);
      throw err;
    }
  }
}

export default Exchange;
