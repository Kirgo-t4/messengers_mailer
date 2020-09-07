const winston = require('winston');
require('winston-daily-rotate-file')
const path = require('path')


module.exports = (module_) => {

    const {combine, timestamp, printf, colorize} = winston.format

    const logFormatFile = printf(({ level, message, timestamp }) => {
        return `${timestamp} [${level.toLocaleUpperCase()}] [${module_.filename}] ${message}`;
    })

    const logFormatConsole = printf(({ level, message, timestamp }) => {
        return `${level} (${timestamp}) [${module_.filename}] ${message}`;
    })


    const logger = winston.createLogger({
        level: 'debug',
        transports: [
            new winston.transports.DailyRotateFile(
                {
                    filename: path.join(process.env.LOGDIR, '%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    maxFiles: '30d',
                    format: winston.format.combine(timestamp({format: 'DD-MM-YYYY HH:mm:ss'}), logFormatFile)
                }),
            new winston.transports.Console(
                {
                    format: combine(timestamp({format: 'HH:mm:ss'}), colorize(), logFormatConsole)}
            ),
        ],
    });

    logger.stream = {
        write(message, encoding) {
            logger.info(message)
        }
    }

    return logger
}