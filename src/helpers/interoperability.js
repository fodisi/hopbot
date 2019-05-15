/**
 * @name interoperability
 * @description Set of methods that enable interoperability between the different exchanges and its
 * formats as product names (BTC-USD x BTC/USD x USD/BTC, etc.), API requests / responses formats, etc.
 */

/** The product one uses to buy the instrument on an exchange.
 * Example on GDAX: LTD/USD: one uses USD as the product on a buy order.
 */
function getBuyProductFromInstrument(instrumentId, exchangeName) {
  switch (exchangeName.toUpperCase()) {
    case 'GDAX':
      return instrumentId.substring(4, 7);
    default:
      throw new Error(`Error on getSellProductFromInstrument - unknown exchange name "${exchangeName}".`);
  }
}

/** The product one uses to sell the instrument on an exchange.
 * Example on GDAX: LTD/USD: one uses BTC as the product on a sell order.
 */
function getSellProductFromInstrument(instrumentId, exchangeName) {
  switch (exchangeName.toUpperCase()) {
    case 'GDAX':
      return instrumentId.substring(0, 3);
    default:
      throw new Error(`Error on getSellProductFromInstrument - unknown exchange name "${exchangeName}".`);
  }
}

export { getBuyProductFromInstrument, getSellProductFromInstrument };
