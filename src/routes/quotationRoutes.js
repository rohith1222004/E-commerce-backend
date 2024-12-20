const express = require("express")
const router = express.Router()
const quotationController = require("../controllers/quotationContoller")
const {getBasicDetails} = require("../middleware/getBasicDetailsMiddleware")


router.post('/:userId',quotationController.generateQuotation)
router.post('/',quotationController.test)



module.exports= router