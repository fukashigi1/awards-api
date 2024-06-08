import { logger } from "../../logger/logger.js"
import { connection } from "../../server.js"
import { generateHash } from "../../utils.js"
import { BR } from '../businessRules.js'
import { checkIfUserIsAdmin } from "../../server.js"

export class awardsModel {
    static allAwards = async (userData) => {
        const {email, username, user_type} = userData

        /*if (checkIfUserIsAdmin(user_type)) {
            return {
                status: 403,
                content: {
                    status: 'fail',
                    data: "You do not have the required permissions to access this resource."
                }
            }
        }*/

        try {
            const [userId] = await connection.query('SELECT BIN_TO_UUID(id) as id FROM users WHERE email = ? AND username = ?', [email, username])
            const [obtainAwards] = await connection.query('SELECT BIN_TO_UUID(id) as id, award_name as awardName, hash, public, closed, creation_time as creationTime, modification_time as modificationTime FROM awards WHERE owner = UUID_TO_BIN(?)', userId[0].id)
            
            return {
                status: 200,
                content: {
                    status: 'success',
                    data: obtainAwards
                }
            }

        } catch (e) {
            logger.error('ERR-001')
            return {
                status: 500,
                content: {
                    status: 'error',
                    message: 'An internal server error has ocurred.',
                    code: 'ERR-001'
                }
            }
        }
    }

    static singleAward = async (data) => {
        const {id, username, email} = data
        if (id === null || id === undefined) {
            return {
                status: 400,
                content: {
                    status: 'fail',
                    data: {br: '015', title: BR['015']}
                }
            }
        }
        try {
            const [userId] = await connection.query('SELECT BIN_TO_UUID(id) as id FROM users WHERE email = ? AND username = ?', [email, username])

            try {
                const [obtainAwards] = await connection.query('SELECT award_name as awardName, hash, public, closed, creation_time as creationTime, modification_time as modificationTime FROM awards WHERE owner = UUID_TO_BIN(?) AND id = UUID_TO_BIN(?)', [userId[0].id, id])
                
                if (obtainAwards.length == 0) {
                    return {
                        status: 400,
                        content: {
                            status: 'fail',
                            data: {br: '019', title: BR['019']}
                        }
                    }
                } 

                return {
                    status: 200,
                    content: {
                        status: 'success',
                        data: obtainAwards
                    }
                }

            } catch (e) {
                logger.error('ERR-001')
                return {
                    status: 500,
                    content: {
                        status: 'error',
                        message: 'An internal server error has ocurred.',
                        code: 'ERR-001'
                    }
                }
            }

        } catch (e) {
            logger.error('ERR-001')
            return {
                status: 500,
                content: {
                    status: 'error',
                    message: 'An internal server error has ocurred.',
                    code: 'ERR-001'
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
                    status: 'fail',
                    data: {br: '016', msg: BR['016']}
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
                            status: 'success',
                            data: obtainIdAward
                        }
                    }
                } else {
                    return {
                        status: 422,
                        content: {
                            status: 'fail',
                            data: {br: '017', title: BR['017']}
                        }
                    }
                }
            } else {
                return {
                    status: 400,
                    content: {
                        status: 'fail',
                        data: {br: '021', title: BR['021']}
                    }
                }
            }

        } catch (e) {
            logger.error('ERR-001')
            return {
                status: 500,
                content: {
                    status: 'error',
                    message: 'An internal server error has ocurred.',
                    code: 'ERR-001'
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
                    status: 'fail',
                    data: {br: '018', title: BR['018']}
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
                            status: 'success',
                            data: null
                        }
                    }
                } else {
                    return {
                        status: 400,
                        content: {
                            status: 'fail',
                            data: {br: '019', title: BR['019']}
                        }
                    }
                }
            } catch (e) {
                return {
                    status: 400,
                    content: {
                        status: 'fail',
                        data: {br: '019', title: BR['019']}
                    }
                }
            }
        } catch (e) {
            logger.error('ERR-001')
            return {
                status: 500,
                content: {
                    status: 'error',
                    message: 'An internal server error has ocurred.',
                    code: 'ERR-001'
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
                    status: 'fail',
                    data: {br: '016', title: BR['016']}
                }
            };
        }
    
        if (awardId === undefined || awardId === null || awardId === '') {
            return {
                status: 400,
                content: {
                    status: 'fail',
                    data: {br: '016', title: BR['016']}
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
                    status: 'fail',
                    data: {br: '022', title: BR['022']}
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
                        status: 'success',
                        data: null
                    }
                }
            } else {
                return {
                    status: 400,
                    content: {
                        status: 'fail',
                        data: {br: '023', title: BR['023']}
                    }
                }
            }
    
        } catch (e) {
            logger.error('ERR-001')
            return {
                status: 500,
                content: {
                    status: 'error',
                    message: 'An internal server error has ocurred.',
                    code: 'ERR-001'
                }
            }
        }
        logger.error('ERR-001')
        return {
            status: 500,
            content: {
                status: 'error',
                message: 'An internal server error has ocurred.',
                code: 'ERR-003'
            }
        }
    }
}