/* eslint-disable no-underscore-dangle */

import { AuthenticatedClient, OrderbookSync } from 'gdax';
import Exchange from '../../core/Exchange';
import { APIType, APIMode, ConnectionStatus } from '../../core/ExchangeConfig';
import { logError, logInfo } from '../../core/logger';
import { debugMode } from '../../core/engine';

class GdaxExchange extends Exchange {
  constructor(options = {}) {
    super(options);
    this.apiType = APIType.WEB_SOCKET;
    this.apiKey = options.apiKey || '';
    this.apiSecret = options.apiSecret || '';
    this.apiPassphrase = options.apiPassphrase || '';
    if (this.apiMode === APIMode.PRODUCTION) {
      this.apiUri = 'https://api.pro.coinbase.com';
      this.wsUri = 'wss://ws-feed.pro.coinbase.com';
    } else {
      this.apiUri = 'https://api-public.sandbox.pro.coinbase.com';
      this.wsUri = 'wss://ws-feed-public.sandbox.pro.coinbase.com';
    }
    this.auth = {
      key: 'f98dca827e601f80fd7faed43432caf0',
      secret: 'oR1Wa9TDcSHvv2tDeGbAorie+L9tkokRL8Pfu7iVzvhnXMQLeXk+mhg5hbery0DxeqmMzgNdzzv/wG2Z0jEtAw==',
      passphrase: 'JQON4qVvE}x0Q6uQvNM^Ez60ONXNjRFk',
      // passphrase: 'JQON4qVvE}x0Q6uQvNM^Ez60ONXNjRF2',
    };
  }

  _connect() {
    this.authClient = new AuthenticatedClient(this.auth.key, this.auth.secret, this.auth.passphrase, this.apiUri);
    debugMode && logInfo(this.authClient);
    this.connectionStatus = this._loadOrderBook() ? ConnectionStatus.CONNECTED : ConnectionStatus.ERROR;
    return true;
  }

  _loadOrderBook() {
    if (!this._orderBook) {
      try {
        debugMode && logInfo('Loading order book.');
        debugMode && logInfo(`API URI: ${this.apiUri}`);
        debugMode && logInfo(`WS URI: ${this.wsUri}`);
        this._orderBook = new OrderbookSync(['BTC-USD'], this.apiUri, this.wsUri, this.auth);
        this.handleOrderBookMessages();
      } catch (error) {
        debugMode && logError(error);
        return false;
      }
    }
    return true;
  }

  async _sell(params) {
    try {
      const result = await this.authClient.sell(params);
      // Implement logic when placing sell orders (Add to list of open orders?).
      return result;
    } catch (error) {
      throw error;
    }
  }

  handleOrderBookMessages() {
    if (!this._orderBook) {
      return;
    }
    this._orderBook.on('sync', (data) => {
      debugMode && logInfo('Order book message "sync":');
      debugMode && logInfo(data);
    });
    this._orderBook.on('synced', (data) => {
      debugMode && logInfo('Order book message "synced":');
      debugMode && logInfo(data);
    });
    this._orderBook.on('message', (data) => {
      // this._stats = {
      //   updated: new Date(),
      //   last_msg: data,
      // };
      debugMode && logInfo(`Order book message "message": ${data.type}`);
      debugMode && logInfo(data);
      switch (data.type) {
        case 'match':
          this._last_price = data.price;
          break;
        default:
          debugMode && logInfo(data);
          break;
      }
    });
    this._orderBook.on('error', (err) => {
      // this._stats = {
      //   updated: new Date(),
      //   last_msg: err,
      // };
      debugMode && debugMode && logError('Order book message "error":');
      debugMode && logError(err);
    });
  }

  getOrderBook() {
    if (!this._orderBook) {
      try {
        this._loadOrderBook();
      } catch (error) {
        debugMode && logError(error);
      }
    }
    return this._orderBook;
  }
}

export default GdaxExchange;
