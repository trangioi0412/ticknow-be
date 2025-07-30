
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const CONNECT_DB = require('./config/database');

const corsOptionsDelegate = require('./middlewares/corsOption');
const { notFoundHandler, generalErrorHandler } = require('./utils/errorHandler');

const { initTicketSocket } = require('./sockets/ticket.socket');

const app = express();
const server = http.createServer(app);

require('dotenv').config();

// socket
const io = new Server(server, {
  cors: {
    origin: '*',
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

const APP_HOST = process.env.APP_HOST
const APP_PORT = process.env.APP_PORT || 5000

server.listen(APP_PORT, () => {
  console.log(`✅ Server đang chạy tại http://${APP_HOST}:${APP_PORT}`);
});


// Xử lý lỗi

app.use(notFoundHandler);
app.use(generalErrorHandler);

module.exports = app;

// cron-node
require('./cron/expireRates.job');
require('./cron/auto-update.job');

app.get('/', function (req, res) {
  res.send('<h1>hello</h1>')

})
