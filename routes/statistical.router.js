const express = require('express');
const router = express.Router();

const statisticalControler =  require('../controler/statistical.controler');

router.get('/revenue', statisticalControler.revenue)

router.get('/revenueYear', statisticalControler.revenueYear)

router.get('/newUser', statisticalControler.revenueUser)

router.get('/cinema', statisticalControler.revenueCinema)

router.get('/movieDay', statisticalControler.revenueCinemaDay)

module.exports = router