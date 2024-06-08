import express from 'express'
import { editorController } from '../controllers/editorController.js'

export const editorRoute = express()

editorRoute.get('/:id', editorController.obtainAward)
editorRoute.post('/', editorController.saveQuestions)