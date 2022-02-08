//Samuel Baldock
//User model and schema
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

// Defining all elements each user will have
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) { //Checking email is valid using validate
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) { //Checking that password doesn't contain 'password'
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) { //Checking age is positive using validate
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    admin: {
        //THIS ALLOWS TWO ACCOUNT TYPED
        //if true = instructor
        type: Boolean,
        default: false
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId 
        //Every student is avlid existing student
        // Array will be empty if not an instructor
    }],
    completed_tricks: {
        type: Number,
        required: false,
        default: -1,
    },
    official: {
        type: Boolean,
        default: false,
        //Defaults as not authorised
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
    //Shows the connection between user and tasks
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

//Gives authentication token to user
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'thisismysnowgress')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

//Checks a user exists with t=credentials for login
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User