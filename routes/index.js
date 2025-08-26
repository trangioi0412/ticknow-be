const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
  res.send(`
  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TickNow API</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: #fff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        color: #333;
      }
      .container {
        text-align: center;
      }
      h1 {
        color: #FF3131;
        font-size: 48px;
        margin-bottom: 10px;
      }
      p {
        font-size: 20px;
        color: #666;
      }
      .tagline {
        background-color: #FF3131;
        color: white;
        padding: 8px 20px;
        border-radius: 30px;
        display: inline-block;
        margin-top: 20px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Chào mừng đến với TickNow API</h1>
      <p>Nền tảng quản lý đặt vé xem phim nhanh chóng và hiệu quả.</p>
      <div class="tagline">Cùng trải nghiệm tốc độ cùng TickNow!</div>
    </div>
  </body>
  </html>
`);
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

router.use('/vnpay', require('./vnpay.router'));

router.use('/momo', require('./momo.router'));

router.use('/payos', require('./payos.router'));

router.use('/contact', require('./contact.router'));

router.use('/statistical', require('./statistical.router'));

router.use('/chat', require('./chatBox.router'))


module.exports = router;
