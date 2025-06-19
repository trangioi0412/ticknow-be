const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.send('<h1>Hello cac ban nha</h1>');
});

router.use('/cinema', require('./cinemas'));

router.use('/location', require('./locations'));

router.use('/genre', require('./genres'));

router.use('/movie', require('./movies'));

router.use('/payMethod', require('./payMethods'));

router.use('/post', require('./posts'));

router.use('/rate', require('./rates'));

router.use('/room', require('./rooms'));

router.use('/screening', require('./screenings'));

router.use('/ticket', require('./tickets'));

router.use('/transition', require('./transitions'));

router.use('/user', require('./users'));

router.use('/voucher', require('./vouchers'));


module.exports = router;
