const payMethodModel = require('../model/payMethods.model');

const paginate = require('../utils/pagination');


const getAll = async (page,limit) => {

    const { data, pagination } = await paginate.paginateQuery(payMethodModel, {}, page, limit);
    
    return {
        payMethod: data,
        pagination
    };

}

module.exports = { getAll }