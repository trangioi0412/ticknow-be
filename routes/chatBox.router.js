const express = require('express');
const router = express.Router();

const chatBoxControler = require('../controler/chatBox.controler');

router.post('/', chatBoxControler.chat);

module.exports = router;
