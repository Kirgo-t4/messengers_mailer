const axios = require('axios')

const logger = require('../logger/logger')(module)

const URL = "https://eu103.chat-api.com/instanceINSTANCE/"

class ChatApiHelper {

    constructor({instance, token}) {
        this._instance = instance
        this._token = token
        this._url = URL.replace('INSTANCE', this._instance)
    }

    async send(peer, text) {
        console.log(peer, text)
        try {
            const result = await axios({
                method: 'post',
                url: this._url + 'sendMessage',
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

    async sendFile(phone, binary, filename) {
        try {
            const result = await axios({
                method: 'post',
                url: this._url + 'sendFile',
                params: {token: this._token},
                data: {
                    phone: phone,
                    body: binary,
                    filename: filename
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