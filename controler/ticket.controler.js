const mongoose = require("mongoose");

const ticketService = require('../service/ticket.service');

const { verifyToken } = require('../utils/auth.util');

const getTickets = async (req, res, next) => {
    try {

        const sortField = req.query.sortField || '_id';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sort = { [sortField]: sortOrder };

        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const { screening, voucher, type, date, movieId } = req.query

        const filter = {};

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
                    updatedAt: { $gte: start, $lte: end }
                };
            });

            filter.$or = orConditions;

        }

        if (type) {
            const typeArray = Array.isArray(type) ? type.map(s => Number(s)) : type.split(',').map(sta => Number(sta.trim()));
            filter.type = { $in: typeArray }
        }

        if (screening) {
            const screeningArray = Array.isArray(screening) ? screening : screening.split(',').map(id => id.trim())
            filter.id_screening = { $in: screeningArray };
        }

        if (voucher) {
            const voucherArray = Array.isArray(voucher) ? voucher :     voucher.split(',').map(id => id.trim())
            filter.id_voucher = { $in: voucherArray };
        }

        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];

                const userId = await verifyToken(token);

                filter.id_user = new mongoose.Types.ObjectId(userId);

            } catch (err) {
                console.warn('Token không hợp lệ:', err.message);
            }
        }

        const tickets = await ticketService.getTicket(filter, page, limit, sort, movieId);

        if (!tickets) {
            return res.status(404).json({ status: false, message: 'Lấy dữ liêu không thành công' })
        }

        return res.status(200).json({ data: tickets, status: true, message: 'Lấy tất cả vé thành công' })

    } catch (error) {

        console.error(error);
        return res.status(500).json({ status: false, message: 'Lấy dữ liệu không thành công' });

    }
}

const getDetail = async (req, res, next) => {
    try {
        const { id } = req.params;

        let result = await ticketService.getDetail(id);

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

const addTicket = async (req, res, next) => {
    try {
        const data = req.body;

        const authHeader = req.headers.authorization;

        if (!authHeader) throw new Error('Không có token');

        const token = req.headers.authorization.split(' ')[1];

        if (!token) throw new Error('Token Không hợp lệ');

        const userId = await verifyToken(token);

        const result = await ticketService.addTicket(data, userId);

        if (!result) return res.status(404).json({ status: false, message: "Thêm vé thất bại" });

        res.status(201).json({ status: true, message: "Tạo vé thành công" })
    } catch (error) {

        console.error(error);
        res.status(500).json({ status: false, message: error.message });

    }


}

const ticketCancel = async (req, res, next) => {
    try {
        const { id } = req.params;

        const ticket = await ticketService.cancelRefund(id);

        if (!ticket) {
            return res.status(404).json({ status: false, message: 'Lấy dữ liêu không thành công' })
        }

        return res.status(200).json({ status: true, message: "Hủy Vé Thành Công" });
    }
    catch (error) {

        console.error(error);
        return res.status(500).json({ status: false, message: error.message });

    }
}

module.exports = { getTickets, addTicket, getDetail, ticketCancel }
