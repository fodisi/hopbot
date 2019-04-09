/* eslint-disable no-console */
// console.log('hopbot running');
// import GdaxExchange from ;
import GdaxExchange from './plugins/exchanges/GdaxExchange';
import conf from '../conf';
import { LogLevel, setLogLevel } from './core/logger';

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

async function start() {
  try {
    setLogLevel(LogLevel.REGULAR);
    const gdax = new GdaxExchange(conf.gdax);
    gdax.connect();
    console.log(gdax.connectionStatus);
    handleStdinInput(gdax);
  } catch (err) {
    console.log(err);
  }
}

start();
