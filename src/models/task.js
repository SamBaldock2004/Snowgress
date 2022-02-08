// Samuel Baldock
// Task model
const mongoose = require('mongoose')

const Task = mongoose.model('Task', {
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    evidence: {
        type: String, //Must default or will be blank when created
        default: "No evidence uploaded"
    },
    comment: {
        type: String, //Must default or will be blank when created
        default: "No Comment Uploaded"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' //Referencing to the user moe=del/schema
    }
})

module.exports = Task