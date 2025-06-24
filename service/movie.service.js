const movieModel = require('../model/movies.model');

const mapGenre = require('../utils/mapGenreMovie');
const paginate = require('../utils/pagination');

const getMovies = async (filter = {}, limit = "", page = "") => {
    try {

        const { data, pagination } = await paginate.paginateQuery(movieModel, filter, page, limit);

        const movie = await mapGenre.mapGenreMovie(data);

        const result = {
            movie,
            pagination
        }
        return result;

    } catch (error) {
        console.error(error.message)
        throw new Error('❌ Lỗi lấy dữ liệu của movie')
    }

}


const getMovieById = async (id) => {
    try {

        const result = await movieModel.findById(id);
        return result;

    } catch (error) {
        console.error(error.message)
        throw new Error('❌ Lỗi lấy dữ liệu của movie')
    }

}

const getDetailMovie = async (id, filter) => {

    const screeningService = require('../service/screening.service');

    try {

        if (!id) {
            throw new Error("❌ id phim không hợp lệ");
        }

        const screening = await screeningService.getScreeningByMovieId(id, filter);

        const movies = await movieModel.findById(id);

        const movie = await mapGenre.mapGenreMovieOne(movies);

        screening.movie = movie;

        const result = screening;


        return result;

    } catch (error) {
        console.error(error.message);
        throw new Error('❌ Lỗi lấy dữ liệu của movie');
    }
}

const filterMovie = async (filter = {}, genre = "", limit = "", page = "") => {

    const screeningService = require('../service/screening.service');

    let movies = []

    let screeningDay = await screeningService.getScreeingByDay(filter.date, filter.cinema);
    movies = await Promise.all(
        screeningDay.map(screening => {
            return movieModel.findById(screening.id_movie);
        })
    );

    movies = movies.filter((movie, index, self) =>
        index === self.findIndex(m => m._id.toString() === movie._id.toString())
    ); 

    if (genre) {
        movies = movies.filter((movie) =>
            movie.genre.some(g => g.id == genre)
        );
    }
    const movie = await mapGenre.mapGenreMovie(movies);

    const result = {
        movie,
        pagination: []
    }

    return result;
}

module.exports = { getMovies, getDetailMovie, getMovieById, filterMovie };