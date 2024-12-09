const express = require("express") 
const router = express.Router()
const authController = require('../controllers/authController')
const validateRegisterInput = require("../middleware/validate")

router.post('/register',validateRegisterInput,authController.register)
router.post('/login',authController.login)

module.exports = router