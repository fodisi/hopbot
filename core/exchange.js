#!/usr/bin/env node

class Exchange {
  constructor(options = {}) {
    this.isTrading = false;
    this.isExecuting = false;
    this.options = options;
  }
}

export default Exchange;
