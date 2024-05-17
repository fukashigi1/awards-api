import { connection } from "../../server.js"
import { generateHash } from "../../utils.js"

export class awardsModel {
    static allAwards = async (userData) => {
        const {email, username} = userData
        try {
            const [userId] = await connection.query('SELECT BIN_TO_UUID(id) as id FROM users WHERE email = ? AND username = ?', [email, username])
            const [obtainAwards] = await connection.query('SELECT BIN_TO_UUID(id) as id, award_name FROM awards WHERE owner = UUID_TO_BIN(?)', userId[0].id)
            
            return {
                status: 200,
                content: {
                    data: obtainAwards,
                    errors: {
                        msg: "",
                        errors: []
                    }
                }
            }

        } catch (e) {
            return {
                status: 500,
                content: {
                    data: [],
                    errors: {
                        msg: "An internal server error has ocurred while trying to fetch data.",
                        errors: []
                    }
                }
            }
        }
    }

    static singleAward = async (data) => {
        const {id, username, email} = data
        try {
            const [userId] = await connection.query('SELECT BIN_TO_UUID(id) as id FROM users WHERE email = ? AND username = ?', [email, username])

            try {
                const [obtainAwards] = await connection.query('SELECT award_name, hash, public, closed FROM awards WHERE owner = UUID_TO_BIN(?) AND id = UUID_TO_BIN(?)', [userId[0].id, id])
                
                return {
                    status: 200,
                    content: {
                        data: obtainAwards,
                        errors: {
                            msg: "",
                            errors: []
                        }
                    }
                }
            } catch (e) {
                return {
                    status: 400,
                    content: {
                        data: [],
                        errors: {
                            msg: "The id provided does not exist.",
                            errors: []
                        }
                    }
                }
            }


        } catch (e) {
            return {
                status: 500,
                content: {
                    data: [],
                    errors: {
                        msg: "An internal server error has ocurred while trying to fetch data.",
                        errors: []
                    }
                }
            }
        }
    }

    static addAward = async (awardData) => {
        let {award_name, email, username} = awardData

        if (award_name == undefined) {
            award_name = ''
        }

        if (award_name.trim() == '') {
            return {
                status: 400,
                content: {
                    data: [],
                    errors: {
                        msg: "",
                        errors: [
                            {element: 'award_name', msg: 'Award name can not be empty.'}
                        ]
                    }
                }
            }
        }

        try {
            const [userId] = await connection.query('SELECT BIN_TO_UUID(id) as id FROM users WHERE email = ? AND username = ?', [email, username])

            const hash = generateHash(36)

            const [doesExist] = await connection.query('SELECT award_name FROM awards WHERE owner = UUID_TO_bIN(?) AND award_name = ?', [userId[0].id, award_name])

            if (doesExist.length == 0) {
                const [addAward] = await connection.query('INSERT INTO awards (award_name, owner, hash) VALUES (?, UUID_TO_BIN(?), ?)', [award_name, userId[0].id, hash])

                if (addAward.affectedRows == 1) {
                    return {
                        status: 201,
                        content: {
                            data: [],
                            errors: {
                                msg: "",
                                errors: []
                            }
                        }
                    }
                } else {
                    return {
                        status: 422,
                        content: {
                            data: [],
                            errors: {
                                msg: "This award could not be created.",
                                errors: []
                            }
                        }
                    }
                }
            } else {
                return {
                    status: 400,
                    content: {
                        data: [],
                        errors: {
                            msg: "You can not have two awards by the same name.",
                            errors: []
                        }
                    }
                }
            }

        } catch (e) {
            return {
                status: 500,
                content: {
                    data: [],
                    errors: {
                        msg: "An internal server error has ocurred while trying to fetch data.",
                        errors: []
                    }
                }
            }
        }
    }

    static deleteAward = async () => {
        // falta
    }

    static updateAward = async () => {
        // falta
    }
}