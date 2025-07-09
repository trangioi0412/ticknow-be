const voucherService = require('../service/vouchers.service');

const getVouchers = async (req, res, next) => {
    try {

        const sortField = req.query.sortField || '_id';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sort = { [sortField]: sortOrder };

        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);

        const filter = {};

        const { code, timeStart, timeEnd, active } = req.query;

        if (code) {
            filter.code = new RegExp(code, 'i');
        }

        if (timeStart) {
            const startDate = new Date(timeStart);
            startDate.setHours(0, 0, 0, 0);
            filter.start_date = { ...filter.timeStart, $gte: startDate };
        }

        if (timeEnd) {
            const endDate = new Date(timeEnd);
            endDate.setHours(23, 59, 59, 999);
            filter.end_date = { ...filter.timeEnd, $lte: endDate };
        }

        if (active) {
            const activeArray = Array.isArray(active) ? active.map(s => s) : active.split(',').map(sta => sta.trim());
            filter.is_active = { $in: activeArray }
        }

        const result = await voucherService.getAll(filter, page, limit, sort);

        if (!result) {
            return res.status(404).json({ status: false, message: "Lấy dữ liệu thật bại" });
        }

        return res.status(200).json({ data: result, status: true, message: 'Lấy dữ liệu thành công' });

    } catch (error) {

        console.error(error.message)
        return res.status(500).json({ status: false, message: error.message });

    }
}

const addVoucher = async (req, res, next) => {
    try {

        const voucher = req.body;

        const result = await voucherService.addVoucher(voucher);

        if (!result) {
            return res.status(404).json({ status: true, message: 'Thêm dữ liệu Không thành công' })
        }

        res.status(200).json({ status: true, message: "Thêm voucher thành công" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

const updateVoucher = async (req, res, next) => {
    try {

        const voucher = req.body;

        const { id } = req.params;

        if (id) {
            res.status(404).json({ status: false, message: " Vui lòng truyền id " })
        }

        const result = await voucherService.updateVoucher(voucher, id);

        if (!result) {
            return res.status(404).json({ status: true, message: 'sửa dữ liệu Không thành công' })
        }

        res.status(200).json({ status: true, message: "Sửa voucher thành công" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

module.exports = { getVouchers, addVoucher, updateVoucher }