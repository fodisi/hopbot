/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

import { AuthenticatedClient, OrderbookSync } from 'gdax';
import Exchange from '../../core/Exchange';
import { APIType, APIMode, ConnectionStatus } from '../../core/ExchangeConfig';
import { LogLevel, logInfoIf, logErrorIf } from '../../core/logger';

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
    this.authClient = new AuthenticatedClient(this.auth.key, this.auth.secret, this.auth.passphrase, this.apiUri);
    logInfoIf(this.authClient, LogLevel.REGULAR);
    this.connectionStatus = this._loadOrderBook() ? ConnectionStatus.CONNECTED : ConnectionStatus.ERROR;
    return true;
  }

  _loadOrderBook() {
    if (!this._orderBook) {
      try {
        logInfoIf('Loading order book.', LogLevel.DEEP);
        logInfoIf(`API URI: ${this.apiUri}`, LogLevel.DEEP);
        logInfoIf(`WS URI: ${this.wsUri}`, LogLevel.DEEP);
        this._orderBook = new OrderbookSync(this.products, this.apiUri, this.wsUri, this.auth);
        this.listenOrderBookMessages();
      } catch (err) {
        logErrorIf(err);
        return false;
      }
    }
    return true;
  }

  // eslint-disable-next-line no-unused-vars
  async _sell(params) {
    try {
      const result = await this.authClient.sell(params);
      // Implement logic when placing sell orders (Add to list of open orders?).
      return result;
    } catch (error) {
      throw error;
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

  listenOrderBookMessages() {
    if (!this._orderBook) {
      return;
    }

    this._orderBook.on('open', (data) => {
      logInfoIf('Order book message "open":', LogLevel.DEEP);
      logInfoIf(data, LogLevel.DEEP);
    });

    this._orderBook.on('sync', (data) => {
      logInfoIf('Order book message "sync":', LogLevel.DEEP);
      logInfoIf(data, LogLevel.DEEP);
    });

    this._orderBook.on('synced', (data) => {
      logInfoIf('Order book message "synced":', LogLevel.DEEP);
      logInfoIf(data, LogLevel.DEEP);
    });

    this._orderBook.on('message', (data) => {
      // this._stats = {
      //   updated: new Date(),
      //   last_msg: data,
      // };
      switch (data.type) {
        case 'match':
          this._last_price = data.price;
          logInfoIf(`${data.side}  ${data.size}  ${data.price} ${new Date(data.time).toLocaleTimeString()}`);
          logInfoIf('Order book message "message":', LogLevel.DEEP);
          logInfoIf(data, LogLevel.DEEP);
          break;
        default:
          logInfoIf(data.type, LogLevel.DEEP);
          break;
      }
    });
    this._orderBook.on('error', (error) => {
      // this._stats = {
      //   updated: new Date(),
      //   last_msg: err,
      // };
      logErrorIf('OrderBook Error:');
      logErrorIf(error);
    });
  }

  getOrderBook() {
    if (!this._orderBook) {
      try {
        this._loadOrderBook();
      } catch (error) {
        logErrorIf(error);
      }
    }
    return this._orderBook;
  }
}

export default GdaxExchange;
