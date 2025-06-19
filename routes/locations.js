const express = require('express');
const router = express.Router()

const locationControler = require('../controler/locations.conteoler');

router.get('/', async (req,res,next) => {
    try{
        const locations = await locationControler.getLocation();
        console.log(locations);
        if(locations){
            return res.status(200).json({ data: locations ,status: true, message: 'Lấy dữ liệu thành công'})
        }else{
            return res.status(404).json({ status: false, message: 'Lấy dữ liệu thất bại' })
        }
    }catch(error){
        console.error(error);
        return res.status(500).json({status: false, message: 'Lấy dữ liệu location thất bại'})
    }
})

module.exports = router