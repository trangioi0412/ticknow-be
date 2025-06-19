const express = require('express');
const router = express.Router();

const payMethodControler = require('../controler/payMethods.controler');

router.get('/', async (req, res, next) => {
    try{
        const payMethods = await payMethodControler.getPayMethod();
        if(payMethods){
            res.status(200).json({ data: payMethods, status: true, message: "Lấy dữ liệu thành công"})
        }else{
            res.status(404).json({status:false, message: "Lỗi lấy dữ liệu từ server"});
        }
    }catch(error){
        console.error(error);
        return res.status(500).json({status: false, message: "Lỗi lấy dữ liệu từ server payMethod"});
    }
})

module.exports = router;