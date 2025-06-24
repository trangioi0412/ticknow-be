const genreModel = require('../model/genres.model');
const paginate = require('../utils/pagination');


const getGenres = async (page="", limit="") => {

    const { data, pagination } = await paginate.paginateQuery(genreModel, {}, page, limit);

    return {
        genres: data,
        pagination
    };

}

module.exports = { getGenres }