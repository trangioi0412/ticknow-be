const express = require('express');
const router = express.Router();

const CinemaControler = require('../controler/cinemas.controler');

router.get('/', CinemaControler.getCinema);

module.exports = router;
