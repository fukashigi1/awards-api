import { loginModel } from "../models/loginModel.js";

export class loginController {
    static async login (req, res) {
        const {usernameEmail, password} = req.body
        const loginUser = await loginModel.login({usernameEmail, password})
        res.status(loginUser.status).json(loginUser.content)
    }
}