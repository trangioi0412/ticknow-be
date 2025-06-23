const express = require('express');
const router = express.Router()

const locationControler = require('../controler/locations.conteoler');

router.get('/', locationControler.getLocation)

module.exports = router