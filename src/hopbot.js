/* eslint-disable no-console */
// console.log('hopbot running');
// import GdaxExchange from ;
import GdaxExchange from './plugins/exchanges/GdaxExchange';

async function start() {
  const gdax = new GdaxExchange();
  const r = await gdax.connect();
  console.log(r);
  console.log(gdax.connectionStatus);
  console.log(gdax.getOrderBook().books['BTC-USD'].state());
}

start();
