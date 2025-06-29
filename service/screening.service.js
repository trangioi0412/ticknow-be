const mongoose = require('mongoose')

const screeningModel = require('../model/screening.model');

const movieService = require('../service/movie.service');

const roomService = require('../service/room.service');

const cinemaService = require('../service/cinema.service');

const getScreeings = async (filter) => {
    try {
        const movies = await movieService.getMovies();
        const movieMap = new Map()

        movies.movie.forEach(movie => {

            movieMap.set(movie._id.toString(), movie.name);

        });

        const rooms = await roomService.getAll();
        const roomMap = new Map();

        rooms.room.forEach(room => {

            roomMap.set(room._id.toString(), room.code_room);

        });

        const screenings = await screeningModel.find(filter);

        const result = screenings.map(screening => {
            const movieId = screening.id_movie.toString();
            const roomId = screening.id_room.toString();

            const movieName = movieMap.get(movieId);
            const roomCode = roomMap.get(roomId);
            return {
                ...screening.toObject(),
                movieName: movieName,
                roomCode: roomCode,
            }
        })

        return result;

    } catch (error) {
        console.error(error)
        throw new Error("Lấy dữ liệu không thành công");
    }
}

const getScreeingById = async (id) => {
    if (!id) {
        throw new Error('Vui Lòng truyền id');
    }

    const result = await screeningModel.findById(id);

    return result;

}

const getScreeingByDay = async (date = "", cinema = "") => {
    let day = date

    if (!date) {
        const now = new Date();
        const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));

        const year = vnTime.getUTCFullYear();
        const month = vnTime.getUTCMonth();
        const date = vnTime.getUTCDate();

        day = new Date(Date.UTC(year, month, date));
    }


    let screenings = await screeningModel.find({ date: day });

    if (cinema) {
        let rooms = await roomService.roomByIdCinema(cinema);
        const roomIds = rooms.map(r => r.id);

        screenings = screenings.filter(s => roomIds.includes(s.id_room.toString()));
    }

    return screenings;
}

const getScreeningByMovieId = async (movieId, filter) => {

    let result = {
        date: "",
        cinemas: [

        ]
    };

    if (!filter.date) {
        const now = new Date();
        const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));

        const year = vnTime.getUTCFullYear();
        const month = vnTime.getUTCMonth();
        const date = vnTime.getUTCDate();

        filter.date = new Date(Date.UTC(year, month, date));
    }

    const screenings = await screeningModel.find({ id_movie: movieId, date: filter.date });

    const firtDate = filter.date;
    result.date = firtDate;

    if (!screenings || screenings.length === 0) return result;

    const cinemaMap = new Map();

    for (const screening of screenings) {

        const room = await roomService.roomById(screening.id_room.toString());

        const cinema = await cinemaService.getCinemaById(room.id_cinema.toString());

        const key = cinema._id.toString();

        if (!cinemaMap.has(key)) {
            cinemaMap.set(key, {
                id: key,
                location: cinema.location,
                name: cinema.name,
                showtimes: [],
            });
        }

        cinemaMap.get(key).showtimes.push({
            id: screening._id,
            time: screening.time_start,
            showtype: screening.showtype,
        });

    }

    result.cinemas = Array.from(cinemaMap.values());

    const data = result
    if (filter.location) {
        result = {
            date: data.date,
            cinemas: data.cinemas.filter(cinema =>
                cinema.location.id_location.toString() === filter.location
            )
        }
    }

    return result;
};

const getScreeningByCinema = async (cinemaId, filter = {} ) => {

    let result = {
        date: "",
        cinemas: [

        ]
    };

    if (!filter.date) {
        const now = new Date();
        const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));

        const year = vnTime.getUTCFullYear();
        const month = vnTime.getUTCMonth();
        const date = vnTime.getUTCDate();

        filter.date = new Date(Date.UTC(year, month, date));
    }

    const firtDate = filter.date;
    result.date = firtDate;

    const rooms = await roomService.roomByIdCinema(cinemaId);

    const screeningResults = await Promise.all(rooms.map(r => screeningModel.find({ id_room: r._id, date: filter.date })));
    const screenings = screeningResults.flat();

    if (!screenings || screenings.length === 0) {
        return result;
    }

    const movieMap = new Map();

    for (const screening of screenings) {

        const movie = await movieService.getMovieById(screening.id_movie.toString());

        const key = movie._id.toString();

        if (!movieMap.has(key)) {
            movieMap.set(key, {

                id: cinemaId,

                movie: movie,

                showtimes: []
            });
        }

        movieMap.get(key).showtimes.push({
            id: screening._id,
            time: screening.time_start,
            showtype: screening.showtype
        });
    }

    result.cinemas = Array.from(movieMap.values());

    return result;

}


const getScreeningSchedule = async (filter, cinema) => {
    const result = {
        date: "",
        films: []
    };

    if (!filter.date) {
        const now = new Date();
        const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
        filter.date = new Date(Date.UTC(vnTime.getUTCFullYear(), vnTime.getUTCMonth(), vnTime.getUTCDate()));
    }

    result.date = filter.date;

    if (cinema) {
        const rooms = await roomService.roomByIdCinema(cinema);
        if (rooms?.length) {
            filter.id_room = { $in: rooms.map(r => r._id) };
        }
    }


    const screenings = await screeningModel.find(filter);

    const filmMap = new Map();

    for (let screening of screenings) {
        const room = await roomService.roomById(screening.id_room.toString());
        const cinemaData = await cinemaService.getCinemaById(room.id_cinema.toString());

        const filmData = await movieService.getMovieById(screening.id_movie.toString());

        const filmId = filmData._id.toString();

        if (!filmMap.has(filmId)) {
            filmMap.set(filmId, {
                id: filmId,
                name: filmData.name,
                cinemas: []
            });
        }

        const film = filmMap.get(filmId);

        let cinemaItem = film.cinemas.find(c => c.id === cinemaData._id.toString());

        if (!cinemaItem) {
            cinemaItem = {
                id: cinemaData._id.toString(),
                location: cinema.location,
                showtimes: []
            }
            film.cinemas.push(cinemaItem);
        }

        cinemaItem.showtimes.push({
            id: screening._id,
            time: screening.time_Start,
            showtype: screening.showtype
        })
    }

    result.films = Array.from(filmMap.values());

    return result;
};

const screeningRoom = async (id) => {
    const ticketService = require('../service/ticket.service');


    let filter = {}

    const screening = await screeningModel.findById(id);

    const room = await roomService.roomId(screening.id_room);

    if (!screening) {
        throw new Error("Không Tìm Thấy Phòng")
    }

    filter.id_screening = screening._id

    let seat = {}

    const tickets = await ticketService.filterTicket(filter);

    for (let ticket of tickets) {
        ticket.seat.forEach(ticket => {
            
            const row = ticket[0];
            const number = parseInt(ticket.slice(1), 10);

            if(!seat[row]){
                seat[row] = [];
            }

            seat[row].push(number);
        });
    }

    room.diagram.element_selected = { ...seat }
    
    return room;
}

module.exports = {
    getScreeings,
    getScreeningByMovieId,
    getScreeingById,
    getScreeingByDay,
    getScreeningByCinema,
    getScreeningSchedule,
    screeningRoom
}