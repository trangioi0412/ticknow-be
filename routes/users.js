const express = require('express');
const router = express.Router();

const { isAdmin } = require('../middlewares/isAdmin')

const userControler = require('../controler/users.controler');

router.get('/', userControler.getAllUsers);

router.post('/login', userControler.login);

router.post('/register', userControler.register);

router.patch('/update/:id', userControler.updateUser);

router.post('/info', userControler.getDetail);

module.exports = router;