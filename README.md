# hopbot

A crypto trading bot implementation that allows adding multiple crypto exchanges and/or strategies (pluggins).

Currently it implements [CoinbasePro](src/plugins/exchanges/GdaxExchange.js) (GDAX) exchange and a simple [StopLossTakeProfit](src/plugins/strategies/StopLossTakeProfit.js) manual strategy.


Before using it:
Copy `credentials-sample.js` and rename it to `credentials.js`. Then, set the exchange's API Key data.
