const paginate = require('../utils/pagination');

const ticketModel = require('../model/ticket.model');

const screeningService = require('./screening.service')
const usersService = require('./user.service');
const roomService = require('./room.service');
const movieService = require('./movie.service');

const getTicket = async (page = "", limit = "") => {
    const movieService = require('./movie.service');

    const screenings = await screeningService.getScreeings();

    let room;
    let cinema;
    let movie;

    const screeningMap = new Map();

    screenings.forEach(async screening => {
        const cinemaRoom = await roomService.roomById(screening.id_room);

        room = {
            id: cinemaRoom.id_room,
            code: cinemaRoom.code_room
        }

        cinema = {
            id: cinemaRoom.id_cinema,
            name: cinemaRoom.name_cinema
        }

        const movieId = await movieService.getMovieById(screening.id_movie)
        movie = {
            id: movieId._id,
            name: movieId.name,
            img: movieId.image
        };
        screeningMap.set(screening._id.toString(), screening.time_start)
    })

    const users = await usersService.getUsers();
    const userMap = new Map();

    users.user.forEach(user => {
        userMap.set(user._id.toString(), user.name);
    })

    const { data, pagination } = await paginate.paginateQuery(ticketModel, {}, page, limit);


    const ticket = data.map(ticket => {
        const screeningId = ticket.id_screening.toString();
        const screeningTime = screeningMap.get(screeningId);
        const userId = ticket.id_user.toString();
        const userName = userMap.get(userId);
        return {
            ...ticket.toObject(),
            userName: userName,
            screeningTime: screeningTime,
            cinema,
            room,
            movie,
        }
    })

    return {
        ticket,
        pagination
    };

}

const filterTicket = async (filter) => {
    const tickets = await ticketModel.find(filter);

    if (!tickets) {
        throw new Error('Không có phòng phù hợp');
    }

    return tickets;
}

const getTicketId = async (id) => {
    const ticket = await ticketModel.findById(id);
    return ticket
}

module.exports = { getTicket, filterTicket, getTicketId }