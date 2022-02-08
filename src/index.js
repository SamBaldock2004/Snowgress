//Acts as the starer file
//Connect all the express functions and my models
//Connects them to the database

const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT || 3000

//Uses the public html files
app.use(express.static('public'))
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

//Displays the port the server launches on
app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

//Puts the user model to a variable
const Task = require('./models/task')
const User = require('./models/user')

//Testing for dev
const main = async () => {
    // const task = await Task.findById('5c2e505a3253e18a43e612e6')
    // await task.populate('owner').execPopulate()
    // console.log(task.owner)

    const user = await User.findById('5c2e4dcb5eac678a23725b5b')
    await user.populate('tasks').execPopulate()
    console.log(user.tasks)
}

main()