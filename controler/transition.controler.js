const transitionModel = require('../model/transition.model');
const transitionService = require('../service/transition.service');
const payMethodService = require('../service/payMethods.service');


const getTransition = async (req, res, next) => {
    try {

        const sortField = req.query.sortField || '_id';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sort = { [sortField]: sortOrder };

        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const { payMethod, status, time } = req.query;
        const filter = {};

        if (status) {
            const statusArray = Array.isArray(status) ? status.map(s => Number(s)) : status.split(',').map(sta => Number(sta.trim()));
            filter.status = { $in: statusArray }
        }

        if (payMethod) {
            const payMethodArray = Array.isArray(payMethod) ? payMethod : payMethod.split(',').map(id => id.trim())
            filter.id_payMethod = { $in: payMethodArray };
        }

        if (time) {
            const localDate = new Date(time);
            localDate.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(localDate);
            endOfDay.setUTCHours(23, 59, 59, 999);
            filter.payment_time = { $gte: localDate, $lte: endOfDay };

        }

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

const addTranstion = async (req, res) => {
    try {
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'thêm dữ liệu không thành công' })
    }
}

module.exports = { getTransition }