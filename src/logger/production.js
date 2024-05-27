import {createLogger, format, transports} from 'winston'

const productionFormat = format.printf(({level, message, label, timestamp}) => {
    return `[${timestamp}] (${level}) |${label}| -> ${message}`
})

export const productionLogger = () => {
    return createLogger({
        level: "debug",
        format: format.combine( format.label({label: 'PRODUCTION'}), format.timestamp(), productionFormat), 
        transports: [
            new transports.Console(),
            new transports.File({filename: "productionErrors.log"})
        ]
    })
}