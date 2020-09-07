const router = require('express').Router();

const authController = require('../../auth/AuthController');



router.post('/', async (req, res) => {

    const {user, password} = req.body

    if (user && password) {

        const result = await authController.checkLoginPassword({user, password})
        if (result.error_code) {
            res.status(result.error_code).json({
                message: result.message,
                err: true,
                tag: result.tag
            })
        } else {
            res.status(200).json({
                result: result.result,
                err: false
            })
        }
    } else {
        res.status(400).json({
            message: "Wrong parameters",
            err: true
        })
    }


})


module.exports = router

