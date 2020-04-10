const tokenExtractor = (req, res, next) => {
    const authHeader = req.get('Authorization')
    
    if (req.method !== 'GET' && !authHeader) {
        const error = new Error('Authorization header missing')
        error.name = 'AuthorizationError'
        return next(error)
    }
    
    if(authHeader) {
        const token = authHeader.split(' ')[1]
        if(token) {
            req.token = token
        }
    }

    next()
}

module.exports = tokenExtractor