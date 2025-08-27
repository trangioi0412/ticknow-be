const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config()

const genAI = new GoogleGenerativeAI(process.env.API_KEY_GEMINI);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

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
  const today = new Date().toISOString().split("T")[0];
  const prompt = `
      Bạn là một AI Assistant chuyên phân tích yêu cầu của khách hàng.
      Nhiệm vụ của bạn là:
      (*) phân tích bạn hãy làm rõ: người dùng yêu cầu location về nhu cầu thuộc phim thì intent là movie, còn không liên quan tới phim thì intent sẽ là cinema
      1. Hiểu ý định (intent) của khách hàng: ví dụ "movie", "cinema".
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
          "message": "ở đây 1 câu trả lời khách hàng theo yêu cầu của họ. ví dụ: đây là những bộ phim đang chiếu trong ngày hôm nay"
        },
      }
      4. nếu khách hàng chào bạn thì bạn hãy chào lại và chỉ cần trả về 
        {
          message: [ "lời chào của bạn đến khách hàng một cách thanh lịch, trang trọng, tên của rạp là TickNow và giống như một support" ].
        }
      5. Nếu người dùng hỏi "làm sao để đặt vé xem phim hoặc liên quan tới chưa biết cách đặt vé, cách đặt vé" thì trả về: 
        {
          message: [
            "Các bước mua vé:\n 1️⃣ Chọn phim 🎬\n 2️⃣ Tìm suất ℹ️\n 3️⃣ Chọn Ghế📍\n 4️⃣ Thanh toán 🎟️"
          ]
        }
      6. Phim nào đang hot tuần này? hoặc phim nào đang hot trả về:
        + thêm một thuộc tính nằm trong entities là star: true và limit: 1;
        + nếu số lượng là nhiều thì vẫn star: true nhưng limit : 5
      7. khi khách hàng muốn tìm hiểu một thứ gì đó liên quan tới chương trình khuyến mãi hay mã giảm giá thì trả về: 
        {
          message: [
            "Chương trình khuyến mãi thường diễn ra vào các dịp lễ lớn hoặc các ngày cuối tuần. Anh/chị có thể theo dõi tại trang <a href="https://ticknow.xyz/post">Chương trình khuyến mãi và mã giảm giá </a> để cập nhật thông tin sớm nhất nhé!!"
          ]
        }
      ⚠️ Quy tắc bắt buộc:
      - Nếu không thể xác định rõ intent của người dùng → trả về:
        {
          "intent": "unknown",
          "message": [
            "Xin lỗi😢! bạn có thể nói rõ hơn về nhu cầu của bạn không❤️❤️. ví dụ: bạn muốn xem phim gì 🎬, ở đâu 📍, thời gian nào🕛"
          ]
        }
      - Không giải thích, không trả lời lan man, không đưa thông tin ngoài JSON.
      - Nếu thiếu thông tin → để giá trị rỗng ("") hoặc null.

      - Trường location trả về chỉ có địa chỉ ví dụ: "Thành phố Hồ Chí Minh" trả về Hồ Chí Minh

      -Trường Time trả về thời gian chi tiết nếu khách hàng ghi rõ còn nếu khách hàng ghi (sáng, trưa, tối):
        + trả về khoảng thời gian tương ứng với khách hàng yêu cầu ví dụ sáng: 08:00 - 12:00
        + nếu chiều thì trả về khoảng thời gian của buổi trưa

      - Trường "date" chỉ trả về ngày nếu người dùng yêu cầu. Quy tắc:
        + Nếu người dùng nói "hôm nay" hoặc "nay" → trả về ngày hiện tại ${today};
        + Nếu nói "ngày mai" hoặc "mai" → trả về ngày hiện tại +1 ngày.
        + Nếu nói "ngày kia" hoặc "kia" → trả về ngày hiện tại +2 ngày.
        + Nếu nói thứ trong tuần (thứ 2, thứ 3, ..., chủ nhật) → trả về ngày gần nhất tương ứng
        + Nếu người dùng không đề cập đến thời gian → không trả về trường "date".
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