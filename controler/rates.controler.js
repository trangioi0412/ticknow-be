const rateModel = require('../model/rates.model');
const movieService = require('../service/movie.service');
const ticketControler = require('../controler/ticket.controler');

const getRate = async () => {
    try {
        const movies = await movieService.getMovies();

        const movieMap = new Map();

        movies.movie.forEach(movie => {
            movieMap.set(movie._id, movie.name)
        })

        const tickets = await ticketControler.getTickets();
        
        const ticketMap = new Map();
        tickets.forEach(ticket => {
            ticketMap.set(ticket._id, ticket.userName)
        })

        const rates = await rateModel.find();
        const result =  rates.map(rate => {
            const userName = ticketMap.get(rate.id_ticket);
            const movieName = movieMap.get(rate.id_movie);

            return {
                ...rate.toObject(),
                userName: userName,
                movieName: movieName,
            }
        })
        return result;
        
    } catch (error) {
        console.error(error);
        throw new Error('Lấy dữ liệu không thành công');
    }
}

module.exports = { getRate }