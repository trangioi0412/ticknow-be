const paginate = require('../utils/pagination');

const rateModel = require('../model/rates.model');

const ticketService = require('../service/ticket.service');

const mongoose = require('mongoose');

const userService = require('./user.service')


const getAll = async (filter, page, limit, sort) => {
    const movieService = require('../service/movie.service');

    const movies = await movieService.getMovies();

    const movieMap = new Map();

    movies.movie.forEach(movie => {
        movieMap.set(movie._id.toString(), movie.name)
    })

    const tickets = await ticketService.getTicket();

    const ticketMap = new Map();

    tickets.tickets.forEach(ticket => {
        ticketMap.set(ticket._id.toString(), ticket.userName)
    })

    const { data, pagination } = await paginate.paginateQuery(rateModel, filter, page, limit, sort);

    const rate = data.map(rate => {

        const userName = ticketMap.get(rate.id_ticket.toString());
        const movieName = movieMap.get(rate.id_movie.toString());

        return {
            ...rate.toObject(),
            userName: userName,
            movieName: movieName,
        }
    })

    return {
        rate,
        pagination
    };
}


const getByIdMovie = async (movieId) => {

    const rate = await rateModel.find({ id_movie: movieId });

    return rate;

}

const addRate = async (rateData) => {
    const movieService = require('../service/movie.service');

    const ticket = await ticketService.getTicketId(rateData.id_ticket);
    if (!ticket) {
        throw new Error("Vé không hợp lệ")
    }

    const movie = await movieService.getMovieId(rateData.id_movie);

    if (!movie) {
        throw new Error("Phim Không hợp lệ");
    }

    const newRate = await rateModel.create(rateData);

    return newRate;
}

const updateRate = async (rateData) => {

    const movieService = require('../service/movie.service');

    const movie = await movieService.getMovieId(rateData.movie);

    if (!movie) {
        throw new Error("Phim Không hợp lệ");
    }

    const rates = await rateModel.findOne({
        id_movie: new mongoose.Types.ObjectId(movie._id),
        id_ticket: new mongoose.Types.ObjectId(rateData.ticket)
    })

    if (!rateData.score && rateData.score <= 0) {
        throw new Error("vui Lòng chọn số sao và số dưới phải lớn hơn 0.5");
    }

    rateData.is_active = 3

    const rate = await rateModel.findByIdAndUpdate(rates._id, rateData, { new: true });

    return rate;

}

module.exports = { getAll, getByIdMovie, addRate, updateRate }