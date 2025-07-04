const mongoose = require("mongoose");

const rateService = require('../service/rate.service');

const getRate = async (req, res, next) => {
    try {

        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sort = { [sortField]: sortOrder };

        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);

        const { movie, user, score, date } = req.query

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

module.exports = { getRate }