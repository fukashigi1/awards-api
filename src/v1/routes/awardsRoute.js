import express from 'express'
import { awardsController } from '../controllers/awardsController.js'

export const awardsRoute = express()

awardsRoute.get('/', awardsController.allAwards)

awardsRoute.get('/:id', awardsController.singleAward)

awardsRoute.post('/', awardsController.addAward)

awardsRoute.delete('/:id', awardsController.deleteAward)

awardsRoute.patch('/', awardsController.updateAward)