/* eslint-disable no-unused-vars */
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
    this.balanceUpdateInterval = options.balanceUpdateInterval || 10000;

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

  async _buy(params = {}) {
    throw new Error('Not implemented.');
  }

  async _cancelAllOrders() {
    throw new Error('Not implemented.');
  }

  async _cancelOrder(params = {}) {
    throw new Error('Not implemented.');
  }

  async _connect() {
    throw new Error('Not implemented.');
  }

  async _loadOrderBook() {
    throw new Error('Not implemented.');
  }

  _parseOrderParams(params) {
    throw new Error('Not implemented.');
  }

  async _sell(params = {}) {
    throw new Error('Not implemented.');
  }

  async _sellAccountPositions(params) {
    throw new Error('Not implemented.');
  }

  async _sellProductPositions(params = {}) {
    throw new Error('Not implemented.');
  }

  async _sendOrder(params = {}) {
    throw new Error('Not implemented.');
  }

  _updateAccountBalances(params = {}) {
    throw new Error('Not implemented.');
  }

  _updateProductBalance(params = {}) {
    throw new Error('Not implemented.');
  }

  async buy(params = {}) {
    try {
      return this._buy(params);
    } catch (error) {
      logError(`Error buying. Params: ${JSON.stringify(params)}.`, error);
      throw error;
    }
  }

  async cancelOrder(params = {}) {
    try {
      return this._cancelOrder(params);
    } catch (error) {
      logError(`Error canceling order. Params: ${JSON.stringify(params)}.`, error);
      throw error;
    }
  }

  async cancelAllOrders() {
    try {
      return this._cancelAllOrders();
    } catch (error) {
      logError('Error canceling all orders:', error);
      throw error;
    }
  }

  async connect() {
    this.connectionStatus = ConnectionStatus.CONNECTING;
    try {
      return this._connect();
    } catch (error) {
      this.connectionStatus = ConnectionStatus.ERROR;
      logError('Error connecting to exchange:', error);
      throw error;
    }
  }

  async getOrderBook() {
    if (!this._orderBook) {
      await this._loadOrderBook();
    }
    return Promise.resolve(this._orderBook);
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
      return this._updateProductBalance(params);
    } catch (error) {
      logError(`Error retrieving Product Balance on ${this.name}. Params: ${JSON.stringify(params)}`, error);
      return Promise.reject(error);
      // throw error;
    }
  }
}

export default Exchange;
