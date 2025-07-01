const paginate = require('../utils/pagination');

const voucherModel = require('../model/vouchers.model');
const ticketService = require('../service/ticket.service');


const getAll = async (page, limit) => {

    const { data, pagination } = await paginate.paginateQuery(voucherModel, {}, page, limit);

    return {
        voucher: data,
        pagination
    };
}

const addVoucher = async (voucherData) => {

    let startDate = new Date(`${voucherData.start_date}T00:00:00.000Z`);
    let endDate = new Date(`${voucherData.end_date}T00:00:00.000Z`);

    const voucher = await voucherModel.find({ code: voucherData.code });

    
    if ( voucher && voucher.length > 0 ) {
        throw new Error("Mã voucher đã tồn tại");
    }

    const newVoucher = new voucherModel({
        ...voucherData,
        start_date: startDate,
        end_day: endDate
    })

    const result = await newVoucher.save();

    return result;

}

const updateVoucher = async (voucherData, id) => {

    let startDate = new Date(`${voucherData.start_date}T00:00:00.000Z`);
    let endDate = new Date(`${voucherData.end_date}T00:00:00.000Z`);

    const voucher = await voucherModel.find({ code: voucherData.code });

    if (voucher && voucher.lenght > 0) {
        throw new Error("Mã voucher đã tồn tại");
    }

    const newVoucher = {
        ...voucherData,
        start_date: startDate,
        end_day: endDate
    }

    const result = await voucherModel.findByIdAndUpdate(
        id,
        newVoucher,
        { new: true }
    );

    return result;
}

module.exports = { getAll, addVoucher, updateVoucher }
