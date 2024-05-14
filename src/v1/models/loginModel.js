import { connection } from "../../server.js"
import { validateEmail } from "../../utils.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

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
            query = 'SELECT username, email, pass, user_type FROM users WHERE email = ?'
        } else {
            query = 'SELECT username, email, pass, user_type FROM users WHERE username = ?'
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
                                {element: 'usernameEmail', msg: 'Log in credentials are not valid.'}
                            ]
                        }
                    }
                }   
            } 

            const isPasswordCorrect = await bcrypt.compare(password, existUser[0].pass);

            if (isPasswordCorrect) {
                // generate token
                const secret = process.env.SECRET
                const userData = {
                    username: existUser[0].username,
                    email: existUser[0].email,
                    user_type: existUser[0].user_type
                }

                const token = await new Promise((resolve, reject) => {
                    jwt.sign(userData, secret, {expiresIn: '20s'}, (err, token) => {
                        if (err) reject(err);
                        else resolve(token)
                    });
                });

                /*const data = await new Promise((resolve, reject) => {
                    jwt.verify(token, secret, (err, payload) => {
                        if (err) reject(err);
                        else resolve(payload);
                    });
                });
                
                if (data) {
                    console.log(data)
                }*/
                return {
                    status: 200,
                    content: {
                        data: [
                            {token}
                        ],
                        errors: {
                            msg: "",
                            errors: []
                        }
                    }
                }
            } else {
                return {
                    status: 401,
                    content: {
                        data: [],
                        errors: {
                            msg: "",
                            errors: [
                                {element: 'usernameEmail', msg: 'Log in credentials are not valid.'}
                            ]
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

