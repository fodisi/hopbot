import credentials from './credentials';

const conf = {
  gdax: {
    name: 'Gdax',
    instruments: [
      // 'BTC-USD',
      'LTC-USD',
      // 'ETH-USD',
    ],
    auth: credentials.gdax.production,
    apiMode: 'PRODUCTION',
    // auth: credentials.gdax.sandbox,
    // apiMode: 'SANDBOX',
    tradingMode: 'PAPER',
    // tradingMode: 'LIVE',
    balanceUpdateInterval: 10000, // interval to update account balances (in ms - 10000 = 10 seconds)
  },
};

export default conf;
