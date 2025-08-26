const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const chatBoxService = require('../service/chatBox.service');

const { geminiChatbox } = require('../utils/gemini_api');


const chat = async (req, res, next) => {
    try {
        let { message } = req.body;
        
        const ask = await geminiChatbox(message);
        
        if(ask.message){
            return res.status(200).json({ status: true, data : {role: "bot", message: ask.message }})
        }

        const result = await chatBoxService.findMoviesAggregate(ask.entities);

        return res.status(200).json({ status: true, data : {role: "bot", data: result }})
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

module.exports = { chat }
