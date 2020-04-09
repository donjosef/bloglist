const userRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')

userRouter.get('/', async (req, res) => {
    const users = await User.find().populate({path: 'blogs', select: '-user'})
    res.status(200).json(users.map(user => user.toJSON()))
})

userRouter.post('/', async (req, res, next) => {
    if(req.body.password.length < 3) {
        return res.status(400).json({error: 'Password must be longer than 3 characters'})
    }
    const hashedPwd = await bcrypt.hash(req.body.password, 12)

    const user = new User({
        username: req.body.username,
        name: req.body.name,
        password: hashedPwd
    })

    try {
        const savedUser = await user.save()
        res.status(201).json(savedUser.toJSON())
    } catch (err) {
        next(err)
    }
})

module.exports = userRouter