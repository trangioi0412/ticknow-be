const express = require('express');
const router = express.Router();

const userControler = require('../controler/users.controler');

router.get('/', userControler.getAllUsers);

module.exports = router;