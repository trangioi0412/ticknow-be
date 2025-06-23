const paginate = require('../utils/pagination');

const voucherModel = require('../model/vouchers.model');


const getAll = async (page, limit) => {

    const { data, pagination } = await paginate.paginateQuery(voucherModel, {}, page, limit);

    return {
        voucher: data,
        pagination
    };
}

module.exports = { getAll }