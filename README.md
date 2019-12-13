# hopbot

**hopbot** is a command-line cryptocurrency trading bot using Node.js. It features:

- Support for [CoinbasePro](https://https://pro.coinbase.com/). Work on further exchanges is planned.
- Plugin architecture for implementing additional exchange support, or adding new strategies.
- "Paper" trading mode ca be used for live tests without performing any operations in an exchange.

#### Current implementations
##### Exchanges
CoinbasePro implementation [here](src/plugins/exchanges/GdaxExchange.js)

###### Strategies
Manual StopLossTakeProfit strategy [here](src/plugins/strategies/StopLossTakeProfit.js)


#### Before using it:
Copy `credentials-sample.js` and rename it to `credentials.js`. Then, set the exchange's API Key data.
Review the current configs at [conf.js](conf.js). 
