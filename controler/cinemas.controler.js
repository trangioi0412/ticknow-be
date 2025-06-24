const check = require('../utils/checkDateQuery');

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

const getDetail = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { date } = req.query;

        const filter = {};

        if (date) filter.date = check.checkDate(date);

        let result = await cinemaService.cinemaDetail(id, filter);

        if (result) {

            return res.status(200).json({ data: result, status: true, message: 'Lấy dữ liệu thành công' })

        } else {

            return res.status(404).json({ status: false, message: 'Lấy dữ liệu thất bại' })

        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

module.exports = { getCinema, getDetail }