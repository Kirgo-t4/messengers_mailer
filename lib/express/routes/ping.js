const router = require('express').Router();


router.get('/', (req, res) => {
    res.json({
        access: true,
        error: false
    })
})



module.exports = router