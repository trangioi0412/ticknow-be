const locationModel = require('../model/location.model');
const paginate = require('../utils/pagination');


const getAll = async (filter, page, limit, sort) => {

    const { data, pagination } = await paginate.paginateQuery(locationModel, filter, page, limit, sort);
    

    return {
        location: data,
        pagination
    };

}

module.exports = { getAll }