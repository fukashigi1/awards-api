import express from 'express'
import { registerController } from '../controllers/registerController.js'

export const registerRoute = express()

registerRoute.post('/', registerController.register)