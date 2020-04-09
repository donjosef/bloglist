const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const initialBlogs = [
  {
    title: 'Title 1',
    author: 'Author 1',
    url: 'www.url.com',
    likes: 6
  },
  {
    title: 'Title 2',
    author: 'Author 2',
    url: 'www.url2.com',
    likes: 12
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})

  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()

  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()
})

describe('fetching blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /json/)
  })
  
  
  test('blog has a property named id', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach(blog => {
      expect(blog.id).toBeDefined()
    })
  })
})

describe('creation of new blog', () => {
  test('the number of posts increases after adding a new post', async () => {
    const blog = new Blog({
      title: 'test title',
      author: 'Author test',
      url: 'www.test.com',
      likes: 19
    })
  
    await api.post('/api/blogs').send(blog)
    const response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(initialBlogs.length + 1)
  })
  
  test('the content of blog post is saved correctly', async () => {
    const blog = new Blog({
      title: 'test title',
      author: 'Author test',
      url: 'www.test.com',
      likes: 19
    })
  
    const response = await api
      .post('/api/blogs')
      .send(blog)
  
    expect(response.body.title).toBe('test title')
  })
  
  test('blog without likes is defaulted to 0', async () => {
    const blog = new Blog({
      title: 'test title',
      author: 'Author test',
      url: 'www.test.com'
    })
  
    const response = await api
      .post('/api/blogs')
      .send(blog)
  
    expect(response.body.likes).toBe(0)
  })
  
  test('blog without title or url is not added', async () => {
    const newBlog = {
      title: '',
      author: 'jack sparrow',
      url: '',
      likes: 9
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  
    const response = await api.get('/api/blogs')
  
    expect(response.body).toHaveLength(initialBlogs.length)
  })
})

describe('deletion of blog', () => {
  test('succeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToDelete = blogsAtStart.body[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await api.get('/api/blogs')
    expect(blogsAtEnd.body).toHaveLength(blogsAtStart.body.length - 1)
  })

  test('fails with status code 404 if no blog is found', async () => {
    const blog = new Blog(initialBlogs[0])
    await blog.save()
    await blog.remove()

    const nonExistingId = blog._id.toString()

    await api
      .delete(`/api/blogs/${nonExistingId}`)
      .expect(404)

    const blogsAtEnd = await api.get('/api/blogs')
    expect(blogsAtEnd.body).toHaveLength(initialBlogs.length)
  })

})

describe('updating a blog', () => {
  test('blog likes can be updated', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToUpdate = blogsAtStart.body[0]

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({...blogToUpdate, likes: 7})
      .expect(200)

    const blogsAtEnd = await api.get('/api/blogs')
    expect(blogsAtEnd.body[0].likes).toBe(7)
  })
})

afterAll(() => {
  mongoose.connection.close()
})