/* eslint-disable no-underscore-dangle */
const LogLevel = {
  NONE: 0,
  REGULAR: 1,
  DEEP: 2,
};

let _logLevel = LogLevel.NONE;

function setLogLevel(level) {
  if (level !== LogLevel.NONE && level !== LogLevel.REGULAR && level !== LogLevel.DEEP) {
    throw new Error(`"${level}" is not a valid "LogLevel`);
  }

  _logLevel = level;
}

function logError(error) {
  console.error(`Error: ${new Date().toUTCString()}`);
  console.error(error);
}

function logErrorIf(error, minimumLevel = LogLevel.REGULAR) {
  if (minimumLevel === LogLevel.NONE) {
    throw new Error('matchLevel cannot be "LogLevelType.NONE"');
  }

  if (_logLevel >= minimumLevel) {
    logError(error);
  }
}

function logInfo(info) {
  console.info(info);
}

function logInfoIf(info, minimumLevel = LogLevel.REGULAR) {
  if (minimumLevel === LogLevel.NONE) {
    throw new Error('matchLevel cannot be "LogLevelType.NONE"');
  }

  if (_logLevel >= minimumLevel) {
    logInfo(info);
  }
}

export { LogLevel, setLogLevel, logError, logErrorIf, logInfo, logInfoIf };
