
const check = require('../utils/checkDateQuery');


const screeningService = require('../service/screening.service');

const getScreeings = async (req, res, next) => {
    try {
        let filter = {};

        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const screenings = await screeningService.getScreeings(filter, page, limit);

        if (screenings) {
            return res.status(200).json({ data: screenings, status: true, message: 'Lấy dữ liệu thành công' })
        } else {
            return res.status(404).json({ status: false, message: 'Lấy dữ liêu không thành công' })
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Lấy dữ liệu không thành công' })
    }
}

const filterScreening = async (req, res, next) => {
    try {
        const { date } = req.query;

        let filter = {};

        if (date) filter.date = check.checkDate(date);

        const screenings = await screeningService.getScreeningFilter(filter);

        if (screenings) {
            return res.status(200).json({ data: screenings, status: true, message: 'Lấy dữ liệu thành công' })
        } else {
            return res.status(404).json({ status: false, message: 'Lấy dữ liêu không thành công' })
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Lấy dữ liệu không thành công' })
    }
}

const ScreeningRoom = async (req, res, next) => {
    try {
        const { id } = req.params;

        const screenings = await screeningService.screeningRoom(id);

        if (!screenings) {
            return res.status(404).json({ status: false, message: 'Lấy dữ liêu không thành công' })
        }

        return res.status(200).json({ data: screenings, status: true, message: 'Lấy dữ liệu thành công' })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Lấy dữ liệu không thành công' })
    }
}

const addSceening = async (req, res, next) => {
    try {

        const screening = req.body;

        const result = await screeningService.addSceening(screening);

        if (!result) {
            return res.status(200).json({ status: true, message: 'Lấy dữ liệu thành công' })
        }

        res.status(200).json({ status: true, message: "Thêm suất chiếu thành công" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}


const updateSceening = async (req, res, next) => {
    try {

        const screening = req.body;

        const { id } = req.params;

        if (id) {
            res.status(404).json({ status: false, message: " Vui lòng truyền id " })
        }

        const result = await screeningService.updateSceening(screening, id);

        if (!result) {
            return res.status(200).json({ status: true, message: 'Lấy dữ liệu thành công' })
        }

        res.status(200).json({ status: true, message: "Thêm suất chiếu thành công" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

module.exports = { getScreeings, filterScreening, ScreeningRoom, addSceening, updateSceening }