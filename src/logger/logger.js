import { devLogger } from "./dev.js"
import { productionLogger } from "./production.js"
import dotenv from 'dotenv'

export let logger = null

dotenv.config({path: 'CONFIG.env'})

let nodeEnv = process.env.NODE_ENV

if (nodeEnv === 'production') {
    logger = productionLogger()
}

if (nodeEnv === 'dev') {
    logger = devLogger()
}