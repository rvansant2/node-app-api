import appRoot from 'app-root-path';
import winston from 'winston';
import 'winston-daily-rotate-file';

const options = {
  file: {
    level: 'info',
    filename: `${appRoot}/app-logs/app-%DATE%.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    colorize: false,
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
  exceptions: {
    filename: `${appRoot}/app-logs/exceptions-%DATE%.log`,
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  },
};

const winstonLogger = winston.createLogger({
  transports: [
    new winston.transports.DailyRotateFile(options.file),
    new winston.transports.Console(options.console),
  ],
  exceptionHandlers: [new winston.transports.DailyRotateFile(options.exceptions)],
  exitOnError: false, // do not exit on handled exceptions
});

winstonLogger.stream = {
  write(message) {
    winstonLogger.info(message);
  },
};

export default winstonLogger;
