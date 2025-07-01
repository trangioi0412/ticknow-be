const express = require('express');
const router = express.Router()

const movieControler = require('../controler/movies.controler');

router.get('/', movieControler.getMovies);

router.get('/filter', movieControler.filterMovie);

router.get('/schedue', movieControler.filterSChedule);

router.post('/add', movieControler.addMovie);

router.delete('/delete/:id', movieControler.deleteMovie);

router.patch('/update', movieControler.updateMovie);

router.get('/:id', movieControler.getDetailMovie);

module.exports = router