const express = require('express')
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')
const tokenExtractorMiddleware = require('../middleware/tokenExtractor')

const blogRouter = express.Router()

blogRouter.get('/', async (req, response) => {
    const blogs = await Blog.find({}).populate({ path: 'user', select: 'username name' })
    response.json(blogs.map(blog => blog.toJSON()))
})

blogRouter.post('/', tokenExtractorMiddleware, async (req, response, next) => {
    let blog;
    let decodedToken;

    try {
        decodedToken = jwt.verify(req.token, process.env.JWT_SECRET)
    } catch (err) {
        return next(err)
    }

    const user = await User.findById(decodedToken.id)

    if (!req.body.title || !req.body.url) {
        return response.status(400).send({ error: 'title or url missing' })
    }

    if (req.body.likes === undefined) {
        blog = new Blog({
            ...req.body,
            likes: 0,
            user: user._id
        })
    } else {
        blog = new Blog({
            ...req.body,
            user: user._id
        })
    }

    const savedBlog = await blog.save()
    const populatedBlog = await savedBlog.populate({path: 'user', select: 'username name'}).execPopulate()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(populatedBlog.toJSON())
})

blogRouter.post('/:id/comments', async (req, res, next) => {
    if(!req.body.comment || req.body.comment.length < 5) {
        const error = new Error('Comment must be at least 5 characters long')
        error.name = 'ValidationError'
        return next(error)
    }
    
    const blog = await Blog.findById(req.params.id)
    blog.comments = blog.comments.concat(req.body.comment)
    await blog.save()

    res.status(201).json(blog.toJSON())
})

blogRouter.delete('/:id', tokenExtractorMiddleware, async (req, res, next) => {
    let decodedToken;
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId)
    if(!blog) {
        return res.status(404).end()
    }

    try {
        decodedToken = jwt.verify(req.token, process.env.JWT_SECRET)
    } catch (err) {
        return next(err)
    }

    const loggedInuser = await User.findById(decodedToken.id)
    if(blog.user.toString() === loggedInuser._id.toString()) {
        await blog.delete()
        loggedInuser.blogs.pull(blogId) 
        await loggedInuser.save()
        res.status(204).end()
    } else {
        const err = new Error('Authorization error. Cannot delete this post')
        err.name = 'AuthorizationError'
        next(err)
    }

})

blogRouter.put('/:id', async (req, res) => {
    const updatedBlog = await Blog
    .findByIdAndUpdate(req.params.id, { likes: req.body.likes }, { new: true })
    .populate({path: 'user', select: 'username name'})
    
    if (!updatedBlog) {
        return res.status(404).end()
    }

    return res.status(200).json(updatedBlog.toJSON())
})

module.exports = blogRouter