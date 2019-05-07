/* eslint-disable no-console */
// console.log('hopbot running');
// import GdaxExchange from ;
import GdaxExchange from './plugins/exchanges/GdaxExchange';
import conf from '../conf';
import { LogLevel, setLogLevel } from './core/logger';
import StopLossTakeProfit from './plugins/strategies/StopLossTakeProfit';

const readline = require('readline');

function handleStdinInput(exchange) {
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);

  process.stdin.on('keypress', (key, data) => {
    if (data.ctrl && data.name === 'c') {
      process.exit();
    } else {
      switch (key.toUpperCase()) {
        case 'S':
          exchange.sell({});
          break;
        default:
          break;
      }
    }
  });
}

function loadStrategies(exchange) {
  const params = {
    'LTC-USD': {
      stopLossAt: 76.69,
      lossOrderType: 'MARKET', // StrategyConfig.OrderType
      lossSize: 1, // Amount in Base Currency (Ex: BTC/USD, size in BTC)
      lossFunds: 0, // FUTURE USE - Amount of Funds in Quote Currency (Ex: BTC/USD, funds in USD)
      lossPrice: 0, // Used for LIMIT orders
      takeProfitAt: 77.35,
      profitOrderType: 'MARKET', // StrategyConfig.OrderType
      profitSize: 1, // Amount in Base Currency (Ex: BTC/USD, size in BTC)
      profitFunds: 0, // FUTURE USE - Amount of Funds in Quote Currency (Ex: BTC/USD, funds in USD)
      profitPrice: 0, // Used for LIMIT orders
    },
  };
  const strategy = new StopLossTakeProfit('StopLossTakeProfit', params);
  exchange.strategies.registerStrategy(strategy);
  strategy.enable();
}

async function start() {
  try {
    setLogLevel(LogLevel.DETAILED);
    const gdax = new GdaxExchange(conf.gdax);
    gdax.connect();
    console.log(gdax.connectionStatus);
    handleStdinInput(gdax);
    loadStrategies(gdax);
  } catch (err) {
    console.log(err);
  }
}

start();
