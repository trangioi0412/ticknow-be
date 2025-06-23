const express = require('express');
const router = express.Router();



const postControler = require('../controler/post.controler');

router.get( '/', postControler.getPosts)

module.exports = router;