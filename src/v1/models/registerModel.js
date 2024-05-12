import { connection } from "../../server.js"
import bcrypt from 'bcrypt'
import { validateEmail, validatePassword } from "../../utils.js"

export class registerModel {
    static register = async (userData) => {
        const {username, email, confirmEmail, password, confirmPassword} = userData
        let errors = []
        try {
            if (!username.trim()) { 
                errors.push({element: 'username', msg: 'Username can not be empty.'})
            }
        } catch(e) {
            errors.push({element: 'username', msg: 'Username can not be empty.'})
        }

        try {
            if (!email.trim()) {
                errors.push({element: 'email', msg: 'Email can not be empty.'})
            } 
            if (!validateEmail(email.trim())) {
                errors.push({element: 'email', msg: 'Email is invalid.'})
            }
        } catch (e) {
            errors.push({element: 'email', msg: 'Email can not be empty.'})
        }

        if (confirmEmail === undefined) {
            errors.push({element: 'confirmEmail', msg: 'Email confirmation can not be empty.'})
        }

        if (!password) {
            errors.push({element: 'password', msg: 'Password can not be empty.'})
        } else if (!validatePassword(password)) {
            errors.push({element: 'password', msg: 'Password must be at least 8 characters long.'})
        }

        if (confirmPassword === undefined) {
            errors.push({element: 'confirmPassword', msg: 'Password confirmation can not be empty.'})
        } else if (password != confirmPassword) {
            errors.push({element: 'confirmPassword', msg: 'Password confirmation can not be different from password.'})
        }

        try {
            if (email.trim() != confirmEmail.trim()) {
                errors.push({element: 'confirmEmail', msg: 'Email confirmation can not be different from email.'})
            }
        } catch (e) {
        }
        
        try {
            if (confirmEmail !== undefined) {
                const [emailExist] = await connection.query('SELECT email FROM users WHERE email = ?', [email.trim()])
                if (emailExist.length > 0) {
                    errors.push({element: 'email', msg: 'The email entered is already in use.'})
                }
            }

            if (username !== undefined) {
                const [usernameExist] = await connection.query('SELECT username FROM users WHERE username = ?', [username.trim()])
                if (usernameExist.length > 0) {
                    errors.push({element: 'username', msg: 'The username entered is already in use.'})
                }
            }

        } catch (e) {
            return {
                status: 500,
                content: {
                    data: [],
                    errors: {
                        msg: "An internal server error has ocurred.",
                        errors: []
                    }
                }
            }
        }

        if (errors.length > 0) {
            return {
                status: 400, 
                content: {
                    data: [],
                    errors: {
                        msg: "An error has ocurred because some data is missing or incorrect.",
                        errors: errors.reverse()
                    }
                }
            }
        } else {
            try {
                const hashedPassword = await bcrypt.hash(password, 10)
                let [registerResult] = await connection.query('INSERT INTO users (username, email, pass) VALUES (?, ?, ?)', [username.trim(), confirmEmail.trim().toLowerCase(), hashedPassword])   
                if (registerResult.affectedRows > 0) {
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
                        status: 500,
                        content: {
                            data: [],
                            errors: {
                                msg: "An internal server error has ocurred.",
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
                            msg: "An internal server error has ocurred.",
                            errors: []
                        }
                    }
                }
            }
        }
    }
}