const express = require('express');
const router = express.Router();

const voucherControler = require('../controler/vouchers.controler');

router.get('/', async (req, res, next) => {
    try {
        const vouchers  = await voucherControler.getVouchers();
        if( vouchers ){
            return res.status(200).json({ data: vouchers , status: true, message: 'Lấy dữ liệu thành công'})
        }else{
            return res.status(404).json({ status: false, message: 'Lấy dữ liêu không thành công' })
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: false, message: 'Lấy dữ liệu không thành công'})
    }
})

module.exports = router;