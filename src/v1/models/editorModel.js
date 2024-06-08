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

            if (questions !== null && questions !== undefined && questions.length !== 0) {
                let questionInputId, questionDbId
                for (let i in questions) {
                    let changed = false
                    questionInputId = questions[i]

                    if (questionInputId.url !== undefined) {
                        if (!validateUrl(questionInputId.url)){
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

                    if (questionInputId.question === undefined || questionInputId.question === null || questionInputId.question === "") {
                        errors.push({br: '027', title: BR['027']})
                    }

                    if (questionInputId.question_type === undefined || questionInputId.question_type === null || questionInputId.question_type === "") {
                        errors.push({br: '028', title: BR['028']})
                    }

                    if (questionInputId.order_id === undefined || questionInputId.order_id === null || questionInputId.order_id === "") {
                        errors.push({br: '029', title: BR['029']})
                    }
                    
                    console.log("aca")
                    if (errors.length !== 0) { // QUEDÉ AQUI ///////////////////////
                        return {
                            status: 400,
                            content: {
                                status: 'fail',
                                data: errors
                            }
                        }
                    }

                    if (questionInputId.mandatory === undefined || questionInputId.mandatory > 1) {
                        questionInputId.mandatory = 1
                    } else if (questionInputId.mandatory < 0) {
                        questionInputId.mandatory = 0
                    }
                    
                    for (let x in selectQuestions) {
                        questionDbId = selectQuestions[x]
                        if (questionInputId.id === questionDbId.id) {
                            await connection.query('UPDATE questions SET question = ?, question_type = ?, order_id = ?, url = ?, mandatory = ?, question_choices = ?,description= ? WHERE id = UUID_TO_BIN(?)', [questionInputId.question, questionInputId.question_type, questionInputId.order_id, questionInputIdurl,questionInputId.mandatory, questionInputId.question_choices, questionInputId.description, questionInputId.id])
                            changed = true
                            break
                        } 
                    }
                    if (!changed) {
                        console.log ("ohola");
                        await connection.query('INSERT INTO questions (id_award, question, question_type, order_id, url, mandatory, question_choices, description) VALUE(?, ?, ?, ?, ?, ?, ?, ?)', [award_id, questionInputId.question, questionInputId.question_type, questionInputId.order_id, questionInputId.urlquestionInputId.mandatory, questionInputId.question_choices, questionInputId.description])
                    }
                }

            } else {  // En caso de que no hayan questions
                let question
                for (let i in questions) {
                    question = questions[i]
                    await connection.query('INSERT INTO questions (id_award, question, question_type, order_id, url, mandatory, question_choices, description) VALUE(?, ?, ?, ?, ?, ?), ?', [award_id, question.question, question.question_type, question.order_id, question.url, question.mandatory, questioquestion_choices, question.description])
                }
                
            }

            return {
                status: 200,
                content: {
                    status: 'success',
                    data: "yea"
                }
            }
            /*if (couldNotDelete.length != 0) {
                return {
                    status: 400,
                    content: {
                        status: 'fail',
                        data: couldNotDelete
                    }
                }
            }*/


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