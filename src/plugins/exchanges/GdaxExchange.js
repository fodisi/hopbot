/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

import { AuthenticatedClient, OrderbookSync } from 'gdax';
import Exchange from '../../core/Exchange';
import { APIType, APIMode, ConnectionStatus, TradingMode } from '../../core/ExchangeConfig';
import { logTrace, logError, logDebug, logInfo } from '../../core/logger';
import { OrderType } from '../../core/StrategyConfig';

class GdaxExchange extends Exchange {
  constructor(options = {}) {
    super(options);
    this.apiType = APIType.WEB_SOCKET;
    if (this.apiMode === APIMode.PRODUCTION) {
      this.apiUri = 'https://api.pro.coinbase.com';
      this.wsUri = 'wss://ws-feed.pro.coinbase.com';
    } else {
      this.apiUri = 'https://api-public.sandbox.pro.coinbase.com';
      this.wsUri = 'wss://ws-feed-public.sandbox.pro.coinbase.com';
    }
  }

  // eslint-disable-next-line no-unused-vars
  async _buy(params = {}) {
    try {
      let result;
      if (this.tradingMode === TradingMode.LIVE) {
        const orderParams = this._parseOrderParams(params);
        result = await this.authClient.buy(orderParams);
        logDebug('GDAX API - buy response:', result);
        // Update balances after buy order.
        // TODO: Balance update should happen when orders are matched, not placed.
        this._updateAccountBalances();
      } else {
        // TODO: Handle PAPER and SIMULATION scenarios.
        result = Promise.resolve(true);
      }
      // TODO: Implement logic when placing buy orders (Add to list of open orders?).
      // TODO: Better return for promises.
      return result;
    } catch (error) {
      logError('', error);
      return Promise.reject(error);
    }
  }

  _cancelAllOrders() {
    return Promise.resolve(false);
  }

  // eslint-disable-next-line no-unused-vars
  _cancelOrder(params = {}) {
    return Promise.resolve(false);
  }

  async _connect() {
    this.authClient = new AuthenticatedClient(this.auth.key, this.auth.secret, this.auth.passphrase, this.apiUri);
    if (!this._loadOrderBook()) {
      this.connectionStatus = ConnectionStatus.ERROR;
      return false;
    }

    const result = await this._updateAccountBalances();
    if (!result) {
      this.connectionStatus = ConnectionStatus.ERROR;
      return false;
    }

    return true;
  }

  _listenOrderBookMessages() {
    if (!this._orderBook) {
      return;
    }

    this._orderBook.on('open', (data) => {
      this.connectionStatus = ConnectionStatus.CONNECTED;
      logTrace('Order book message "open":', data);
    });

    this._orderBook.on('sync', (data) => {
      logTrace('Order book message "sync":', data);
    });

    this._orderBook.on('synced', (data) => {
      logTrace('Order book message "synced":', data);
    });

    this._orderBook.on('message', (data) => {
      // this._stats = {
      //   updated: new Date(),
      //   last_msg: data,
      // };
      switch (data.type) {
        case 'match':
          this._last_price = data.price;
          this.strategies.updateMarketData({
            instrumentId: data.product_id,
            eventType: data.type,
            size: data.size,
            price: data.price,
            side: data.side,
          });
          logTrace('Order book message "message":', data);
          logDebug(`Match:\t${data.side}\t${data.size}\t${data.price}\t${new Date(data.time).toLocaleTimeString()}.`);
          break;
        default:
          logTrace(data.type);
          break;
      }
    });
    this._orderBook.on('error', (error) => {
      logError('OrderBook Error:', error);
    });
  }

  _loadOrderBook() {
    if (!this._orderBook) {
      try {
        logTrace(`Loading order book. API URI: ${this.apiUri}. WS URI: ${this.wsUri}`);
        this._orderBook = new OrderbookSync(this.instruments, this.apiUri, this.wsUri, this.auth);
        this._listenOrderBookMessages();
      } catch (error) {
        logError('Error loading orderbook.', error);
        return false;
      }
    }
    return true;
  }

  /**
   * @description Map default Order param structure to GDAX's order params payload.
   * @param {Dictionary} params Order params.
   */
  _parseOrderParams(params) {
    const orderParams = {
      type: params.orderType === OrderType.MARKET ? 'market' : 'limit',
      side: params.side,
      product_id: params.instrumentId,
    };

    // Defaults to size; then, checks for funds.
    if (params.size && params.size > 0) {
      orderParams.size = params.size.toString();
    } else if (params.funds && params.funds > 0) {
      orderParams.funds = params.funds.toString();
    }

    if (params.orderType !== OrderType.MARKET && params.price && params.price > 0) {
      orderParams.price = params.price.toString();
    }

    logDebug('Order params parsed:', orderParams);
    return orderParams;
  }

  // TODO: Properly create Promise.
  // eslint-disable-next-line no-unused-vars
  async _sell(params) {
    try {
      let result;
      if (this.tradingMode === TradingMode.LIVE) {
        const orderParams = this._parseOrderParams(params);
        result = await this.authClient.sell(orderParams);
        logInfo(`Sell order placed on ${this.name}. API response:`, result);
        // Update balances after sell order.
        // TODO: Balance update should happen when orders are matched, not placed.
        this._updateAccountBalances();
      } else {
        // TODO: Handle PAPER and SIMULATION scenarios.
        result = Promise.resolve(true);
      }
      // TODO: Implement logic when placing sell orders (Add to list of open orders?).
      // TODO: Better return for promises.
      return result;
    } catch (error) {
      logError('', error);
      return Promise.reject(error);
    }
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
  async _updateAccountBalances(params = {}) {
    try {
      const balances = {};
      const accounts = await this.authClient.getAccounts();
      logTrace('GDAX API - getAccounts response:', accounts);
      Object.values(accounts).forEach((item) => {
        balances[item.currency] = item;
      });
      this._balances = balances;
      logDebug(`Account balances on ${this.name}:`, this._balances);
      Promise.resolve(true);
    } catch (error) {
      logError(`Error updating account balance on ${this.name}. Params: ${JSON.stringify(params)}`, error);
      Promise.reject(error);
    }
  }

  async _updateProductBalance(params = {}) {
    try {
      const balance = await this.authClient.getAccount(params.id);
      logTrace('GDAX API - getAccount response:', balance);
      this._balances[balance.currency] = balance;
      logDebug(`Product "${balance.currency}" balance on ${this.name}:`, balance);
      Promise.resolve(true);
    } catch (error) {
      logError(`Error updating product balance on ${this.name}. Params: ${JSON.stringify(params)}`, error);
      Promise.reject(error);
    }
  }

  getOrderBook() {
    if (!this._orderBook) {
      try {
        this._loadOrderBook();
      } catch (error) {
        logError('', error);
        // TODO: Should throw error? If not, add documentation.
      }
    }
    return this._orderBook;
  }
}

export default GdaxExchange;
