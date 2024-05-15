import { awardsModel } from "../models/awardsModel.js"

export class awardsController {
    static async allAwards (req, res) {
       const obtainAllAwards = await awardsModel.allAwards(req.user)
       res.status(obtainAllAwards.status).json(obtainAllAwards.content)
    }

    static async singleAward (req, res) {
        
    }

    static async addAward (req, res) {
        
    }

    static async deleteAward (req, res) {
        
    }

    static async updateAward (req, res) {
        
    }
}