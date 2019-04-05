/* eslint-disable no-console */
// console.log('hopbot running');
// import GdaxExchange from ;
import GdaxExchange from './plugins/exchanges/GdaxExchange';

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
  const gdax = new GdaxExchange();
  const r = gdax.connect();
  console.log(r);
  console.log(gdax.connectionStatus);
  console.log(gdax.getOrderBook().books['BTC-USD'].state());
  handleStdinInput(gdax);
}

start();
