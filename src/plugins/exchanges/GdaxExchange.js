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

  _connect() {
    try {
      this.authClient = new AuthenticatedClient(this.auth.key, this.auth.secret, this.auth.passphrase, this.apiUri);
      logInfoIf(this.authClient, LogLevel.REGULAR);
      this.connectionStatus = this._loadOrderBook() ? ConnectionStatus.CONNECTED : ConnectionStatus.ERROR;
      return Promise.resolve(true);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  _loadOrderBook() {
    if (!this._orderBook) {
      try {
        logInfoIf('Loading order book.', LogLevel.DEEP);
        logInfoIf(`API URI: ${this.apiUri}`, LogLevel.DEEP);
        logInfoIf(`WS URI: ${this.wsUri}`, LogLevel.DEEP);
        this._orderBook = new OrderbookSync(this.products, this.apiUri, this.wsUri, this.auth);
        this.handleOrderBookMessages();
      } catch (err) {
        logErrorIf(err);
        return false;
      }
    }
    return true;
  }

  handleOrderBookMessages() {
    if (!this._orderBook) {
      return;
    }
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
    this._orderBook.on('error', (err) => {
      // this._stats = {
      //   updated: new Date(),
      //   last_msg: err,
      // };
      logErrorIf('OrderBook Error:');
      logErrorIf(err);
    });
  }

  getOrderBook() {
    if (!this._orderBook) {
      try {
        this._loadOrderBook();
      } catch (err) {
        logErrorIf(err);
      }
    }
    return this._orderBook;
  }
}

export default GdaxExchange;
