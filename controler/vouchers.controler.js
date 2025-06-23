const voucherService = require('../service/vouchers.service');

const getVouchers = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);

        const result = await voucherService.getAll(page, limit);

        if (!result) {
            return res.status(404).json({ status: false, message: "Lấy dữ liệu thật bại" });
        }

        return res.status(200).json({ data: result, status: true, message: 'Lấy dữ liệu thành công' });

    } catch (error) {

        console.error(error.message)
        return res.status(500).json({ status: false, message: error.message });

    }
}

module.exports = { getVouchers }