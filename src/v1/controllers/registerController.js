import { registerModel } from "../models/registerModel.js";

export class registerController {
    static async register (req, res) {
        const {username, email, confirmEmail, password, confirmPassword} = req.body
        const registerUser = await registerModel.register({username, email, confirmEmail, password, confirmPassword})
        res.status(registerUser.status).json(registerUser.content)
    }
}