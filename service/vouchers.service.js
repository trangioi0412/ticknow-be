const paginate = require('../utils/pagination');

const voucherModel = require('../model/vouchers.model');
const ticketService = require('../service/ticket.service');


const getAll = async (filter, page, limit, sort) => {

    const { data, pagination } = await paginate.paginateQuery(voucherModel, filter, page, limit, sort);

    return {
        voucher: data,
        pagination
    };
}

const getDetail = async (id) => {

    const voucher = await voucherModel.findById(id);

    return voucher
}

const addVoucher = async (voucherData) => {

    let startDate = new Date(`${voucherData.start_date}T00:00:00.000Z`);
    let endDate = new Date(`${voucherData.end_date}T00:00:00.000Z`);

    const voucher = await voucherModel.find({ code: voucherData.code });


    if (voucher && voucher.length > 0) {
        throw new Error("Mã voucher đã tồn tại");
    }

    const newVoucher = new voucherModel({
        ...voucherData,
        start_date: startDate,
        end_date: endDate
    })

    const result = await newVoucher.save();

    return result;

}

const updateVoucher = async (voucherData, id) => {

    let startDate;
    let endDate;

    if (voucherData.start_date) {
        startDate = new Date(`${voucherData.start_date}T00:00:00.000Z`);
    }

    if (voucherData.end_date) {
        endDate = new Date(`${voucherData.end_date}T00:00:00.000Z`);
    }

    const voucher = await voucherModel.findById(id);

    
    if (voucherData.userCount !== undefined) {

        voucherData.user_count = parseInt(voucher.user_count) + 1;
    }

    const newVoucher = {
        ...voucherData,
        start_date: startDate,
        end_date: endDate
    }

    const result = await voucherModel.findByIdAndUpdate(
        id,
        newVoucher,
        { new: true }
    );

    return result;
}

module.exports = { getAll, getDetail, addVoucher, updateVoucher }
