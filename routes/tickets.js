const express = require('express');
const router = express.Router();

const ticketControler = require('../controler/ticket.controler');

router.get('/', ticketControler.getTickets)

module.exports = router;