const User = require('../models/userSchema')

const getUsers = async(req, res) => {
    const users = await User.find()
    return res.status(200).send(users);
}

module.exports = {
    getUsers
}