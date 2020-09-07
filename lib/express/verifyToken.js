
const jwt = require('jsonwebtoken');

const User = require('../auth/UserModel');

const logger = require('../logger/logger')(module);



class VerifyUserToken {

    get_token(req) {
        return req.header('auth-token')
    }

    verify() {
        return async (req, res, next) => {
            const token = this.get_token(req)

            if (!token) {
                logger.warn(`request:${req.originalUrl} without authorization token`)
                res.status(403).json({
                    message: "token required",
                    err: true
                })
                return
            }

            try {
                const verified = jwt.verify(token, process.env.TOKEN_SECRET)
                try {
                    const user = await User.findById(verified._id)

                    if (!user) {
                        logger.warn(`request:${req.originalUrl}. No such user with id built in jwt token found`)
                        res.status(403).json({
                            message: "JWT Error, No such user found",
                            err: true
                        })
                        return
                    }

                } catch (e) {
                    logger.warn('Authorization failed no such user found')
                    res.status(403).json({
                        message: "No such user found",
                        err: true
                    })
                    return
                }

            } catch (e) {
                logger.warn(e.message)
                res.status(403).json({
                    message: e.message,
                    err: true
                })
                return
            }
            next()
        }
    }

}



module.exports = VerifyUserToken