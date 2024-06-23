import { logger } from "../../logger/logger.js"
import { connection } from "../../server.js"
import { BR } from '../businessRules.js'

export class editorModel {
    static obtainAward = async (userData) => {
        const { email, username, id} = userData
        try {
            const [userId] = await connection.query('SELECT BIN_TO_UUID(id) as id FROM users WHERE email = ? AND username = ?', [email, username])

            try {
                const [obtainAward] = await connection.query('SELECT award_name as awardName, hash, public, closed, creation_time as creationTime, modification_time as modificationTime FROM awards WHERE id = UUID_TO_BIN(?) AND owner = UUID_TO_BIN(?)', [id, userId[0].id])
    
                if (obtainAward.length == 0) {
                    return {
                        status: 400,
                        content: {
                            status: 'fail',
                            data: {br: '019', title: BR['019']}
                        }
                    }
                } 

                const [selectQuestions] = await connection.query('SELECT BIN_TO_UUID(id) as id, question, question_type as questionType, order_id as orderId, url, mandatory, question_choices as questionChoices, description FROM questions WHERE id_award = UUID_TO_BIN(?)', id)
            
                return {
                    status: 200,
                    content: {
                        status: 'success',
                        data: {awardData: obtainAward, awardQuestions: selectQuestions}
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

    static saveQuestions = async (data)  => {
        const { email, username, awardId, questions, deletedQuestions} = data

        if ((questions === undefined || questions === null || questions.length === 0) && (deletedQuestions === undefined || deletedQuestions === null || deletedQuestions.length === 0)) {
            return {
                status: 200,
                content: {
                    status: 'success',
                    data: {br: '024', title: BR['024']}
                }
            }
        }

        try {
            const [userId] = await connection.query('SELECT BIN_TO_UUID(id) as id FROM users WHERE email = ? AND username = ?', [email, username])
            const [selectAward] = await connection.query('SELECT 1 FROM awards WHERE owner = UUID_TO_BIN(?) AND id = UUID_TO_BIN(?)', [userId[0].id, awardId])
            if (selectAward.length == 0) {
                return {
                    status: 400,
                    content: {
                        status: 'fail',
                        data: {br: '019', title: BR['019']}
                    }
                }
            } 

            let couldNotDelete = []
            if (deletedQuestions !== undefined && deletedQuestions !== null && deletedQuestions != "") {
                if (deletedQuestions.length > 0) { // Check if there are questions to be removed
                    for (let i in deletedQuestions) {
                        try {
                            await connection.query('DELETE FROM questions WHERE id = UUID_TO_BIN(?) AND id_award = UUID_TO_BIN(?)', [deletedQuestions[i], awardId])
                        } catch (e) {
                            couldNotDelete.push({br: '025', title: BR['025'], data: deletedQuestions[i]})
                        }
                    }
    
                    if ((questions === null || questions === undefined || questions.length === 0)  && couldNotDelete.length === 0) {
                        return {
                            status: 200,
                            content: {
                                status: 'success',
                                data: null
                            }
                        }
                    } 
                }
            }

            if (questions !== null && questions !== undefined && questions.length !== 0) {
                let question, questionDbId
                for (let i in questions) {
                    let changed = false
                    question = questions[i]
                    if (question.url !== undefined) {
                        if (!validateUrl(question.url)){
                            return {
                                status: 400,
                                content: {
                                    status: 'fail',
                                    data: {br: '026', title: BR['026']}
                                }
                            }
                        }
                    }
                    
                    function validateUrl(url){
                        let ytRegex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu\.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/
                        let imageRegex = /^(http(s)?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ;,./?%&=]*)?\.(jpg|jpeg|png|gif|svg)$/
                        if (ytRegex.test(url)) {
                            return true;
                        } else if (imageRegex.test(url)) {
                            return true;
                        } else {
                            return false;
                        }
                    }

                    let errors = []

                    if (question.question === undefined || question.question === null || question.question === "") {
                        errors.push({br: '027', title: BR['027']})
                    }

                    if (question.questionType === undefined || question.questionType === null || question.questionType === "") {
                        errors.push({br: '028', title: BR['028']})
                    }

                    if (question.orderId === undefined || question.orderId === null || question.orderId === "") {
                        errors.push({br: '029', title: BR['029']})
                    }
                    
                    if (errors.length !== 0) { 
                        return {
                            status: 400,
                            content: {
                                status: 'fail',
                                data: errors
                            }
                        }
                    }
                    if (question.mandatory === undefined || question.mandatory > 1) {
                        question.mandatory = 1
                    } else if (question.mandatory < 0) {
                        question.mandatory = 0
                    }


                    if (question.description === undefined || question.description === null || question.description === '') {
                        question.description = ""
                    }

                    if (question.questionChoices === undefined || question.questionChoices === null || question.questionChoices === '') {
                        question.questionChoices = ""
                    }
                    
                    let query = "INSERT INTO questions (id_award, question, question_type, order_id, url, mandatory, question_choices, description) VALUE(UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?, ?)"
                    let params = [awardId, question.question, question.questionType, question.orderId, question.url, question.mandatory, question.questionChoices, question.description]
                    
                    
                    const [selectQuestions] = await connection.query('SELECT BIN_TO_UUID(id) as id, question, question_type as questionType, url, mandatory, question_choices as questionChoices, description FROM questions WHERE id_award = UUID_TO_BIN(?) ORDER BY order_id' , [awardId])
                    if (selectQuestions.length > 0) {
                        for (let x in selectQuestions) {
                            questionDbId = selectQuestions[x]
                            if (question.id === questionDbId.id) {
                                console.log("hola")
                                await connection.query('UPDATE questions SET question = ?, question_type = ?, order_id = ?, url = ?, mandatory = ?, question_choices = ?, description = ? WHERE id = UUID_TO_BIN(?)', [question.question, question.questionType, question.orderId, question.url, question.mandatory, question.questionChoices, question.description, question.id])
                                changed = true
                                break
                            } 
                        }
                        if (!changed) {
                            await connection.query(query, params)
                        }
                    } else {  
                        await connection.query(query, params)
                        
                    }


                }

            } 

            if (couldNotDelete.length != 0) {
                return {
                    status: 400,
                    content: {
                        status: 'fail',
                        data: couldNotDelete
                    }
                }
            }
            return {
                status: 200,
                content: {
                    status: 'success',
                    data: null
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
}