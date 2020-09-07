const dotenv = require('dotenv');
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");

const apiRouter  = require('./lib/express/api')

const MessageWatcher = require('./lib/loop/MessageWatcher')
const WhatsappHelper = require('./lib/whatsapp/ChatApiHelper')
const SMSHelper = require('./lib/sms/MTS')

const logger = require('./lib/logger/logger')(module);

const PORT = process.env.PORT || 3001;


const application = express();

application.use(express.json());
application.use('/api', apiRouter)



async function main() {
    try {
        await mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
        logger.info("Mongo Connected");

        new MessageWatcher({
            whatsapp: new WhatsappHelper({
                instance: process.env.chat_api_instance,
                token: process.env.chat_api_token
            }),
            sms: new SMSHelper({
                api_key: process.env.sms_mts_api_id
            })
        })

        application.listen(PORT, console.log(`Server started on port ${PORT}`));
    } catch (e) {
        logger.error(e.stack)
    }
    
    
}

main().then()