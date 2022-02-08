//This is the trick router
//Allows users to add, edit, retrieve and delete tricks from the database.

const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => { //Create trick
    const task = new Task({
        ...req.body,
        owner: req.user._id   //Two values assigned, others default
    })

    try {
        await task.save()
        console.log(task)
        res.status(201).send(task)
    } catch (e) {   //Catching occuring errors
        res.status(400).send(e)
    }
})

//Grt asll user tricks
router.get('/tasks', auth, async (req, res) => {
    try {
        await req.user.populate('tasks').execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

//Get all user tricks with specified ID
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    console.log(_id)

    try {
        const task = await Task.find({owner: _id })

        if (!task) {
            return res.status(404).send()
        }
        console.log(task)
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

//Get specififc trick with owner id and trick id
router.get('/tasks/:id1/:id2', auth, async (req, res) => {
    const _id1 = req.params.id1
    const _id2 = req.params.id2
    console.log(_id1)
    console.log(_id2)

    try {
        const task = await Task.find({owner: _id2 , _id: _id1})

        if (!task) {
            return res.status(404).send()
        }
        console.log(task)
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

//Edit trick with specified ID
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed','evidence']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

//Edit trick with specific owner id and trick id
router.patch('/tasks/:id1/:id2', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed', 'evidence','comment']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id1, owner: req.params.id2})

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

//delete specific trick with owner id and trick id
router.delete('/tasks/:id1/:id2', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id1, owner: req.params.id2 })

        if (!task) {
            res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

//create new trick with owner id
router.post('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    const task = new Task({
        ...req.body,
        owner: _id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

//Create new trick with owner id and description
router.post('/tasks/:id/:description', auth, async (req, res) => {
    const _id = req.params.id
    const description = req.params.description
    const task = new Task({
        description: description ,
        owner: _id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})
module.exports = router