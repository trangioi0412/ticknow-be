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

module.exports = { geminiApi }