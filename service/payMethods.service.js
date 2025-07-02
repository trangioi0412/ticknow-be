const payMethodModel = require('../model/payMethods.model');

const paginate = require('../utils/pagination');


const getAll = async (filter, page, limit, sort) => {

    const { data, pagination } = await paginate.paginateQuery(payMethodModel, filter, page, limit, sort);
    
    return {
        payMethod: data,
        pagination
    };

}

module.exports = { getAll }