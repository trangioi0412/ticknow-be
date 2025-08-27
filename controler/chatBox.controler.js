const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const chatBoxService = require('../service/chatBox.service');

const { geminiChatbox } = require('../utils/gemini_api');


const chat = async (req, res, next) => {
    try {
        let { message } = req.body;

        const ask = await geminiChatbox(message);

        if (ask.message) {
            return res.status(200).json({ status: true, data: { role: "bot", message: ask.message } })
        }

        let movie = [], cinema = [];

        console.log(ask)

        switch (ask.intent) {
            case "cinema":
                cinema = await chatBoxService.findLocationAggregate(ask.entities);
                if(cinema.length <= 0 ){
                    ask.entities.message = `Xin lỗi quý khách!! Hiện tại Ticknow chưa phát triển tại ${ask.entities.location}. 😢😢`
                }
                break;

            case "movie":
                movie = await chatBoxService.findMoviesAggregate(ask.entities);
                if(movie.length <= 0 ){
                    ask.entities.message = `Xin lỗi quý khách!! Hiện tại phim đang mong chờ không có suất chiếu hoặc chưa có trên hệ thống . 😢😢`
                }
                break;

            default:

        }


        return res.status(200).json({ status: true, data: { role: "bot", data: { movie, cinema }, message: [`${ask.entities.message}`] } })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

module.exports = { chat }
