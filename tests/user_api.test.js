const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

const initialUsers = [
    {
        username: 'username1',
        name: 'name1',
        password: '1111',
    },
    {
        username: 'username2',
        name: 'name2',
        password: '2222',
    }
]

beforeEach(async () => {
    await User.deleteMany({})

    let userObject = new User(initialUsers[0])
    await userObject.save()

    userObject = new User(initialUsers[1])
    await userObject.save()
})

describe('creation of new user', () => {
    test('fails if user doesnt have username or password', async () => {
        const user = {
            username: '',
            name: 'name3',
            password: ''
        }

        await api
            .post('/api/users')
            .send(user)
            .expect(400)

        const response = await api.get('/api/users')
        expect(response.body).toHaveLength(initialUsers.length)
    })

    test('fails if user or password are less than 3 characters', async () => {
        const user = {
            username: 'ab',
            name: 'george',
            password: '11'
        }

        await api
            .post('/api/users')
            .send(user)
            .expect(400)

        const response = await api.get('/api/users')
        expect(response.body).toHaveLength(initialUsers.length)
    })

    test('fails if username already exists', async () => {
        const user = {
            username: 'username1',
            name: 'george',
            password: '1122'
        }

        await api
            .post('/api/users')
            .send(user)
            .expect(400)

        const response = await api.get('/api/users')
        expect(response.body).toHaveLength(initialUsers.length)
    })
})

afterAll(() => {
    mongoose.connection.close()
})