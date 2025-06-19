const genreModel = require('../model/genres.model');

const getGenres = async () => {
    try{
        const genres = await genreModel.find();
        return genres;
    }catch(error){
        console.error(error.message)
        throw new Error('❌ Lỗi lấy dữ liệu của location')
    }
}

module.exports = { getGenres };