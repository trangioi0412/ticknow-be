const { uploadToCloudinary } = require('../config/cloudinary');
const cloudinary = require('cloudinary').v2;

const genreModel = require('../model/genres.model');
const movieModel = require('../model/movies.model');
const ratesModel = require('../model/rates.model');


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

const getMovieById = async (id, status) => {
    try {
        const movie = await movieModel.findById(id);

        if (!movie) {
            throw new Error('❌ Không tìm thấy movie với id này');
        }

        if (status !== undefined && movie.status !== parseInt(status)) {
            return undefined;
        }

        return await mapGenre.mapGenreMovieOne(movie);

    } catch (error) {
        console.error(error.message);
        throw new Error('❌ Lỗi lấy dữ liệu của movie');
    }
};

const getMovieId = async (id) => {
    try {
        const result = await movieModel.findById(id);

        if (!result) {
            throw new Error('❌ Không tìm thấy movie với id này');
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

    if (movieData.release_date) {
        let day = new Date();

        let date = new Date(movieData.release_date);

        if (day < date) {
            movieData.status = 2
        }
    }

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
        const result = await uploadToCloudinary(imageFile.buffer, imageName, 'movie');
        movieData.image = `${result.public_id}.${result.format}`
    }

    if (file?.banner?.[0]) {
        const bannerFile = file.banner[0];
        const bannerName = Date.now() + '-' + bannerFile.originalname;
        const result = await uploadToCloudinary(bannerFile.buffer, bannerName, 'banner');
        movieData.banner = `${result.public_id}.${result.format}`;
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

const expireMovie = async () => {
    const now = new Date();
    const movies = await movieModel.find({ status: 2 }).select('_id release_date');
    const expiredIds = [];

    for (const movie of movies) {
        const fullEndTime = new Date(movie.release_date);
        if (fullEndTime < now) {
            expiredIds.push(movie._id);
        }
    }

    if (expiredIds.length === 0) return 0;

    const result = await movieModel.updateMany(
        { _id: { $in: expiredIds } },
        { $set: { status: 1 } }
    );

    return result.modifiedCount;
};

const updateRate = async (id) => {
    const rate = await ratesModel.find({ id_movie: id, is_active: 3 });

    const totalScore = rate.reduce((sum, rate) => sum + rate.score, 0);

    const average = rate.length ? totalScore / rate.length : 0;

    await movieModel.findByIdAndUpdate(id, { star: average });
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

    let genre

    if (genreIds) {
        const foundGenre = await genreModel.find({ _id: { $in: genreIds } });

        if (foundGenre.length !== genreIds.length) {
            throw new Error('Một hoặc nhiều danh mục không tồn tại');
        }
        if (typeof movieData.genre === "string") {

            movieData.genre = [movieData.genre];
        }

        genre = convertGenreIds(genreIds);
    }

    if (movieData.status && movieData.status != movieId.status) {
        const screeningModel = require('../model/screening.model');

        const screening = await screeningModel.find({ id_movie: id });

        if (screening && screening.length > 0) {
            throw new Error('Phim Đang Còn Suất Chiếu');
        }
    }


    if (file?.image?.[0]) {
        const imageFile = file.image[0];
        const imageName = Date.now() + '-' + imageFile.originalname;

        if (movieId.image) {
            await cloudinary.uploader.destroy(movieId.image);
        }

        const result = await uploadToCloudinary(imageFile.buffer, imageName, 'movie');

        movieData.image = result.public_id;
    }

    if (file?.banner?.[0]) {
        const bannerFile = file.banner[0];
        const bannerName = Date.now() + '-' + bannerFile.originalname;
        if (movieId.image) {
            await cloudinary.uploader.destroy(movieId.image);
        }
        const result = await uploadToCloudinary(bannerFile.buffer, bannerName, 'banner');
        movieData.banner = result.public_id;
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
    getMovieId,
    filterMovie,
    filterSchedule,
    addMovies,
    expireMovie,
    updateRate,
    deleteMovie,
    updateMovie
};