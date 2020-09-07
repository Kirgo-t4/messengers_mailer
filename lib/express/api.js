const router = require('express').Router();

const authRouter = require('./routes/auth')
const messageRouter = require('./routes/message')
const webhookRouter = require('./routes/wawebhook')
const VerifyToken = require('./verifyToken')
const logger = require('../logger/logger')(module)

const logRequest = (req, res, next) => {
    logger.debug(
        `request:${req.originalUrl}, body:[${Object.keys(req.body).reduce((str, key) => str + `${key}: ${req.body[key]}, `, '')}], jwt:${req.header('auth-token')}`
    )
    next()
}

router.use('/message', logRequest, new VerifyToken().verify(), messageRouter)
router.use('/wawebhook', logRequest, webhookRouter)
router.use('/auth', logRequest, authRouter);



module.exports = router