import { awardsModel } from "../models/awardsModel.js"

export class awardsController {
    static async allAwards (req, res) {
       const obtainAllAwards = await awardsModel.allAwards(req.user)
       res.status(obtainAllAwards.status).json(obtainAllAwards.content)
    }

    static async singleAward (req, res) {
        const {id} = req.params
        const {username, email} = req.user
        const obtainSingleAward = await awardsModel.singleAward({id, username, email})
        res.status(obtainSingleAward.status).json(obtainSingleAward.content)
    }

    static async addAward (req, res) {
        const {award_name} = req.body
        const {email, username} = req.user
        const addAward = await awardsModel.addAward({award_name, email, username})
        res.status(addAward.status).json(addAward.content)
    }

    static async deleteAward (req, res) {
        
    }

    static async updateAward (req, res) {
        
    }
}