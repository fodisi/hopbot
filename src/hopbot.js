/* eslint-disable no-console */
import readline from 'readline';
import GdaxExchange from './plugins/exchanges/GdaxExchange';
import conf from '../conf';
import { LogLevel, setLogger } from './core/logger';
// import { logError, logWarn, logInfo, logVerbose, logDebug, logTrace } from './core/logger';
import StopLossTakeProfit from './plugins/strategies/StopLossTakeProfit';

// const readline = require('readline');

function handleStdinInput(exchange) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });
  process.stdin.setRawMode(false);

  rl.on('line', (line) => {
    switch (line[0].toUpperCase()) {
      case 'S':
        console.log(line);
        exchange.sell({
          instrumentId: 'BTC-USD',
          orderType: 'LIMIT',
          size: 0.001,
          funds: 0,
          price: 29533.78,
        });
        break;
      case 'L':
        exchange.updateAccountBalances();
        break;
      case 'P': {
        const id = line.substring(2, line.length);
        console.log(id);
        try {
          exchange.updateProductBalance({ id });
        } catch (error) {
          console.log(error);
        }

        break;
      }
      default:
        break;
    }
  });
}

function loadStrategies(exchange) {
  const params = {
    'BTC-USD': {
      stopLossAt: 221.1,
      lossOrderType: 'MARKET', // StrategyConfig.OrderType
      lossSize: 0, // Amount in Base Currency (Ex: BTC/USD, size in BTC)
      lossFunds: 0, // FUTURE USE - Amount of Funds in Quote Currency (Ex: BTC/USD, funds in USD)
      lossPercent: 10,
      lossPrice: 0, // Used for LIMIT orders
      takeProfitAt: 223.5,
      profitOrderType: 'MARKET', // StrategyConfig.OrderType
      profitSize: 0, // Amount in Base Currency (Ex: BTC/USD, size in BTC)
      profitFunds: 0, // FUTURE USE - Amount of Funds in Quote Currency (Ex: BTC/USD, funds in USD)
      profitPercent: 50,
      profitPrice: 0, // Used for LIMIT orders
    },
  };
  const strategy = new StopLossTakeProfit('StopLossTakeProfit', params);
  exchange.strategies.registerStrategy(strategy);
  strategy.enable();
}

async function start() {
  try {
    setLogger(LogLevel.DEBUG);
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
