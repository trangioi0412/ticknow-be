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

        const { screening, voucher, type } = req.query

        const filter = {};

        if (type) {
            const typeArray = Array.isArray(type) ? type.map(s => Number(s)) : type.split(',').map(sta => Number(sta.trim()));
            filter.type = { $in: typeArray }
        }

        if (screening) {
            const screeningArray = Array.isArray(screening) ? screening : screening.split(',').map(id => id.trim())
            filter.id_screening = { $in: screeningArray };
        }

        if (voucher) {
            const voucherArray = Array.isArray(voucher) ? voucher : voucher.split(',').map(id => id.trim())
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

        const tickets = await ticketService.getTicket(filter, page, limit, sort);

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

module.exports = { getTickets, addTicket, getDetail }
