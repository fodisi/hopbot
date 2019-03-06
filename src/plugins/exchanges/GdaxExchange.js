/* eslint-disable no-underscore-dangle */
// import Exchange from '../../core/Exchange';
// import { APIType, APIMode } from '../../core/ExchangeConfig';

import Exchange from '../../core/Exchange';
import { APIType, APIMode } from '../../core/ExchangeConfig';

const gdax = require('gdax');

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
    };
  }

  async _connect() {
    try {
      this.authClient = new gdax.AuthenticatedClient(
        this.auth.key,
        this.auth.secret,
        this.auth.passphrase,
        this.apiUri
      );
      console.log(this.authClient);
      return Promise.resolve(true);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async _loadOrderBook() {
    if (!this._orderBook) {
      try {
        this._orderBook = new gdax.OrderbookSync('LTC/USD', this.apiUri, this.wsUri, this.authClient);
        return Promise.resolve(true);
      } catch (error) {
        return Promise.resolve(error);
      }
      // this.listen_to_messages();
    }
    return Promise.resolve(true);
  }

  async getOrderBook() {
    if (!this._orderBook) {
      try {
        await this._loadOrderBook();
      } catch (error) {
        console.log(error);
      }
    }
    return this._orderBook.book;
  }
}

export default GdaxExchange;
