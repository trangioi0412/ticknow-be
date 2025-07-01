const roomService = require('../service/room.service');

const getRooms = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);

        const result = await roomService.getAll(page, limit);

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

        res.status(200).json({ status: true, message: "Thêm phòng chiếu thành công" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

const updateRoom = async (req, res, next) => {
    try {

        const room = req.body;

        const result = await roomService.updateRoom(room);

        if (!result) {
            return res.status(200).json({ status: true, message: 'Lấy dữ liệu thành công' })
        }

        res.status(200).json({ status: true, message: "sửa phòng chiếu thành công" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

const roomId = async (req, res, next) => {
    try {
        const { id } = req.params
        const result = await roomService.roomById(id);

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


