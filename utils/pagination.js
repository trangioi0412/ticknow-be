const paginateQuery = async (Model, filter = {}, page, limit, sort = {}) => {
    const query = Model.find(filter).sort(sort);
    let data;
    let pagination = {};
    
    if (!limit && !page) {
        data = await query;
    } else {
        const skip = page && limit ? (page - 1) * limit : 0;
        data = await query.skip(skip).limit(limit || 0);

        const totalData = await Model.countDocuments(filter);
        pagination = {
            total: totalData,
            page: page || 1,
            limit: limit || totalData,
            totalPages: Math.ceil(totalData / (limit || totalData)),
        };
    }

    return { data, pagination };
};

module.exports = { paginateQuery };
