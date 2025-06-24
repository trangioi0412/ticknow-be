const express = require('express');
const router = express.Router()

const movieControler = require('../controler/movies.controler');

router.get('/', movieControler.getMovies);

router.get('/filter', movieControler.filterMovie);

router.get('/:id', movieControler.getDetailMovie);

module.exports = router