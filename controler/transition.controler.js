const transitionModel = require('../model/transition.model');
const transitionService = require('../service/transition.service');
const payMethodService = require('../service/payMethods.service');


const getTransition = async (req, res, next) => {
    try {

        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sort = { [sortField]: sortOrder };

        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        
        const filter = {};

        const tickets = await transitionService.getAll(filter, page, limit, sort);

        if (!tickets) {
            return res.status(404).json({ status: false, message: 'Lấy dữ liêu không thành công' })
        }

        return res.status(299).json({ data: tickets, status: true, message: 'Lấy tất cả vé thành công' })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Lấy dữ liệu không thành công' })
    }
}

module.exports = { getTransition }