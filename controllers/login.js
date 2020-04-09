const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const express = require('express')
const User = require('../models/user')

const loginRouter = express.Router()

loginRouter.post('/', async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.body.username })
        if (!user) {
            // return res.status(401).json({error: 'invalid username'})
            const error = new Error('invalid username')
            error.name = 'AuthorizationError'
            throw error
        }

        const isEqual = await bcrypt.compare(req.body.password, user.password)
        if(!isEqual) {
            const error = new Error('invalid password')
            error.name = 'AuthorizationError'
            throw error
        }

        const token = jwt.sign({username: user.username, id: user._id}, process.env.JWT_SECRET)

        res.status(200).json({token, username: user.username, name: user.name})

    } catch (err) {
        next(err)
    }

})

module.exports = loginRouter