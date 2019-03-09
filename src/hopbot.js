/* eslint-disable no-console */
// console.log('hopbot running');
// import GdaxExchange from ;
import GdaxExchange from './plugins/exchanges/GdaxExchange';
import conf from '../conf';
import { LogLevel, setLogLevel } from './core/logger';

async function start() {
  try {
    setLogLevel(LogLevel.DEEP);
    const gdax = new GdaxExchange(conf.gdax);
    await gdax.connect();
    console.log(gdax.connectionStatus);
  } catch (err) {
    console.log(err);
  }
}

start();
