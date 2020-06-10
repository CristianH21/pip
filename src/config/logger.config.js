const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
require('winston-daily-rotate-file');

const customFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

const timezoned = () => {
    return new Date().toLocaleString('es-MX');
};

const logger =  createLogger({
    level: 'info',
    format: combine(
        timestamp({
            format: timezoned
        }),
        customFormat
    ),
    transports: [
        new transports.DailyRotateFile({
            filename: `${__dirname}/../../logs/log-%DATE%.log`,
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '10m',
            maxFiles: '14d'
        }),
        new transports.File({
            level: 'error',
            filename: `${__dirname}/../../logs/error.log`,
            handleExceptions: true,
            json: true,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            colorize: false,
        }),
        new transports.File({
            level: 'info',
            filename: `${__dirname}/../../logs/info.log`,
            handleExceptions: true,
            json: true,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            colorize: false,
        }),
        new transports.Console({
            handleExceptions: true,
            json: true,
            colorize: true
        })
    ],
    exitOnError: false
});


module.exports = logger;