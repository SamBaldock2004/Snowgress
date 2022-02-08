//This file contains all the router for the users
//These interact with the database allowing data to be:
//Added, deleted, updated and retrieved.

const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { findById } = require('../models/task')
const router = new express.Router()


//Create a user
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

//Add a completed trick to tally
router.patch('/users/:id', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id})

        if (!user) {
            return res.status(404).send()
        }
        console.log("0")
        user.completed_tricks = user.completed_tricks + 1
        console.log("1")
        user.official = true
        await user.save()
        res.send(user)
    } catch (e) {
        console.log("err")
        res.status(400).send(e)
    }
})

//User login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

//User logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//Admin logout all
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//Retrieve logged in user data
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

//Update user for profile page
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

//Delete user
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

//Get all instrcutor students details
router.get('/users', auth, async (req, res) => {
    var students = [] //Create a blank student array
    for (let i = 0; i< req.user.students.length; i++) { //Go through all students
        const student = await User.findOne({_id: req.user.students[i]})
        students.push(student) //Push student data onto the blank student array
    }
    console.log(students)
    res.send(students)
})

//Add a student to array
router.patch('/users', async (req, res) => {
    const student = req.body.result.user._id
    try {
        const user = await User.findOne({_id: req.body.instructor.instructor})
        user.students.push(student)
        if (!user) {
        return res.status(404).send()
        }
        await user.save()
        res.send(user)
       } catch (e) {
        res.status(400).send(e)
       }
    })



module.exports = router