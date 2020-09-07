const dotenv = require('dotenv');
dotenv.config();
const bcrypt = require('bcrypt');

const mongoose = require("mongoose");

const User = require('./lib/auth/UserModel');


(async function () {
    try {
        await mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
        console.log('mongo connected')

        const login = process.argv[2]
        const password = process.argv[3]

        if (!login || !password) {
            console.log('usage addUser.js login password')
            return
        }

        const hashKey = await bcrypt.hash(password, 10)
        const user = new User({
            login, password: hashKey
        })

        await user.save()

        console.log(`User ${login} saved`)

    } catch (e) {
        console.log(e)
    } finally {
        await mongoose.disconnect()
    }
}())


