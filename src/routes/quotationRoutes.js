const express = require("express")
const router = express.Router()
const quotationController = require("../controllers/quotationContoller")

router.get('/',quotationController.generateQuotation)


module.exports= router