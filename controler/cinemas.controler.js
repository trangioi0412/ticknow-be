const cinemaService = require('../service/cinema.service')

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const getCinema = async (req, res, next) => {
    try {
        
        const limit = parseInt(req.query.limit);

        const page = parseInt(req.query.page);

        const result = await cinemaService.getCinema(page, limit);

        if (!result) {
            return res.status(404).json({ status: false, message: "Lấy dữ liệu thật bại" })
        }

        return res.status(200).json({ data: result, status: true, message: 'Lấy dữ liệu thành công' })


    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

module.exports = { getCinema }