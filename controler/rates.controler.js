const mongoose = require("mongoose");

const check = require('../utils/checkDateQuery');

const rateService = require('../service/rate.service');

const { verifyToken } = require('../utils/auth.util');

const getRate = async (req, res, next) => {
    try {

        const sortField = req.query.sortField || '_id';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sort = { [sortField]: sortOrder };

        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);

        const { movie, user, score, start_day, end_day } = req.query

        const filter = {}

        if (movie) {
            filter.id_movie = new mongoose.Types.ObjectId(movie);
        }

        if (user) {
            filter.id_user = new mongoose.Types.ObjectId(user);
        }

        if (score) {
            const parts = score.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));

            if (parts.length === 2) {
                const [min, max] = parts;
                filter.score = { $gte: min, $lte: max };
            } else if (parts.length === 1) {
                const value = parts[0];
                filter.score = { $gte: value, $lt: value + 1 };
            }
        }

        if (start_day || end_day) {
            filter.date = {};

            if (start_day) {
                const startDate = new Date(start_day);
                startDate.setHours(0, 0, 0, 0);
                filter.date.$gte = startDate;
            }

            if (end_day) {
                const endDate = new Date(end_day);
                endDate.setHours(23, 59, 59, 999);
                filter.date.$lte = endDate;
            }
        }

        const result = await rateService.getAll(filter, page, limit, sort);

        if (!result) {
            return res.status(404).json({ status: false, message: "Lấy dữ liệu thật bại" })
        }

        return res.status(200).json({ data: result, status: true, message: 'Lấy dữ liệu thành công' })

    } catch (error) {
        console.error(error.message)
        return res.status(500).json({ status: false, message: error.message })
    }
}

const rateByMovie = async (req, res, next) => {
    try {
        const { id } = req.params;

        const {page, limit} =  req.query

        const result = await rateService.getByIdMovie(id, page, limit);

        if (!result) {
            return res.status(404).json({ status: false, message: " Sửa Dữ Liệu Không Thành Công " })
        }

        return res.status(200).json({ data: result, status: true, message: " Sửa cinema Thành Công " })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: error.message });
    }
}

const rate = async (req, res, next) => {
    try {
        const data = req.body;

        const result = await rateService.updateRate(data);

        if (!result) {
            return res.status(404).json({ status: false, message: " Sửa Dữ Liệu Không Thành Công " })
        }

        return res.status(200).json({ data: result, status: true, message: " Sửa cinema Thành Công " })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: error.message });
    }
}

module.exports = { getRate, rate, rateByMovie }