const express = require('express');
const router = express.Router();

const CinemaControler = require('../controler/cinemas.controler');

router.get('/', async function(req, res, next){
    try{
        const { locationId } =  req.query;
        let cinemas = [];


        if(locationId){
            cinemas = [...await CinemaControler.getCinemaLocation(locationId)];
        }else{
            cinemas = [...await CinemaControler.getCinema()];
        }


        if(cinemas){
            return res.status(200).json({ data: cinemas ,status: true, message: "Lấy dữ liệu thành công"})
        }else{
            return res.status(404).json({status: false, message: "Không thể lấy dữ liệu trên server"})
        }
    }catch(error){
        console.error(error);
        return res.status(500).json({status: false, message: 'Lỗi lấy dữ liệu'})
    }
})

module.exports = router;
