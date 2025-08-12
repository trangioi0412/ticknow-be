const express = require('express');
const router = express.Router();

const getUploader = require('../middlewares/uploadFile');

const upload = getUploader()

const roomControler = require('../controler/room.controler');

router.get('/', roomControler.getRooms),

router.post('/roomempty', roomControler.getRoomScreening);

router.post('/add', upload.none(), roomControler.addRoom);

router.patch('/update/:id', upload.none(), roomControler.updateRoom);

router.get('/:id', roomControler.roomId);




module.exports = router;