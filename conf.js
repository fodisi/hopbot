import credentials from './credentials';

const conf = {
  gdax: {
    name: 'Gdax',
    instruments: [
      'BTC-USD',
      // 'LTC-USD',
      // 'ETH-USD',
    ],
    // auth: credentials.gdax.production,
    // apiMode: 'PRODUCTION',
    auth: credentials.gdax.sandbox,
    apiMode: 'SANDBOX',
    // tradingMode: 'PAPER',
    tradingMode: 'LIVE',
  },
};

export default conf;
