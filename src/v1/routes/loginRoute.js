import express from 'express'
import { loginController } from '../controllers/loginController.js'

export const loginRoute = express()

loginRoute.post('/', loginController.login)