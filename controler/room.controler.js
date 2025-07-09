const roomService = require('../service/room.service');

const getRooms = async (req, res, next) => {
    try {

        const sortField = req.query.sortField || '_id';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sort = { [sortField]: sortOrder };

        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);

        const { status, cinema } = req.query

        const filter = {};

        if (status) {
            const statusArray = Array.isArray(status) ? status.map(s => Number(s)) : status.split(',').map(sta => Number(sta.trim()));
            filter.status = { $in: statusArray }
        }

        if (cinema) {
            const locationArray = Array.isArray(cinema) ? cinema : cinema.split(',').map(id => id.trim())
            filter.id_cinema = { $in: locationArray };
        }

        const result = await roomService.getAll(filter, page, limit, sort);

        if (!result) {
            return res.status(404).json({ status: false, message: "Lấy dữ liệu thật bại" })
        }

        return res.status(200).json({ data: result, status: true, message: 'Lấy dữ liệu thành công' })

    } catch (error) {
        console.error(error.message)
        return res.status(500).json({ status: false, message: error.message })
    }
}

const addRoom = async (req, res, next) => {
    try {

        const room = req.body;

        const result = await roomService.addRoom(room);

        if (!result) {
            return res.status(200).json({ status: true, message: 'Lấy dữ liệu thành công' })
        }

        res.status(200).json({ data: result, status: true, message: "Thêm phòng chiếu thành công" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

const updateRoom = async (req, res, next) => {
    try {

        const room = req.body;
        const { id } = req.params;

        if (!id) {
            return res.status(404).json({ status: true, message: 'Vui Lòng truyền id room' })
        }
        const result = await roomService.updateRoom(room, id);

        if (!result) {
            return res.status(200).json({ status: true, message: 'Lấy dữ liệu thành công' })
        }

        res.status(200).json({ data: result, status: true, message: "sửa phòng chiếu thành công" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

const roomId = async (req, res, next) => {
    try {
        const { id } = req.params
        const result = await roomService.roomId(id);

        if (!result) {
            return res.status(404).json({ status: false, message: "Lấy dữ liệu thật bại" })
        }

        return res.status(200).json({ data: result, status: true, message: 'Lấy dữ liệu thành công' })

    } catch (error) {
        console.error(error.message)
        return res.status(500).json({ status: false, message: error.message })
    }
}

module.exports = { getRooms, addRoom, updateRoom, roomId };


