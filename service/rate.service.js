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

const updateRate = async (rateData, id) => {

    if (rateData.movie || rateData.ticket) {
        throw new Error("Không thể sửa phim hay vé");
    }

    const rateOld = await rateModel.findById(id)

    const ticket = await ticketService.getTicketId(rateOld.id_ticket);

    if (!ticket) {
        throw new Error("vé không tồn tại");
    }

    if(!rateData.score && rateData.score <= 0 ){
        throw new Error("vui Lòng chọn số sao và số dưới phải lớn hơn 0.5");
    }

    if(!rateData.comment && rateData.comment == ""){
        throw new Error("vui Lòng nhập nội dung bình luận");
    }
    
    const rate = await rateModel.findByIdAndUpdate(id, rateData, { new: true });
    
    console.log(rate);
    return rate;

}

module.exports = { getAll, getByIdMovie, addRate, updateRate }