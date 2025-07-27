const paginate = require('../utils/pagination');

const voucherModel = require('../model/vouchers.model');
const ticketModel = require('../model/ticket.model');


const getAll = async (filter, page, limit, sort) => {

    const total = await voucherModel.countDocuments(filter);

    let skip = 0;
    if (page && limit) {
        page = parseInt(page);
        limit = parseInt(limit);
        skip = (page - 1) * limit;
    } else {
        page = 1;
        limit = total;
    }

    let query = voucherModel.find(filter).skip(skip).limit(limit)

    if (sort) {
        query = query.sort(sort);
    }

    const voucher = await query;

    const totalPages = Math.ceil(total / limit);

    return {
        voucher: voucher,
        pagination: {
            total: total,
            page: page,
            limit: limit,
            totalPages: totalPages
        }
    };
}

const getDetail = async (id) => {

    const voucher = await voucherModel.findById(id);

    return voucher
}

const checkVouchers = async (code, user) => {
    const voucher = voucherModel.find({ code: code });

    if (!voucher || voucher.is_active === false) {
        throw new Error("Mã ưu đãi không hợp lệ");
    }

    const date = new Date();

    if (voucher.start_date && voucher.start_date > date) {
        throw new Error("Mã ưu đãi chưa bắt đầu");
    }

    if (voucher.end_date && voucher.end_date < date) {
        throw new Error("Mã ưu đãi đã hết hạn");
    }

    if (voucher.max_users !== null && voucher.user_count >= voucher.max_users) {
        throw new Error("Mã ưu đãi đã hết lượt sử dụng");
    }

    const hasUsed = await ticketModel.exists({
        id_user: user,
        id_voucher: voucher._id
    });

    if (hasUsed) {
        throw new Error("Bạn đã sử dụng mã ưu đãi này rồi");
    }

    return voucher;

}

const expireVoucher = async () => {
    const now = new Date();
    const vouchers = await voucherModel.find({is_active: true});
    const expiredIds = [];

    for (const voucher of vouchers) {
        const fullEndTime = new Date(voucher.end_date);

        const isExpired = fullEndTime < now;
        const isUsedUp = voucher.user_count >= voucher.max_users;

        if (isExpired || isUsedUp) {
            expiredIds.push(voucher._id);
        }
    }

    if (expiredIds.length === 0) return 0;

    const result = await voucherModel.updateMany(
        { _id: { $in: expiredIds } },
        { $set: { is_active: false } }
    );


    return result.modifiedCount;
};


const activateVoucher = async () => {
    const now = new Date();
    const vouchers = await voucherModel.find({is_active: false});
    const activateIds = [];

    for (const voucher of vouchers) {
        const start = new Date(voucher.start_date);
        const end = new Date(voucher.end_date);

        const isValidTime = start <= now && now <= end;

        if (isValidTime) {
            activateIds.push(voucher._id);
        }
    }

    if (activateIds.length === 0) return 0;

    const result = await voucherModel.updateMany(
        { _id: { $in: activateIds } },
        { $set: { is_active: true } }
    );

    return result.modifiedCount;
};


const addVoucher = async (voucherData) => {

    let startDate
    if (voucherData.start_date) {
        startDate = new Date(`${voucherData.start_date}T00:00:00.000Z`);
    }

    let endDate
    if (voucherData.end_date) {
        endDate = new Date(`${voucherData.end_date}T00:00:00.000Z`);
    }

    const voucher = await voucherModel.find({ code: voucherData.code });


    if (voucher && voucher.length > 0) {
        throw new Error("Mã voucher đã tồn tại");
    }

    const newVoucher = new voucherModel({
        ...voucherData,
        start_date: startDate || null,
        end_date: endDate || null
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

module.exports = { getAll, getDetail, addVoucher, updateVoucher, checkVouchers, expireVoucher, activateVoucher }
