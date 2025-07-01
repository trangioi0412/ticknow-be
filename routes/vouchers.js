const express = require('express');
const router = express.Router();

const voucherControler = require('../controler/vouchers.controler');

const getUploader = require('../middlewares/uploadFile');

const upload = getUploader()

router.get('/', voucherControler.getVouchers);

router.post('/add', upload.none(), voucherControler.addVoucher);

router.patch('/update', upload.none(), voucherControler.updateVoucher);

module.exports = router;