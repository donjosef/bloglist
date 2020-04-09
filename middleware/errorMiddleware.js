const logger = require('../utils/logger')

const errorMiddleware = (err, req, res, next) => {
    logger.info('inside error middleware: ', err)
    if (err.name === 'ValidationError' || err.name === 'JsonWebTokenError') {
        return res.status(400).json({ error: err.message })
    } else if(err.name === 'AuthorizationError') {
        return res.status(401).json({ error: err.message })
    }

    next()
}

module.exports = errorMiddleware