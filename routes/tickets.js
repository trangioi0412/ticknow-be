const express = require('express');
const router = express.Router();

const ticketControler = require('../controler/ticket.controler');

router.get('/', ticketControler.getTickets);

router.post('/add', ticketControler.addTicket);

module.exports = router;