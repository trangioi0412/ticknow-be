const express = require('express');
const router = express.Router();

const rateControler = require('../controler/rates.controler');

router.get('/', rateControler.getRate);

router.post('/update-rate', rateControler.rate);

router.get('/movie/:id', rateControler.rateByMovie);

module.exports = router;