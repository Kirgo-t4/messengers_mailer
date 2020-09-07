const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');



const User = require('./UserModel')


const logger = require('../logger/logger')(module);

const makeJWT = (user_id) => {
    return jwt.sign({_id: user_id,}, process.env.TOKEN_SECRET, {expiresIn: "12h"})
}


module.exports = {

    async checkLoginPassword ({user, password}) {

        const userDoc = await User.findOne({login: user})


        if (!userDoc) return {
            message: "No such user found",
            error_code: 400
        }


        if (await bcrypt.compare(password.toString(), userDoc.password)) {

            return {
                result: makeJWT(userDoc.id),
                error_code: 0
            }
        } else {
            return {
                message: "Wrong user-password",
                error_code: 400
            }
        }

    }
}