const express = require('express');
const router = express.Router();

const ticketControler = require('../controler/ticket.controler');

router.get('/', ticketControler.getTickets);

router.post('/add', ticketControler.addTicket);

router.get('/:id', ticketControler.getDetail);

module.exports = router;