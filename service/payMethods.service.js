const payMethodModel = require('../model/payMethods.model');

const paginate = require('../utils/pagination');


const getAll = async (filter, page, limit, sort) => {

    const { data, pagination } = await paginate.paginateQuery(payMethodModel, filter, page, limit, sort);
    
    return {
        payMethod: data,
        pagination
    };

}

const payMethodDetail = async (id) => {
    const payMethod = await payMethodModel.findById(id);
    return payMethod;
}

module.exports = { getAll, payMethodDetail }