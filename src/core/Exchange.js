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
    // {
    //   BTC : {
    //     id: '',
    //     balance: 0.0,
    //     hold: 0.0,
    //     available: 0.0,
    //   },
    // }
    this._balances = {};

    this.name = options.name || '';
    this.auth = options.auth || {};
    this.instruments = options.instruments || [];
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

  // eslint-disable-next-line no-unused-vars
  _updateAccountBalances(params = {}) {
    return Promise.resolve(false);
  }

  // eslint-disable-next-line no-unused-vars
  _updateProductBalance(params = {}) {
    return Promise.resolve(false);
  }

  async buy(params = {}) {
    try {
      return await this._buy(params);
    } catch (error) {
      logError(`Error buying. Params: ${JSON.stringify(params)}.`, error);
      throw error;
    }
  }

  async cancelOrder(params = {}) {
    try {
      return await this._cancelOrder(params);
    } catch (error) {
      logError(`Error canceling order. Params: ${JSON.stringify(params)}.`, error);
      throw error;
    }
  }

  async cancelAllOrders() {
    try {
      return await this._cancelAllOrders();
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

  async sell(params = {}) {
    try {
      logInfo(`Selling @ ${this.name} (${this.tradingMode}). Sell order:`, params);
      const result = await this._sell(params);
      if (result) {
        logInfo(`Sell order placed on ${this.name} (${this.tradingMode}). Sell order:`, params);
      } else {
        logInfo(
          `Error selling @ ${this.name} (${this.tradingMode}). Sell order: ${JSON.stringify(params)}. API Result:`,
          result
        );
      }
    } catch (error) {
      logError(`Error selling (${this.tradingMode}). Params: ${JSON.stringify(params)}.`, error);
      throw error;
    }
  }

  async sellAccountPositions(params = {}) {
    try {
      return await this._sellAccountPositions(params);
    } catch (error) {
      logError(`Error selling account position. Params: ${JSON.stringify(params)}.`, error);
      throw error;
    }
  }

  async sellProductPositions(params) {
    try {
      return await this._sellProductPositions(params);
    } catch (error) {
      logError(`Error selling product positions. Params: ${JSON.stringify(params)}.`, error);
      throw error;
    }
  }

  async updateAccountBalances(params = {}) {
    try {
      return await this._updateAccountBalances(params);
    } catch (error) {
      logError(`Error retrieving Account Balances on ${this.name}. Params: ${JSON.stringify(params)}`, error);
      throw error;
    }
  }

  async updateProductBalance(params = {}) {
    try {
      const result = await this._updateProductBalance(params);
      return result;
    } catch (error) {
      logError(`Error retrieving Product Balance on ${this.name}. Params: ${JSON.stringify(params)}`, error);
      return Promise.reject(error);
      // throw error;
    }
  }
}

export default Exchange;
