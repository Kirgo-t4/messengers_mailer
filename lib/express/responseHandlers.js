const {Finder} = require('../common/RequestDataFinders');

const logger = require('../logger/logger')(module);


const responseHandlers = {
    APIHandler({paramChecker, finder, processor, responser, responserArgs}) {

        return async (req, res) => {

            if (paramChecker && typeof paramChecker === 'function') {
                const paramCheckResult = paramChecker(req)
                if (paramCheckResult && paramCheckResult.error_code) {
                    logger.error(`request: ${req.originalUrl},  message:${paramCheckResult.message}`)
                    res.status(400).json({
                        message: paramCheckResult.message,
                        err: true
                    })
                    return
                }
            }

            const data = finder instanceof Finder ? await finder.find(req) : {}

            const processors_ = processor instanceof Array ? processor : [processor]

            let result = {}
            for (let proc of processors_) {
                result = await proc.process(result.data || data , req);
                if (result.error_code) break;
            }

            result = result || {error_code: 500, message: "Unknown error"}

            if (responser && typeof responser === 'function') {
                await responser(req, res, result, responserArgs)
                return
            }

            if (result.error_code) {
                logger.error(`request: ${req.originalUrl}, status:(${result.error_code}) message:${result.message}`)
                res.status(result.error_code).json({
                    message: result.message,
                    err: true
                })
                return
            }
            res.status(200).json({
                result: result.result,
                err: false
            })
        }
    },
}

const safeResponseHandlers = new Proxy(responseHandlers, {
    get(target, prop) {
        // Добавляем к каждой функции-обработчику обработку ошибок
        if (typeof target[prop] === 'function') {
            const f = target[prop]
            return (...args) => {
                const callback = f(...args)

                return async (req, res, next) => {
                    try {
                        await callback(req, res, next)
                    } catch (e) {
                        logger.error(e.stack)
                        res.status(500).json({
                            message: e.message,
                            err: true
                        })
                    }
                }
            }
        }
        return target[prop]
    }
})


module.exports = safeResponseHandlers
