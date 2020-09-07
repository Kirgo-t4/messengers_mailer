const mongoose = require('mongoose');


const MessageSchema = new mongoose.Schema({

    peer: {
        type: String,
        required: true
    },
    was_sent: {
        type: Boolean,
        default: false,
        set: function (v) {
            if (v) {
                this.send_date = new Date()
            }
            return v
        }
    },
    api_identifier: String,
    sent_time: Date,
    messenger: {
        type: [{
            type: String,
            enum: ["whatsapp", "sms"],
        }],
        validate: {
            validator: function (v) {
                return v.length
            },
            message: () => `No messenger specified`
        }
    },
    sender: {
        type: String,
        enum: ["whatsapp", "sms", ""],
        default: ""
    },
    main_messenger: {
        type: Number,
        default: 0
    },
    message: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    creation_date: Date,
    send_date: Date,
    uid: Number
})

MessageSchema.pre('save', function (next) {
    if (!this.creation_date) {
        this.creation_date = new Date()
    }
    next()
})


module.exports = mongoose.model('Message', MessageSchema);