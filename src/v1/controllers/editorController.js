import { editorModel } from "../models/editorModel.js";

export class editorController {
    static async obtainAward (req, res) {
        const { email, username } = req.user
        const { id } = req.params
        const obtainAwards = await editorModel.obtainAward({email, username, id})
        res.status(obtainAwards.status).json(obtainAwards.content)
    }

    static async saveQuestions (req, res) {
        const { email, username } = req.user
        const { awardId, questions, deletedQuestions } = req.body
        const deleteQuestions = await editorModel.saveQuestions({email, username, awardId, questions, deletedQuestions})
        res.status(deleteQuestions.status).json(deleteQuestions.content)
    }

}