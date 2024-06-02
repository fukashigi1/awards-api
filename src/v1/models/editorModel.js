import { connection } from "../../server.js"

export class editorModel {
    static obtainQuestions = async (userData) => {
        const { email, username, id } = userData
        try {
            const [userId] = await connection.query('SELECT BIN_TO_UUID(id) as id FROM users WHERE email = ? AND username = ?', [email, username])
            
            const [selectQuestions] = await connection.query('SELECT ') //AQUI

        } catch (e) {
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
}