const express = require('express');
const router = express.Router();

const voucherControler = require('../controler/vouchers.controler');

router.get('/', voucherControler.getVouchers)

module.exports = router;