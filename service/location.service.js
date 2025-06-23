const locationModel = require('../model/location.model');
const paginate = require('../utils/pagination');


const getAll = async (page,limit) => {

    const { data, pagination } = await paginate.paginateQuery(locationModel, {}, page, limit);
    

    return {
        location: data,
        pagination
    };

}

module.exports = { getAll }