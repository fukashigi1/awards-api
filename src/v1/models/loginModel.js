import { connection } from "../../server.js"
import { validateEmail } from "../../utils.js"
import bcrypt from 'bcrypt'

export class loginModel {
    static login = async (userData) => {
        const {usernameEmail, password} = userData
        
        let query

        if (usernameEmail === undefined) {
            return {
                status: 400, 
                content: {
                    data: [],
                    errors: {
                        msg: "An error has ocurred because some data is missing or incorrect.",
                        errors: [
                            {element: 'usernameEmail', msg: 'The username or email can not be empty.'}
                        ]
                    }
                }
            }

        } else if (validateEmail(usernameEmail.trim())) {
            query = 'SELECT id, username, email, pass FROM users WHERE email = ?'
        } else {
            query = 'SELECT id, username, email, pass FROM users WHERE username = ?'
        }

        if (!password || password === undefined) {
            return {
                status: 400, 
                content: {
                    data: [],
                    errors: {
                        msg: "An error has ocurred because some data is missing or incorrect.",
                        errors: [
                            {element: 'password', msg: 'Password can not be empty.'}
                        ]
                    }
                }
            }   
        } 

        try {
            const [existUser] = await connection.query(query, usernameEmail)
            if (existUser.length === 0) { 
                return {
                    status: 400, 
                    content: {
                        data: [],
                        errors: {
                            msg: "An error has ocurred because some data is missing or incorrect.",
                            errors: [
                                {element: 'usernameEmail', msg: 'Username or email does not exists.'}
                            ]
                        }
                    }
                }   
            } 

            const isPasswordCorrect = await bcrypt.compare(password, existUser[0].pass);
            
            if (isPasswordCorrect) {
                // generar token
                console.log(isPasswordCorrect)

                
            }
            // Por borrar 
            return {
                status: 200,
                content: {
                    data: [
                        {usernameEmail, password, isPasswordCorrect}
                    ],
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
                        msg: "An internal server error has ocurred.",
                        errors: []
                    }
                }
            }
        }

    }
}

