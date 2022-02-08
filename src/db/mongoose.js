//A database file that connects the npm mongoose
//This links it to the api and mongodb
const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/snow-tracker-api', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})