import {createLogger, format, transports} from 'winston'

const devFormat = format.printf(({level, message, label, timestamp}) => {
    return `[${timestamp}] (${level}) -> ${message}`
})

export const devLogger = () => {
    return createLogger({
        level: "debug",
        format: format.combine(format.colorize(), format.timestamp({format: "HH:mm:ss"}), devFormat), 
        transports: [
            new transports.Console(),
            new transports.File({filename: "devErrors.log"})
        ]
    })
}