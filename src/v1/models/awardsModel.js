import { connection } from "../../server.js"
import { generateHash } from "../../utils.js"

export class awardsModel {
    static allAwards = async (userData) => {
        const {email, username} = userData
        try {
            const [userId] = await connection.query('SELECT BIN_TO_UUID(id) as id FROM users WHERE email = ? AND username = ?', [email, username])
            const [obtainAwards] = await connection.query('SELECT BIN_TO_UUID(id) as id, award_name as awardName FROM awards WHERE owner = UUID_TO_BIN(?)', userId[0].id)
            
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
                const [obtainAwards] = await connection.query('SELECT award_name as awardName, hash, public, closed FROM awards WHERE owner = UUID_TO_BIN(?) AND id = UUID_TO_BIN(?)', [userId[0].id, id])
                
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
        let {awardName, email, username} = awardData

        if (awardName === undefined || awardName === null) {
            awardName = ''
        }

        if (awardName.trim() == '') {
            return {
                status: 400,
                content: {
                    data: [],
                    errors: {
                        msg: "",
                        errors: [
                            {element: 'awardName', msg: 'Award name can not be empty.'}
                        ]
                    }
                }
            }
        }

        try {
            const [userId] = await connection.query('SELECT BIN_TO_UUID(id) as id FROM users WHERE email = ? AND username = ?', [email, username])

            const hash = generateHash(36)

            const [doesExist] = await connection.query('SELECT award_name as awardName FROM awards WHERE owner = UUID_TO_bIN(?) AND award_name = ?', [userId[0].id, awardName])

            if (doesExist.length == 0) {
                const [addAward] = await connection.query('INSERT INTO awards (award_name, owner, hash) VALUES (?, UUID_TO_BIN(?), ?)', [awardName, userId[0].id, hash])
                const [obtainIdAward] = await connection.query('SELECT BIN_TO_UUID(id) as awardId FROM awards WHERE award_name = ? AND owner = UUID_TO_BIN(?) AND hash = ?', [awardName, userId[0].id, hash])

                if (addAward.affectedRows == 1) {
                    return {
                        status: 201,
                        content: {
                            data: obtainIdAward,
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

    static deleteAward = async (awardData) => {
        const {id, username, email} = awardData

        if (id === undefined || id === null || id.trim() === '') {
            return {
                status: 400,
                content: {
                    data: [],
                    errors: {
                        msg: "The id provided can not be empty.",
                        errors: []
                    }
                }
            }
        }

        try {
            const [userId] = await connection.query('SELECT BIN_TO_UUID(id) as id FROM users WHERE email = ? AND username = ?', [email, username])
            try {
                const [deleteAward] = await connection.query('DELETE FROM awards WHERE id = UUID_TO_BIN(?) AND owner = UUID_TO_BIN(?)', [id, userId[0].id])
                if (deleteAward.affectedRows >= 1) {
                    return {
                        status: 200,
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
                        status: 400,
                        content: {
                            data: [],
                            errors: {
                                msg: "The id of the award provided does not match with any of your awards.",
                                errors: []
                            }
                        }
                    }
                }
            } catch (e) {
                return {
                    status: 400,
                    content: {
                        data: [],
                        errors: {
                            msg: "The id of the award provided does not match with any of your awards.",
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
                        msg: "An internal server error has ocurred while trying to delete a resource.",
                        errors: []
                    }
                }
            }
        }
        
    }

    static updateAward = async (data) => {
        const {awardName, awardId, newAwardName, isPublic, isClosed, changeHash, username, email} = data
        let query = 'UPDATE awards SET '
        let params = []
    
        if (awardName === undefined || awardName === null || awardName === '') {
            return {
                status: 400,
                content: {
                    data: [],
                    errors: {
                        msg: "The award name can not be empty.",
                        errors: []
                    }
                }
            };
        }
    
        if (awardId === undefined || awardId === null || awardId === '') {
            return {
                status: 400,
                content: {
                    data: [],
                    errors: {
                        msg: "The award id can not be empty.",
                        errors: []
                    }
                }
            };
        }
    
        let fieldsToUpdate = []
    
        if (newAwardName !== undefined && newAwardName !== null && newAwardName !== '') {
            fieldsToUpdate.push('award_name = ?')
            params.push(newAwardName.trim())
        }
    
        if (isPublic !== undefined && isPublic !== null) {
            fieldsToUpdate.push('public = ?')
            params.push((isPublic >= 1) ? 1 : 0)
        }
    
        if (isClosed !== undefined && isClosed !== null) {
            fieldsToUpdate.push('closed = ?')
            params.push((isClosed >= 1) ? 1 : 0)
        }
    
        let newHash;
        if (changeHash === true) {
            newHash = generateHash(36)
            fieldsToUpdate.push('hash = ?')
            params.push(newHash)
        }
    
        if (fieldsToUpdate.length === 0) {
            return {
                status: 400,
                content: {
                    data: [],
                    errors: {
                        msg: "No fields to update.",
                        errors: []
                    }
                }
            }
        }
    
        query += fieldsToUpdate.join(', ')
    
        try {
            const [userIdResult] = await connection.query('SELECT BIN_TO_UUID(id) as id FROM users WHERE email = ? AND username = ?', [email, username])
    
            query += ' WHERE owner = UUID_TO_BIN(?) AND id = UUID_TO_BIN(?) AND award_name = ?'
            params.push(userIdResult[0].id)
            params.push(awardId)
            params.push(awardName)

            const [updateAwardResult] = await connection.query(query, params)

            if (updateAwardResult.affectedRows != 0) {
                return {
                    status: 200,
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
                    status: 400,
                    content: {
                        data: [],
                        errors: {
                            msg: "No awards have been modfied. Please check your input.",
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
                        msg: "An error occurred while updating the award: " + e.message,
                        errors: {
                            msg: "The award name can not be empty.",
                            errors: []
                        }
                    }
                }
            }
        }
    }
}

// actualizar con codigo de errores.