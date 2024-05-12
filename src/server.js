import express from 'express'
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import jwt from 'jsonwebtoken'

dotenv.config({path: 'CONFIG.env'})

const app = express()
app.disable('x-powered-by')
app.use(express.urlencoded({extended: false}))
app.use(express.json())

const port = process.env.PORT ?? 3000

const db_config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}
export let connection;

try {
    connection = await mysql.createConnection(db_config)
} catch (e) {
    console.log(e)
}

// MIDDLEWARES

// ROUTES
const v1 = '/api/v1'

import { awardsRoute } from './v1/routes/awardsRoute.js'
import { registerRoute } from './v1/routes/registerRoute.js'
import { loginRoute } from './v1/routes/loginRoute.js'

app.use(`${v1}/awards`, awardsRoute)
app.use(`${v1}/register`, registerRoute)
app.use(`${v1}/login`, loginRoute)

app.get('/status', (req, res) => {
    res.status(200).send('OK')
})

app.get('/api/v1', (req, res) => {
    res.status(200).send('API VERSION 1')
})

app.use((req, res) => { // NOT FOUND
    res.status(404).send()
})


// START SERVER
app.listen(port, () => {
    console.log(`Server running on ${process.env.HOST}:${port}`)
})