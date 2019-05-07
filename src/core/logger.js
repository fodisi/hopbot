/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */

// TODO: Refactor Logger to use better Log levels, such as:
// error - Other runtime errors or unexpected conditions. Expect these to be immediately visible on a status console.
// warn - Use of deprecated APIs, poor use of API, 'almost' errors, other runtime situations that are undesirable or unexpected, but not necessarily "wrong". Expect these to be immediately visible on a status console.
// info - Interesting runtime events (startup/shutdown). Expect these to be immediately visible on a console, so be conservative and keep to a minimum.
// debug - detailed information on the flow through the system. Expect these to be written to logs only.
// trace - more detailed information. Expect these to be written to logs only.
const LogLevel = {
  NONE: 0,
  REGULAR: 1,
  DETAILED: 2,
  DEEP: 3,
};

let _logLevel = LogLevel.NONE;

function setLogLevel(level) {
  if (level < LogLevel.NONE || level > LogLevel.DEEP) {
    throw new Error(`"${level}" is not a valid "LogLevel`);
  }

  _logLevel = level;
}

function logError(error, details = '') {
  console.error(`Error: ${new Date().toUTCString()}`);
  console.error(error, details);
}

function logErrorIf(error, minimumLevel = LogLevel.REGULAR) {
  if (minimumLevel === LogLevel.NONE) {
    return;
  }

  if (_logLevel >= minimumLevel) {
    logError(error);
  }
}

function logInfo(info, details = '') {
  console.info(info, details);
}

function logInfoIf(info, minimumLevel = LogLevel.REGULAR) {
  if (minimumLevel === LogLevel.NONE) {
    return;
  }

  if (_logLevel >= minimumLevel) {
    logInfo(info);
  }
}

export { LogLevel, setLogLevel, logError, logErrorIf, logInfo, logInfoIf };
