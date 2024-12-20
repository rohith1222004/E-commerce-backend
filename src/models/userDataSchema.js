const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userDataSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
    },
})

module.exports = mongoose.model('UserData', userDataSchema);