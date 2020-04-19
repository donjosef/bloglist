const express = require('express')
const Blog = require('../models/blog')
const User = require('../models/user')

const resetTestRouter = express.Router()

resetTestRouter.post('/reset', async (req, res) => {
    await User.deleteMany({})
    await Blog.deleteMany({})

    res.status(204).end()
})

module.exports = resetTestRouter