const genreModel = require('../model/genres.model');
const movieModel = require('../model/movies.model');


const mapGenre = require('../utils/mapGenreMovie');
const paginate = require('../utils/pagination');
const convertGenreIds = require('../utils/convertGenreIds');

const rateService = require('../service/rate.service');

const { saveImageToDisk, deleteImageFromDisk } = require('../utils/saveFile');

const fs = require('fs');
const path = require('path');


const getMovies = async (filter = {}, limit = "", page = "", sort) => {
    try {

        const { data, pagination } = await paginate.paginateQuery(movieModel, filter, page, limit, sort);

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
        let result;
        const movie = await movieModel.findById(id);

        if (!movie) {
            throw new Error('❌ Không tìm thấy movie với id này');
        }

        if (movie && movie.status === 1) {
            result = await mapGenre.mapGenreMovieOne(movie);
        }

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

    let movies = [];

    if (Object.keys(filter).length > 1) {

        let screeningDay = await screeningService.getScreeingByDay(filter);

        for (const screening of screeningDay) {
            const movie = await movieModel.findOne({ _id: screening.id_movie, status: filter.status });

            if (movie) {
                movies.push(movie);
            }

        }
    } else {
        const movie = await movieModel.find({ status: filter.status });
        movies = [...movie]
    }

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

const filterSchedule = async (filter = {}, cinema = "") => {
    const screeningService = require('../service/screening.service');

    let screeningDay = await screeningService.getScreeningSchedule(filter, cinema);

    return screeningDay;
}

const addMovies = async (movieData, file) => {

    let genreIds = movieData.genre;

    if (!Array.isArray(genreIds)) {
        genreIds = [genreIds];
    }

    const foundGenre = await genreModel.find({ _id: { $in: genreIds } });

    if (foundGenre.length !== genreIds.length) {
        throw new Error('Một hoặc nhiều danh mục không tồn tại');
    }

    movieData.genre = genreIds;

    const checkMovie = await movieModel.findOne({ name: movieData.name });

    if (checkMovie) {
        throw new Error('Tên Phim Đã Tồn Tại');
    }


    if (file?.image?.[0]) {
        const imageFile = file.image[0];
        const imageName = Date.now() + '-' + imageFile.originalname;
        saveImageToDisk(imageFile.buffer, imageName, 'movie');
        movieData.image = imageName;
    }

    if (file?.banner?.[0]) {
        const bannerFile = file.banner[0];
        const bannerName = Date.now() + '-' + bannerFile.originalname;
        saveImageToDisk(bannerFile.buffer, bannerName, 'banner');
        movieData.banner = bannerName;
    }

    if (typeof movieData.genre === "string") {

        movieData.genre = [movieData.genre];
    }

    const genre = convertGenreIds(movieData.genre);

    const newMovie = new movieModel({
        ...movieData,
        genre: genre
    });

    const data = await newMovie.save();

    return data;

}

const deleteMovie = async (id) => {
    const screeningModel = require('../model/screening.model');

    const screening = await screeningModel.find({ id_movie: id });

    if (screening && screening.length > 0) {
        throw new Error('Phim Đang Còn Suất Chiếu');
    }

    const rate = await rateService.getByIdMovie(id, {});

    if (rate && rate.length > 0) {
        throw new Error('Phim Đang Còn Đánh Giá');
    }

    const movie = await movieModel.findById(id);

    if (!movie) {
        throw new Error(' Không tìm thấy phim để xóa ');
    }

    const imagePath = path.join(__dirname, '../public/images/movie', movie.image);
    const bannerPath = path.join(__dirname, '../public/images/banner', movie.banner);

    if (movie.image && fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }

    if (movie.banner && fs.existsSync(bannerPath)) {
        fs.unlinkSync(bannerPath);
    }

    return await movieModel.findByIdAndDelete(id);

}

const updateMovie = async (movieData, file, id) => {

    let genreIds = movieData.genre;

    const movieId = await movieModel.findById(id);

    if (!movieId) {
        throw new Error('Phim Không tồn tại');
    }

    if (file?.image?.length > 0) {
        movieData.image = file.image[0].filename;
    }

    if (file?.banner?.length > 0) {
        movieData.banner = file.banner[0].filename;
    }

    const foundGenre = await genreModel.find({ _id: { $in: genreIds } });

    if (foundGenre.length !== genreIds.length) {
        throw new Error('Một hoặc nhiều danh mục không tồn tại');
    }

    if (typeof movieData.genre === "string") {

        movieData.genre = [movieData.genre];
    }

    const genre = convertGenreIds(genreIds);

    if (file?.image?.[0]) {
        const imageFile = file.image[0];
        const imageName = Date.now() + '-' + imageFile.originalname;

        if (movieId.image) {
            deleteImageFromDisk(movieId.image, 'movie');
        }

        saveImageToDisk(imageFile.buffer, imageName, 'movie');

        movieData.image = imageName;
    }

    if (file?.banner?.[0]) {
        const bannerFile = file.banner[0];
        const bannerName = Date.now() + '-' + bannerFile.originalname;
        if (movieId.banner) {
            deleteImageFromDisk(movieId.banner, 'banner');
        }
        saveImageToDisk(bannerFile.buffer, bannerName, 'banner');
        movieData.banner = bannerName;
    }

    movieData.genre = genre

    const result = await movieModel.findByIdAndUpdate(
        id,
        movieData,
        { new: true }
    )

    return result;
}

module.exports = {
    getMovies,
    getDetailMovie,
    getMovieById,
    filterMovie,
    filterSchedule,
    addMovies,
    deleteMovie,
    updateMovie
};