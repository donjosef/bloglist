const mongoose = require('mongoose')
const Schema = mongoose.Schema
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        unique: true
    },
    name: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog'
        }
    ]
})

userSchema.set('toJSON',  {
    transform: (document, returnedObject) => {
       returnedObject.id = returnedObject._id.toString() 
       delete returnedObject._id
       delete returnedObject.__v
       delete returnedObject.password
    }
})

userSchema.plugin(uniqueValidator)

module.exports = mongoose.model('User', userSchema)