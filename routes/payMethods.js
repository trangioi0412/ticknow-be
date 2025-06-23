const express = require('express');
const router = express.Router();

const payMethodControler = require('../controler/payMethods.controler');

router.get('/', payMethodControler.getPayMethod)

module.exports = router;