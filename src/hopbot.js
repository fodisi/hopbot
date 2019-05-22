/* eslint-disable no-console */
import readline from 'readline';
import GdaxExchange from './plugins/exchanges/GdaxExchange';
import conf from '../conf';
import { LogLevel, setLogger } from './core/logger';
// import { logError, logWarn, logInfo, logVerbose, logDebug, logTrace } from './core/logger';
import StopLossTakeProfit from './plugins/strategies/StopLossTakeProfit';

// const readline = require('readline');

function parseParams(line) {
  const inputs = line.substring(2).split(' ');
  console.log(inputs);
  const params = {};
  inputs.forEach((item) => {
    const keyValue = item.split('=');
    switch (keyValue[0].toUpperCase()) {
      case 'P':
        params.price = Number(keyValue[1]);
        break;
      case 'F':
        params.funds = Number(keyValue[1]);
        break;
      case 'T':
        // eslint-disable-next-line prefer-destructuring
        params.orderType = keyValue[1].toUpperCase();
        break;
      case 'S':
        params.size = Number(keyValue[1]);
        break;
      case 'I':
        // eslint-disable-next-line prefer-destructuring
        params.instrumentId = keyValue[1];
        break;
      default:
        break;
    }
  });
  console.log(params);
  return params;
}

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
        exchange.sell(parseParams(line));
        break;
      case 'B': {
        console.log(line);
        exchange.buy(parseParams(line));
        break;
      }
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
      stopLossAt: 0.24,
      lossOrderType: 'MARKET', // StrategyConfig.OrderType
      lossSize: 0.002, // Amount in Base Currency (Ex: BTC/USD, size in BTC)
      lossFunds: 0, // FUTURE USE - Amount of Funds in Quote Currency (Ex: BTC/USD, funds in USD)
      lossPercent: 0,
      lossPrice: 0.16, // Used for LIMIT orders
      takeProfitAt: 0.4,
      profitOrderType: 'LIMIT', // StrategyConfig.OrderType
      profitSize: 0.002, // Amount in Base Currency (Ex: BTC/USD, size in BTC)
      profitFunds: 0, // FUTURE USE - Amount of Funds in Quote Currency (Ex: BTC/USD, funds in USD)
      profitPercent: 0,
      profitPrice: 0.6, // Used for LIMIT orders
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
    await gdax.connect();
    console.log(gdax.connectionStatus);
    handleStdinInput(gdax);
    loadStrategies(gdax);
  } catch (err) {
    console.log(err);
  }
}

start();
