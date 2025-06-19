const express = require('express');
const router = express.Router();

const screeningControler = require('../controler/screening.controler');

router.get('/', screeningControler.getScreeings);

router.get('/filter', screeningControler.filterScreening);

module.exports = router;