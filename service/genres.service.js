const genreModel = require('../model/genres.model');
const paginate = require('../utils/pagination');


const getGenres = async (filter, page="", limit="", sort) => {

    const { data, pagination } = await paginate.paginateQuery(genreModel, filter, page, limit, sort);

    return {
        genres: data,
        pagination
    };

}

module.exports = { getGenres }