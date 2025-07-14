const express = require('express');
const router = express.Router();

const CinemaControler = require('../controler/cinemas.controler');

router.get('/', CinemaControler.getCinema);

router.post('/add', CinemaControler.addCinema);

router.patch('/update/:id', CinemaControler.updateCinema);

// router.delete('/delete/:id', CinemaControler.deleteCinema);

router.get('/:id', CinemaControler.getDetail)

module.exports = router;
