const mongoose = require('mongoose');
const moment = require('moment');

const screeningModel = require('../model/screening.model');

const roomService = require('../service/room.service');

const cinemaService = require('../service/cinema.service');

const getScreeings = async (filter) => {
    try {
        const movieService = require('../service/movie.service');

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

    console.log(cinema);

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

const getScreeningByCinema = async (cinemaId, filter = {}) => {
    const movieService = require('../service/movie.service');


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
    const movieService = require('../service/movie.service');

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

            if (!seat[row]) {
                seat[row] = [];
            }

            seat[row].push(number);
        });
    }

    room.diagram.element_selected = { ...seat }

    return room;
}

const addSceening = async (screeningData) => {

    const movieService = require('../service/movie.service');

    const room = await roomService.roomByIdCinema(screeningData.id_room);

    let date = new Date(`${screeningData.date}T00:00:00.000Z`);

    if (!room && room.length < 0) {
        throw new Error("Không tìm thấy room");
    }

    if (room.status === 1) {
        throw new Error("Phòng không còn hoạt động")
    }

    if (!screeningData.time_start && screeningData.time_start === "") {
        throw new Error("Vui lòng nhập thời gian bắt đầu suất chiếu")
    }

    const movie = await movieService.getMovieById(screeningData.id_movie);


    if (!movie && movie.length < 0) {
        throw new Error("Không tìm thấy phim")
    }

    let time_end = moment(screeningData.time_start, "HH:mm").add(movie.duration, 'minutes').format("HH:mm");

    const conflict = await screeningModel.findOne({
        id_room: screeningData.id_room,
        date: date,
        time_start: { $lt: time_end },
        time_end: { $gt: screeningData.time_start }
    });

    if (conflict) {
        throw new Error("Đã có lịch chiếu trùng trong khoảng thời gian này.");
    }

    const newScreening = new screeningModel({
        ...screeningData,
        id_movie: new mongoose.Types.ObjectId(screeningData.id_movie),
        id_room: new mongoose.Types.ObjectId(screeningData.id_room),
        time_end: time_end
    })

    const data = await newScreening.save();

    return data;
}

const updateSceening = async (screeningData) => {

    const movieService = require('../service/movie.service');

    const room = await roomService.roomByIdCinema(screeningData.id_room);

    let date = new Date(`${screeningData.date}T00:00:00.000Z`);

    if (!room && room.length < 0) {
        throw new Error("Không tìm thấy room");
    }

    if (room.status === 1) {
        throw new Error("Phòng không còn hoạt động")
    }

    if (!screeningData.time_start && screeningData.time_start === "") {
        throw new Error("Vui lòng nhập thời gian bắt đầu suất chiếu")
    }

    const movie = await movieService.getMovieById(screeningData.id_movie);


    if (!movie && movie.length < 0) {
        throw new Error("Không tìm thấy phim")
    }

    let time_end = moment(screeningData.time_start, "HH:mm").add(movie.duration, 'minutes').format("HH:mm");

    const conflict = await screeningModel.findOne({
        id_room: screeningData.id_room,
        date: date,
        time_start: { $lt: time_end },
        time_end: { $gt: screeningData.time_start }
    });

    if (conflict) {
        throw new Error("Đã có lịch chiếu trùng trong khoảng thời gian này.");
    }

    const newScreening = {
        ...screeningData,
        id_movie: new mongoose.Types.ObjectId(screeningData.id_movie),
        id_room: new mongoose.Types.ObjectId(screeningData.id_room),
        time_end: time_end
    };

    const result = await screeningModel.findByIdAndUpdate(
        screeningData.id,
        newScreening,
        { new: true }
    )

    return result

}

module.exports = {
    getScreeings,
    getScreeningByMovieId,
    getScreeingById,
    getScreeingByDay,
    getScreeningByCinema,
    getScreeningSchedule,
    screeningRoom,
    addSceening,
    updateSceening
}