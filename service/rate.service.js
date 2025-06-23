const paginate = require('../utils/pagination');

const rateModel = require('../model/rates.model');

const movieService = require('../service/movie.service');
const ticketService = require('../service/ticket.service');


const getAll = async (page, limit) => {
    const movies = await movieService.getMovies();

    const movieMap = new Map();

    movies.movie.forEach(movie => {
        movieMap.set(movie._id, movie.name)
    })

    const tickets = await ticketService.getTicket();

    const ticketMap = new Map();
    tickets.ticket.forEach(ticket => {
        ticketMap.set(ticket._id, ticket.userName)
    })

    const { data, pagination } = await paginate.paginateQuery(rateModel, {}, page, limit);
    
    const rate = data.map(rate => {

        const userName = ticketMap.get(rate.id_ticket);
        const movieName = movieMap.get(rate.id_movie);

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

module.exports = { getAll }