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
        const {awardName} = req.body
        const {email, username} = req.user
        const addAward = await awardsModel.addAward({awardName, email, username})
        res.status(addAward.status).json(addAward.content)
    }

    static async deleteAward (req, res) {
        const {id} = req.params
        const {username, email} = req.user
        const deleteAward = await awardsModel.deleteAward({id, username, email})
        res.status(deleteAward.status).json(deleteAward.content)
    }

    static async updateAward (req, res) {
        const {awardName, awardId, newAwardName, isPublic, isClosed, changeHash} = req.body
        const {username, email} = req.user
        const updateAward = await awardsModel.updateAward({awardName, awardId, newAwardName, isPublic, isClosed, changeHash, username, email})
        res.status(updateAward.status).json(updateAward.content)
    }
}