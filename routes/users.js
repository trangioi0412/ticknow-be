const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middlewares/isAdmin')

const userControler = require('../controler/users.controler');

router.get('/', isAdmin ,userControler.getAllUsers);

router.post('/login', userControler.login);

router.post('/register', userControler.register);

module.exports = router;