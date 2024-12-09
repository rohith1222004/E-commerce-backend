const express = require("express")
const router = express.Router()
const productController = require("../controllers/productController")
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware")
const upload = require("../middleware/uploadMiddleware")

router.get('/',productController.getProduct)
router.get('/:id', productController.getProduct)

router.post('/create',upload,productController.createProduct)

module.exports=router