import { connection } from "../../server.js"
import bcrypt from 'bcrypt'
import { validateEmail, validatePassword } from "../../utils.js"
import { BR } from '../businessRules.js'

export class registerModel {
    static register = async (userData) => {
        const {username, email, confirmEmail, password, confirmPassword} = userData
        let errors = []
        try {
            if (!username.trim()) { 
                errors.push({br: '001', title: BR['001']})
            }
        } catch(e) {
            errors.push({br: '001', title: BR['001']})
        }

        try {
            if (!email.trim()) {
                errors.push({br: '004', title: BR['004']})
            } 
            if (!validateEmail(email.trim())) {
                errors.push({br: '005', title: BR['005']})
            }
        } catch (e) {
            errors.push({br: '004', title: BR['004']})
        }

        if (confirmEmail === undefined) {
            errors.push({br: '006', title: BR['006']})
        }

        if (!password) {
            errors.push({br: '008', title: BR['008']})
        } else if (!validatePassword(password)) {
            errors.push({br: '009', title: BR['009']})
        }

        if (confirmPassword === undefined) {
            errors.push({br: '010', title: BR['010']})
        } else if (password != confirmPassword) {
            errors.push({br: '011', title: BR['011']})
        }

        try {
            if (email.trim() != confirmEmail.trim()) {
                errors.push({br: '007', title: BR['007']})
            }
        } catch (e) {
        }
        
        try {
            if (email !== undefined && email !== null) {
                const [emailExist] = await connection.query('SELECT email FROM users WHERE email = ?', [email.trim()])
                if (emailExist.length > 0) {
                    errors.push({br: '012', title: BR['012']})
                }
            }

            if (username !== undefined && username !== null) {
                const [usernameExist] = await connection.query('SELECT username FROM users WHERE username = ?', [username.trim()])
                if (usernameExist.length > 0) {
                    errors.push({br: '003', title: BR['003']})
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

        if (errors.length > 0) {
            return {
                status: 400, 
                content: {
                    status: 'fail',
                    data: errors.reverse()
                }
            }
        } else {
            try {
                const hashedPassword = await bcrypt.hash(password, 10)
                try {
                    let [registerResult] = await connection.query('INSERT INTO users (username, email, pass) VALUES (?, ?, ?)', [username.trim(), email.trim().toLowerCase(), hashedPassword])   
                    if (registerResult.affectedRows > 0) {
                        return {
                            status: 201, 
                            content: {
                                status: 'success',
                                data: null
                            }
                        }
                    } else {
                        return {
                            status: 409,
                            content: {
                                data: 'fail',
                                data: {br: '020', title: BR['020']}
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
                
            } catch (e) {
                logger.error('ERR-002')
                return {
                    status: 500,
                    content: {
                        status: 'error',
                        message: 'An internal server error has ocurred.',
                        code: 'ERR-002'
                    }
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