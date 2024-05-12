import express from 'express'
import { awardsController } from '../controllers/awardsController.js'

export const awardsRoute = express()

awardsRoute.get('/', awardsController.allAwards)

awardsRoute.get('/:award', awardsController.singleAward)

awardsRoute.post('/', awardsController.addAward)

awardsRoute.delete('/:award', awardsController.deleteAward)

awardsRoute.patch('/:award', awardsController.updateAward)