import { editorModel } from "../models/editorModel.js";

export class editorController {
    static async obtainQuestions (req, res) {
        const { email, username } = req.user
        const { id } = req.params
        const obtainQuestions = await editorModel.obtainQuestions({email, username, id})
        res.status(obtainQuestions.status).json(obtainQuestions.content)
    }
}