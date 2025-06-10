import getmac from 'getmac';
import winston from 'winston';
import { createLogger } from 'logzio-nodejs';

const weAreInProduction = (process.env.NODE_ENV || '')
  .toLowerCase()
  .startsWith('prod');

const { combine, timestamp, colorize, printf } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp
    .toString()
    .replace('T', ' ')
    .replace('Z', '')} ${level}: ${message}`;
});

const logzio = createLogger({
  token: 'mFJpupXOLGfnACdjyGZlomwDdpxVfUFI',
  protocol: 'https',
  host: 'listener-eu.logz.io',
  port: '8071',
  type: 'tomer-shvadron-logs',
  debug: !weAreInProduction,
});

logzio.extraFields = {
  ...(logzio.extraFields || {}),
  mymac: getmac(),
  pid: process.pid,
};

const winstonLogger = winston.createLogger({
  level: weAreInProduction ? 'info' : 'debug',
  format: combine(colorize(), timestamp(), myFormat),
  transports: [new winston.transports.Console()],
});

export const logger = {
  debug: (message: string, obj?: object): void => {
    logzio.log({ ...(obj || {}), message, level: 'debug' });
    winstonLogger.debug({ ...(obj || {}), message });
  },

  info: (message: string, obj?: object): void => {
    logzio.log({ ...(obj || {}), message, level: 'info' });
    winstonLogger.info({ ...(obj || {}), message });
  },

  warn: (message: string, obj?: object): void => {
    logzio.log({ ...(obj || {}), message, level: 'warn' });
    winstonLogger.warn({ ...(obj || {}), message });
  },

  error: (message: string, obj?: object): void => {
    logzio.log({ ...(obj || {}), message, level: 'error' });
    winstonLogger.error({ ...(obj || {}), message });
  },
};
