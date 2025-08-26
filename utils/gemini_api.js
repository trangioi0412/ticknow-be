const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config()

const genAI = new GoogleGenerativeAI(process.env.API_KEY_GEMINI);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function geminiApi(message) {
  try {
    const prompt = `${message}`;
    const result = await model.generateContent(prompt);

    const response = result.response.text();
    return response;
  } catch (error) {
    console.error("Lỗi gọi Gemini API:", error.message);
    return "Có lỗi xảy ra khi gọi Gemini API";
  }
}

async function geminiChatbox(message) {
  const prompt = `
      Bạn là một AI Assistant chuyên phân tích yêu cầu của khách hàng.
      Nhiệm vụ của bạn là:
      1. Hiểu ý định (intent) của khách hàng: ví dụ "book_ticket", "find_movie", "recommend_movie".
      2. Trích xuất các thông tin cần thiết (entities) từ yêu cầu của khách hàng:
         - movie_name
         - location: 
         - date:
         - time:
         - tickets
         - genre: trả về thể loại
      3. Trả lời **chỉ duy nhất** bằng JSON theo format:
      {
        "intent": "...",
        "entities": {
          "movie_name": "...",
          "location": "...",
          "date": "...",
          "time": "...",
          "tickets": 0,
          "genre": "...",
        }
      }
      4. nếu khách hàng chào bạn thì bạn hãy chào lại và chỉ cần trả về 
        {
          message: lời chào của bạn đến khách hàng một cách thanh lịch, trang trọng, tên của rạp là TickNow và giống như một support.
        }
      5. Nếu người dùng hỏi "làm sao để đặt vé xem phim hoặc liên quan tới chưa biết cách đặt vé" thì trả về: 
        {
          message: "
            1️⃣ Đặt vé ngay  🎟️
            2️⃣ Xem danh sách phim đang chiếu 🎬
            3️⃣ Tìm lịch chiếu theo rạp 📍
            4️⃣ Xem chi tiết phim ℹ️
          "
        }
      6. Phim nào đang hot tuần này? hoặc phim nào đang hot trả về:
        + thêm một thuộc tính nằm trong entities là star: true và limit: 1;
        + nếu số lượng là nhiều thì vẫn star: true nhưng limit : 5
      ⚠️ Quy tắc bắt buộc:

      - Nếu không thể xác định rõ intent của người dùng → trả về:
      {
        "intent": "unknown",
        "entities": {}
      }
      - Không giải thích, không trả lời lan man, không đưa thông tin ngoài JSON.
      - Nếu thiếu thông tin → để giá trị rỗng ("") hoặc null.

      - Trường location trả về chỉ có địa chỉ ví dụ: "Thành phố Hồ Chí Minh" trả về Hồ Chí Minh

      -Trường Time trả về thời gian chi tiết nếu khách hàng ghi rõ còn nếu khách hàng ghi (sáng, trưa, tối):
        + trả về khoảng thời gian tương ứng với khách hàng yêu cầu ví dụ sáng: 08:00 - 12:00
        + nếu chiều thì trả về khoảng thời gian của buổi trưa

      - Trường "date" trả về ngày hiện tại là 2025/08/01.- Nếu người dùng nói "hôm nay hoặc nay" → trả về "2025/08/01".
        + Nếu người dùng nói "ngày mai hoặc mai" → trả về "2025/08/02".
        + Nếu người dùng nói "ngày kia hoặc kia" → trả về "2025/08/03".
        + Nếu người dùng nói thứ trong tuần (thứ 2, thứ 3, ...), hãy tính toán ngày tương ứng gần nhất và trả về đúng định dạng YYYY/MM/DD.
        + Nếu không có yêu cầu của người dùng thì không cần trả về 
      người dùng : ${message}
    `;

  const reply = await geminiApi(prompt);

  const cleaned = reply
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const output = JSON.parse(cleaned);

  return output;
}

module.exports = { geminiApi, geminiChatbox }