const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const blogController = require('./controllers/blog')
const userController = require('./controllers/user')
const loginController = require('./controllers/login')
const logger = require('./utils/logger')
const {MONGODB_URI} = require('./utils/config')
const errorMiddleware = require('./middleware/errorMiddleware')

const app = express()

mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        logger.info('Connection with mongoose db established')
    })
    .catch(err => {
        logger.error('Mongoose connection failed', err.message)
    })

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogController)

app.use('/api/users', userController)

app.use('/api/login', loginController)

if(process.env.NODE_ENV === 'test') {
    const resetTestController = require('./controllers/reset_test')
    app.use('/api/testing', resetTestController)
}

app.use(errorMiddleware)

module.exports = app