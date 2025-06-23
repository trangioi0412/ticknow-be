const express = require('express');
const router = express.Router();

const transitionControler = require('../controler/transition.controler');

router.get('/', transitionControler.getTransition)

module.exports = router;