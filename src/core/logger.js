// https://github.com/winstonjs/winston
import winston from 'winston';

// TODO: create print function to log to console UI data (ticks, profits, etc.).

/**
 * @name LogLevel
 * @description Determines the log level for the application. Levels are prioritized from -1 to 5 (highest to lowest).
 * @summary It is based on npm and Winston's npm levels, plus a silent level. Winstons levels are:
 * {
 *    error: 0,
 *    warn: 1,
 *    info: 2,
 *    verbose: 3,
 *    debug: 4,
 *    silly: 5
 * }
 * @see https://github.com/winstonjs/winston#logging-levels
 */
const LogLevel = {
  SILENT: -1,
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  VERBOSE: 3,
  DEBUG: 4,
  TRACE: 5, // winston level = silly
};

let logger;

function setLogger(level = LogLevel.ERROR, exitOnError = true, logToFile = false) {
  if (level < LogLevel.NONE || level > LogLevel.TRACE) {
    throw new Error(`Invalid log level "${level}".`);
  }

  if (level === LogLevel.SILENT) {
    if (logger) {
      logger.silent = true;
    }
    return;
  }

  // Helper for converting LogLevel to winston level.
  const winstonLevels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
  const logFormatter = winston.format.printf((info) => {
    const { timestamp, ...meta } = info.metadata;
    // \n will just break line on a console, not on file (which is the desired behavior).
    return `${timestamp} ${info.level}: ${info.message} \n${JSON.stringify(meta)}`;
  });

  logger = winston.createLogger({
    levels: winston.config.npm.levels,
    level: winstonLevels[level],
    handleExceptions: true,
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.padLevels(),
          winston.format.metadata(),
          winston.format.errors({ stack: true }),
          logFormatter,
          winston.format.colorize({ all: true })
        ),
      }),
    ],
  });

  if (logToFile) {
    logger.add(
      new winston.transports.File({
        filename: `./logs/log_${new Date().getTime()}.log`,
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.padLevels(),
          winston.format.metadata(),
          winston.format.errors({ stack: true }),
          logFormatter
        ),
      })
    );
  }

  if (logger.silent) {
    logger.silent = false;
  }

  logger.exitOnError = exitOnError;
}

function logError(message, error = null) {
  const details = error ? ` \r\nException: ` : '';
  logger.error(`${message}${details}`, error);
}

function logWarn(message, details = '') {
  logger.warn(message, details);
}

function logInfo(message, details = '') {
  logger.info(message, details);
}

function logVerbose(message, details = '') {
  logger.verbose(message, details);
}

function logDebug(message, details = '') {
  logger.debug(message, details);
}

function logTrace(message, details = '') {
  logger.silly(message, details);
}

export { LogLevel, setLogger, logError, logWarn, logInfo, logVerbose, logDebug, logTrace };
