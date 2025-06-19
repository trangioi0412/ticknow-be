const voucherModel = require('../model/vouchers.model');

const getVouchers = async () => {
    try {

        const vouchers = voucherModel.find();
        return vouchers;

    } catch (error) {
        console.error(error)
        throw new Error("Lấy dữ liệu không thành công");
    }
}

module.exports = { getVouchers }