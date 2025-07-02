const express = require('express');
const router = express.Router();



const postControler = require('../controler/post.controler');

router.get( '/', postControler.getPosts);

router.post( '/add', postControler.addPoster);

router.patch( '/update/:id', postControler.updatePost);

router.delete( '/delete/:id', postControler.deletePost);



module.exports = router;