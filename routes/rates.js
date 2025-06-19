const express = require('express');
const router = express.Router();

const rateControler = require('../controler/rates.controler');

router.get('/', async (req, res, next) => {
    try {
        const rates = await rateControler.getRate();
        if(rates){
            return res.status(200).json({ data: rates ,status: true, message: "Lấy dữ liệu thành công"})
        }else{
            return res.status(404).json({status: false, message: "lấy dữ liệu không thành công"});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: false, message: `Lấy dữ liệu khoogn thành công: ${error.message}`})
    }
})

module.exports = router;