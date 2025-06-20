const express = require('express');
const router = express.Router();



const postControler = require('../controler/post.controler');

router.get( '/', async (req, res, next) => {
    try {
        const posts = await postControler.getPosts();
        if(posts){
            return res.status(200).json({data: posts, status: true, message: 'Lấy dữ liệu thành công'})
        }else{
            return res.status(404).json({status: false, message: 'Lấy dữ liệu không thành công'});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: false, message: error.message});
    }
} )

module.exports = router;