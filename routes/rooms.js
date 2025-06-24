const express = require('express');
const router = express.Router();

const roomControler = require('../controler/room.controler');

router.get('/', roomControler.getRooms)

module.exports = router;