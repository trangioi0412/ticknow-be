const paginate = require('../utils/pagination');

const rateModel = require('../model/rates.model');

const ticketService = require('../service/ticket.service');


const getAll = async (filter, page, limit, sort) => {
    const movieService = require('../service/movie.service');

    const movies = await movieService.getMovies();

    const movieMap = new Map();

    movies.movie.forEach(movie => {
        movieMap.set(movie._id.toString(), movie.name)
    })

    const tickets = await ticketService.getTicket();

    const ticketMap = new Map();

    tickets.ticket.forEach(ticket => {
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

module.exports = { getAll, getByIdMovie }