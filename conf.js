import credentials from './credentials';

const conf = {
  gdax: {
    name: 'Gdax',
    products: [
      'BTC-USD',
      // 'LTC-USD',
    ],
    // auth: credentials.gdax.production,
    // apiMode: 'PRODUCTION',
    auth: credentials.gdax.sandbox,
    apiMode: 'SANDBOX',
    tradingMode: 'PAPER',
  },
};

export default conf;
