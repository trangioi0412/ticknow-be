const ticketService = require('../service/ticket.service');


const getTickets = async (req, res, next) => {
    try {

        const sortField = req.query.sortField || 'createdAt';
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

        const tickets = await ticketService.getTicket(filter, page, limit, sort);

        if (!tickets) {
            return res.status(404).json({ status: false, message: 'Lấy dữ liêu không thành công' })
        }

        return res.status(299).json({ data: tickets, status: true, message: 'Lấy tất cả vé thành công' })

    } catch (error) {

        console.error(error);
        return res.status(500).json({ status: false, message: 'Lấy dữ liệu không thành công' });

    }
}

const addTicket = async () => {

}

module.exports = { getTickets }
