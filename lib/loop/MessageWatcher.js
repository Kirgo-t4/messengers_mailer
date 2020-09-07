const Message = require('../message/MessageModel')
const {expiredDate, pause} = require('../common/commonfunctions')
const logger = require('../logger/logger')(module)

const EXPIRATION_DATE = 1000*60*60*24
const VERIFYING_EXPIRATION = 1000*60*3

const INTERVAL = 1000*60

class MessageWatcher {
    constructor(senders = {}) {
        if (MessageWatcher.exists) {
            return MessageWatcher._instanse
        }
        MessageWatcher._instanse = this
        MessageWatcher.exists = true

        this._senders = {
            whatsapp: senders.whatsapp,
            sms: senders.sms
        }

        this._sending = {
            whatsapp: false,
            sms: false
        }

        logger.info('Message watcher started...')
        setInterval(this.process.bind(this), INTERVAL)
    }

    _verifiableMessengers() {
        return ['whatsapp']
    }

    async _toNextMessengerGroup() {
        let unVerifiedMessages = await Message.find({
            was_sent: true,
            messenger: {$in: this._verifiableMessengers()},
            send_date: {$lte: expiredDate(VERIFYING_EXPIRATION)},
            verified: false
        })

        unVerifiedMessages = unVerifiedMessages.filter(message => {
            return message.main_messenger < message.messenger.length - 1;
        })

        await Promise.all(unVerifiedMessages.map(async (message) => {
            message.was_sent = false
            message.main_messenger++
            await message.save()
        }))

    }

    async process() {
        const messages = await Message.find({was_sent: false, creation_date: {$gte: expiredDate(EXPIRATION_DATE)}})

        await this._toNextMessengerGroup()

        const messagesGroups = [
            messages.filter(message => message.messenger[message.main_messenger] === 'whatsapp'),
            messages.filter(message => message.messenger[message.main_messenger] === 'sms'),
        ]
        await Promise.all([
            await this._send('whatsapp', messagesGroups[0]),
            await this._send('sms', messagesGroups[1])
        ])
    }

    async _send(sender, messages) {

        const sendHelper = this._senders[sender]
        if (!sendHelper) return

        if (this._sending[sender]) return
        this._sending[sender] = true

        for (let message of messages) {
            const result = await sendHelper.send(message.peer, message.message)
            if (result.success) {
                message.was_sent = true
                message.api_identifier = result.response.id || ""
                if (!(sender in this._verifiableMessengers())) {
                    message.sender = sender
                }
                message.save()
            }
            await pause(0.5)
        }

        this._sending[sender] = false
    }

}

module.exports = MessageWatcher