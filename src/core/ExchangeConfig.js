/* */

const APIType = {
  REST: 'REST',
  WEB_SOCKET: 'WEB_SOCKET',
  FIX: 'FIX',
};

const APIMode = {
  PRODUCTION: 'PRODUCTION',
  SANDBOX: 'SANDBOX',
};

const ConnectionStatus = {
  CONNECTING: 'CONNECTING', // Connecting to exchange
  CONNECTED: 'CONNECTED', // Connected to exchange
  CLOSED: 'CLOSED', // Disconnected from exchange
  ERROR: 'ERROR', // Error when attempted to connect
};

const TradingMode = {
  LIVE: 'LIVE', // Live trading
  PAPER: 'PAPER', // Paper trading
  SIM: 'SIM', // Simulation
};

export { APIType, APIMode, ConnectionStatus, TradingMode };
