const express = require('express');
const router = express.Router();

const genreControler = require('../controler/genres.controler');

router.get('/', async (req, res, next) => {
    try{
        const genres = await genreControler.getGenres();
        if(genres){
            return res.status(200).json({ data: genres, status: true, message: 'lấy dữ liệu thành công'})
        }else{
            return res.status(404).json({status: false, message: 'Lấy dữ liệu không thành công'})
        }
    }catch(error){
        console.error(error);
        return res.status(500).json({status: false, message: 'Lỗi lấy dữ liệu của thể loại'});
    }
})

module.exports = router;