const {encryptAndStore, loginAndGenerateToken} = require("../utils/authUtils")

const register = async(req, res) =>{
    const {userName,email,password,role} = req.body
    const key = await encryptAndStore(userName,email,password,role)
    res.status(201).json({message: key});
}

const login = async(req, res) => {
    const {email,password} = req.body
    const token = await loginAndGenerateToken(email,password)
    if (token == "Invalid Token") {
        res.status(500).send({message:"Enter valid credentials"})
    }else{
        res.status(201).send({ token: token, message: 'User logged in successfully' });
    }
}


module.exports = {
    register,
    login
}