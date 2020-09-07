const Message = require('./MessageModel')
const {Processor} = require('../common/RequestProcessors')
const MessengerWatcher = require('../loop/MessageWatcher')

class AddMessagesProcessor extends Processor {
    async process(data, req) {
        const messagesFromRequest = req.body instanceof Array ? req.body : [req.body]

        const errors = []

        await Promise.all(messagesFromRequest.map(async (messageFromRequest) => {
            const {peer, message, messenger, uid} = messageFromRequest
            try {
                const messageDoc = new Message({
                    peer, message, messenger, uid
                })
                await messageDoc.save()
            } catch (e) {
                errors.push({peer, messenger})
            }

        }))

        if (errors.length === messagesFromRequest.length) {
            return {
                message: "Nothing loaded",
                error_code: 400
            }
        }

        new MessengerWatcher().process().then()

        return {
            result: errors.length ? {errors} : 'All messages loaded',
            error_code: 0,
        }
    }
}

module.exports = {AddMessagesProcessor}