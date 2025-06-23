const express = require('express');
const router = express.Router();

const genreControler = require('../controler/genres.controler');

router.get('/', genreControler.getGenres)

module.exports = router;