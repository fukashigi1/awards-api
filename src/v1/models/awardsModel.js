import { connection } from "../../server.js"

export class awardsModel {
    static allAwards = async (userData) => {
        return {
            status: 200,
            content: {hola: "sex", userData}
        }
    }

    static singleAward = async () => {
        
    }

    static addAward = async () => {
        
    }

    static deleteAward = async () => {
        
    }

    static updateAward = async () => {
        
    }
}