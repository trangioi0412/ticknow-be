
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const CONNECT_DB = require('./config/database');

const corsOptionsDelegate = require('./middlewares/corsOption');
const { notFoundHandler, generalErrorHandler } = require('./utils/errorHandler');

const app = express();
require('dotenv').config()

// connect Mongo DB
CONNECT_DB();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// middlewares
app.use(cors(corsOptionsDelegate));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Router
const router = require('./routes');
app.use('/', router);
app.use(express.json());

// port

const APP_HOST = process.env.APP_HOST
const APP_PORT = process.env.APP_PORT || 5000

app.listen(APP_PORT, () => {
  console.log(`✅ Server đang chạy tại http://${APP_HOST}:${APP_PORT}`);
});

// Xử lý lỗi

app.use(notFoundHandler);
app.use(generalErrorHandler);

module.exports = app;

// cron-node
require('./cron/expireRates.job');


app.get('/', function (req, res) {
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

