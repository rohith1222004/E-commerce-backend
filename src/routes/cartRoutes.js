const express = require('express')
const router = express.Router()
const cartController = require('../controllers/cartController.js')

router.get('/', cartController.getItems)
router.post('/add',cartController.addToCart)
router.post('/remove',cartController.removeFromCart)
router.get('/clear',cartController.clearCart)


module.exports = router