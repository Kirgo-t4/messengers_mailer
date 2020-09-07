const axios = require('axios')

const logger = require('../logger/logger')(module)

const URL = "https://eu103.chat-api.com/instanceINSTANCE/sendMessage"

class ChatApiHelper {

    constructor({instance, token}) {
        this._instance = instance
        this._token = token
    }

    async send(peer, text) {
        console.log(peer, text)
        const url = URL.replace('INSTANCE', this._instance)
        try {
            const result = await axios({
                method: 'post',
                url: url,
                params: {token: this._token},
                data: {
                    phone: peer,
                    body: text
                }
            })
            return {
                success: result.data.sent,
                response: result.data
            }
        } catch (e) {
            logger.error(e.stack)
            return {
                success: false
            }
        }

    }
}


module.exports = ChatApiHelper