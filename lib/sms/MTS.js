const axios = require('axios');

const SMS_URL = 'https://api.mcommunicator.ru/m2m/m2m_api.asmx/SendMessage';

class MTS {

    constructor({api_key}) {
        this._API_KEY = api_key
    }

    async send(peer, text) {
        console.log('MTS')
        try {
            const response = await axios.get(SMS_URL, {
                headers: {
                    Authorization: `Bearer ${this._API_KEY}`
                },
                params: {
                    msid: peer,
                    message: text,
                    naming: 'BCGroupPhone'
                }
            })
            console.log(response.data)
            return {
                success: true,
                response: response.data
            }
        } catch (e) {
            console.log(e)
            return {
                success: false,
                response: e.message
            }
        }
    }
}

module.exports = MTS