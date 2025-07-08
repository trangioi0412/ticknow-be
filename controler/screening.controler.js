
const check = require('../utils/checkDateQuery');


const screeningService = require('../service/screening.service');

const getScreeings = async (req, res, next) => {
    try {
        let filter = {};

        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sort = { [sortField]: sortOrder };

        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const { status, date, showtype, timeStart, timeEnd, room, movie } = req.query

        if (status) {
            const statusArray = Array.isArray(status) ? status.map(s => Number(s)) : status.split(',').map(sta => Number(sta.trim()));
            filter.status = { $in: statusArray }
        }

        if (date) {
            const dateArray = Array.isArray(date)
                ? date
                : date.split(',').map(day => day.trim());

            const orConditions = dateArray.map(day => {
                const start = new Date(day);
                start.setHours(0, 0, 0, 0);

                const end = new Date(start);
                end.setHours(23, 59, 59, 999);

                return {
                    date: { $gte: start, $lte: end }
                };
            });

            filter.$or = orConditions;

        }

        if (showtype) {
            const showtypeArray = Array.isArray(showtype) ? showtype.map(s => Number(s)) : showtype.split(',').map(sta => Number(sta.trim()));
            filter.showtype = { $in: showtypeArray }
        }

        if(timeStart){
            filter.time_start = { $gte: timeStart }
        }

        if(timeEnd){
            filter.time_end = { $lte: timeEnd }
        }

        if (movie) {
            const movieArray = Array.isArray(movie) ? movie : movie.split(',').map(id => id.trim())
            filter.id_movie = { $in: movieArray };
        }

        if (room) {
            const roomArray = Array.isArray(room) ? room : room.split(',').map(id => id.trim())
            filter.id_room = { $in: roomArray };
        }

        const screenings = await screeningService.getScreeings(filter, page, limit, sort);

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

        res.status(200).json({ data: result, status: true, message: "Thêm suất chiếu thành công" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

const updateSceening = async (req, res, next) => {
    try {

        const screening = req.body;

        const { id } = req.params;

        if (!id) {
            res.status(404).json({ status: false, message: " Vui lòng truyền id " })
        }

        const result = await screeningService.updateSceening(screening, id);

        if (!result) {
            return res.status(200).json({ status: true, message: 'Lấy dữ liệu thành công' })
        }

        res.status(200).json({ data: result, status: true, message: "Thêm suất chiếu thành công" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

module.exports = { getScreeings, filterScreening, ScreeningRoom, addSceening, updateSceening }