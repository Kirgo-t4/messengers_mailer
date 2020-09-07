const router = require('express').Router();

const Messages = require('../../message/MessageModel')

const REPORT_DELIVERED_STATUS = 'delivered'


router.post(`/${process.env.chat_api_webhook_url}`, (req, res) => {
    console.log('webhook', req.query, req.body)

    if (req.body.ack && req.body.ack instanceof Array) {
        req.body.ack.map(async (report) => {
            if (report.status !== REPORT_DELIVERED_STATUS) return
            const message = await Messages.findOne({api_identifier: report.id})
            if (!message) return
            if (report.status === REPORT_DELIVERED_STATUS) {
                message.sender = 'whatsapp'
                message.verified = true
                await message.save()
            }
        })
    }

    res.send('Information accept')
})



module.exports = router