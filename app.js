
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
require('./cron/auto-remind');

app.get('/', function (req, res) {
  res.send('<h1>hello</h1>')

})

// const { geminiApi } = require('./utils/gemini_api')
// async function chatBox(message) {

//   const prompt = `
//       Bạn là một AI Assistant chuyên phân tích yêu cầu của khách hàng.
//       Nhiệm vụ của bạn là:
//       1. Hiểu ý định (intent) của khách hàng: ví dụ "book_ticket", "find_movie", "recommend_movie".
//       2. Trích xuất các thông tin cần thiết (entities) từ yêu cầu của khách hàng:
//          - movie_name
//          - location: 
//          - date:
//          - time:
//          - tickets
//          - genre: trả về thể loại
//       3. Trả lời **chỉ duy nhất** bằng JSON theo format:
//       {
//         "intent": "...",
//         "entities": {
//           "movie_name": "...",
//           "location": "...",
//           "date": "...",
//           "time": "...",
//           "tickets": 0,
//           "genre": "...",
//         }
//       }
//       4. nếu khách hàng chào bạn thì bạn hãy chào lại và chỉ cần trả về 
//         {
//           message: lời chào của bạn đến khách hàng một cách thanh lịch, trang trọng, tên của rạp là TickNow và giống như một support.
//         }

//       ⚠️ Quy tắc bắt buộc:
//       - Nếu người dùng muốn tìm phim thì hỏi ngược lại người dùng chi tiết: trả về 
//       {
//         "intent": "detail",
//         "message" : "Câu hỏi chi tiết người dùng"
//       }
//       - Nếu không thể xác định rõ intent của người dùng → trả về:
//       {
//         "intent": "unknown",
//         "entities": {}
//       }
//       - Không giải thích, không trả lời lan man, không đưa thông tin ngoài JSON.
//       - Nếu thiếu thông tin → để giá trị rỗng ("") hoặc null.

//       - Trường location trả về chỉ có địa chỉ ví dụ: "Thành phố Hồ Chí Minh" trả về Hồ Chí Minh

//       -Trường Time trả về thời gian chi tiết nếu khách hàng ghi rõ còn nếu khách hàng ghi (sáng, trưa, tối):
//         + trả về khoảng thời gian tương ứng với khách hàng yêu cầu ví dụ sáng: 08:00 - 12:00
//         + nếu chiều thì trả về khoảng thời gian của buổi trưa

//       - Trường "date" luôn phải trả về ngày hiện tại là 2025/08/24.- Nếu người dùng nói "hôm nay" → trả về "2025/08/1".
//         + Nếu người dùng nói "ngày mai" → trả về "2025/08/2".
//         + Nếu người dùng nói "ngày kia" → trả về "2025/08/3".
//         + Nếu người dùng nói thứ trong tuần (thứ 2, thứ 3, ...), hãy tính toán ngày tương ứng gần nhất và trả về đúng định dạng YYYY/MM/DD.

//       người dùng : ${message}
//   `;

//   const reply = await geminiApi(prompt);
//   console.log(reply);
// }

// chatBox('tôi muốn coi phim vào chiều ngày mai');