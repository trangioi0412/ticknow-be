const express = require('express');
const router = express.Router();

const screeningControler = require('../controler/screening.controler');

const getUploader = require('../middlewares/uploadFile');

const upload = getUploader()

router.get('/', screeningControler.getScreeings);

router.get('/filter', screeningControler.filterScreening);

router.post('/add', upload.none(), screeningControler.addSceening);

router.patch('/update/:id', upload.none(), screeningControler.updateSceening);

router.get('/:id', screeningControler.ScreeningRoom);

module.exports = router;