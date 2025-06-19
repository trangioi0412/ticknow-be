const paginateQuery = async (Model, filter = {}, page, limit) => {
    let data;
    let pagination = {};

    if ( !limit && !page ) {
        data = await Model.find(filter)

    } else if ( !page ){

        data = await Model.find(filter).limit(limit);
    
        const totalData = await Model.countDocuments(filter);

        pagination = {
            total: totalData,
            limit: limit,
            totalPages: Math.ceil(totalData / limit),
        }
        
    } else {
        const skip = ( page - 1)*limit;
    
        data = await Model.find(filter).skip(skip).limit(limit);
    
        const totalData = await Model.countDocuments(filter);

        pagination = {
            total: totalData,
            page: page,
            limit: limit,
            totalPages: Math.ceil(totalData / limit),
        }
    }

    return {
        data,
        pagination
    }
}

module.exports = { paginateQuery };