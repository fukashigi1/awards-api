import { connection } from "../../server.js"
import { validateEmail } from "../../utils.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { BR } from '../businessRules.js'
import { logger } from "../../logger/logger.js"

export class loginModel {
    static login = async (userData) => {
        const {usernameEmail, password} = userData
        
        let query

        if (usernameEmail === undefined) {
            return {
                status: 400, 
                content: {
                    status: 'fail',
                    data: {br: '013', title: BR['013']}
                }
            }

        } else if (validateEmail(usernameEmail.trim())) {
            query = 'SELECT username, email, pass, BIN_TO_UUID(user_type) as user_type FROM users WHERE email = ?'
        } else {
            query = 'SELECT username, email, pass, BIN_TO_UUID(user_type) as user_type FROM users WHERE username = ?'
        }

        if (!password || password === undefined) {
            return {
                status: 400, 
                content: {
                    status: 'fail',
                    data: {br: '008', title: BR['008']}
                }
            }   
        } 

        try {
            const [existUser] = await connection.query(query, usernameEmail)
            if (existUser.length === 0) { 
                return {
                    status: 400, 
                    content: {
                        status: 'fail',
                        data: {br: '014', title: BR['014']}
                    }
                }   
            } 

            try {
                const isPasswordCorrect = await bcrypt.compare(password, existUser[0].pass);

                if (isPasswordCorrect) {
                    const secret = process.env.SECRET
                    const userData = {
                        username: existUser[0].username,
                        email: existUser[0].email,
                        user_type: existUser[0].user_type
                    }
    
                    const token = await new Promise((resolve, reject) => {
                        jwt.sign(userData, secret, {expiresIn: '60m'}, (err, token) => {
                            if (err) reject(err);
                            else resolve(token)
                        });
                    });
    
                    return {
                        status: 200,
                        content: {
                            status: 'success',
                            data: {token: `Bearer ${token}`}
                        }
                    }
                } else {
                    return {
                        status: 401,
                        content: {
                            status: 'fail',
                            data: {br: '014', title: BR['014']}
                        }
                    }
                }
            } catch (e) {
                logger.error('ERR-004')
                return {
                    status: 500,
                    content: {
                        status: 'error',
                        message: 'An internal server error has ocurred.',
                        code: 'ERR-004'
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

