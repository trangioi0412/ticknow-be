
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const CONNECT_DB = require('./config/database');

const corsOptionsDelegate = require('./middlewares/corsOption');
const { allowedOrigins } = require('./middlewares/corsOption');
const { notFoundHandler, generalErrorHandler } = require('./utils/errorHandler');

const { initTicketSocket } = require('./sockets/ticket.socket');

const app = express();
const server = http.createServer(app);

require('dotenv').config();

// socket
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  },
  transports: ["websocket", "polling"],
  path: "/socket.io"
});

initTicketSocket(io)



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

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  if (process.env.NODE_ENV === 'production') {
    console.log(`✅ Server đang chạy trên Render (port ${PORT})`);
  } else {
    console.log(`✅ Server local: http://localhost:${PORT}`);
  }
});


// Xử lý lỗi

app.use(notFoundHandler);
app.use(generalErrorHandler);

module.exports = app;

// cron-node
require('./cron/expireRates.job');
require('./cron/auto-update.job');
require('./cron/auto-cancelTicket');

app.get('/', function (req, res) {
  res.send('<h1>hello</h1>')

})

const { geminiApi } = require('./utils/gemini_api');

// Ví dụ chạy thử

(async () => {
  const comment = "phim vcl"
  const reply = await geminiApi(`
    Bạn là hệ thống kiểm duyệt. Hãy phân loại comment sau:
    "${comment}"
    Trả về JSON với cấu trúc: { "is_active": 3 } nếu bình thường,
    hoặc { "is_active": 4, "reason": "lý do" } nếu phản cảm/thô tục.
    `);
  const text = JSON.parse(reply
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim()
  );
  console.log(text);
  // const text = reply.response.text();
})();
