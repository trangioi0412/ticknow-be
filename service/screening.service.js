const mongoose = require('mongoose');
const moment = require('moment');

const screeningModel = require('../model/screening.model');

const roomService = require('./room.service');

const rateModel = require('../model/rates.model');

const cinemaService = require('./cinema.service');

const paginate = require('../utils/pagination');
const ratesModel = require('../model/rates.model');

const getScreeings = async (filter, page, limit, sort) => {
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

        const { data, pagination } = await paginate.paginateQuery(
            screeningModel,
            filter,
            page,
            limit,
            sort
        );

        const result = data.map(screening => {
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

        return {
            result,
            pagination
        };

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

const getScreeingByDay = async (filter) => {

    let screenings

    if (filter.date) {
        screenings = await screeningModel.find({ date: filter.date });
    } else {
        screenings = await screeningModel.find();
    }

    if (filter.cinema) {
        let rooms = await roomService.roomByIdCinema(filter.cinema);
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

const getScreeningSchedule = async (filterInput, cinema) => {
    const movieService = require('../service/movie.service');

    const result = {
        date: "",
        data: []
    };

    const { status, ...filter } = filterInput;

    if (!filter.date) {
        const now = new Date();
        const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
        filter.date = new Date(Date.UTC(vnTime.getUTCFullYear(), vnTime.getUTCMonth(), vnTime.getUTCDate()));
    }

    result.date = filter.date;

    if (cinema) {
        const rooms = await roomService.roomByIdCinema(cinema);
        if (!rooms?.length) return result;

        filter.id_room = { $in: rooms.map(r => r._id) };
    }

    const screenings = await screeningModel.find(filter);


    if (!screenings || !Array.isArray(screenings) || screenings.length <= 0) {
        return result;
    }

    const roomCache = new Map();

    const cinemaCache = new Map();

    const movieCache = new Map();

    const filmMap = new Map();

    for (const screening of screenings) {
        let room = roomCache.get(screening.id_room.toString());
        if (!room) {
            room = await roomService.roomById(screening.id_room.toString());
            roomCache.set(screening.id_room.toString(), room);
        }

        let cinemaData = cinemaCache.get(room.id_cinema.toString());
        if (!cinemaData) {
            cinemaData = await cinemaService.getCinemaById(room.id_cinema.toString());
            cinemaCache.set(room.id_cinema.toString(), cinemaData);
        }

        let filmData = movieCache.get(screening.id_movie.toString());

        console.log(filmData);

        if (!filmData) {
            filmData = await movieService.getMovieById(screening.id_movie.toString(), status);
            if (filmData) {
                movieCache.set(screening.id_movie.toString(), filmData);
            } else {
                console.warn(`Không tìm thấy filmData cho movieId: ${screening.id_movie}`);
                continue;
            }
        }

        const filmId = filmData._id.toString();

        if (!filmMap.has(filmId)) {
            filmMap.set(filmId, {
                film: filmData,
                cinemas: []
            });
        }

        const film = filmMap.get(filmId);

        let cinemaItem = film.cinemas.find(c => c.id === cinemaData._id.toString());
        if (!cinemaItem) {
            cinemaItem = {
                id: cinemaData._id.toString(),
                name: cinemaData.name,
                location: cinemaData.location,
                showtimes: []
            };
            film.cinemas.push(cinemaItem);
        }

        cinemaItem.showtimes.push({
            id: screening._id,
            time: screening.time_start,
            showtype: screening.showtype
        });
    }

    result.data = Array.from(filmMap.values());
    return result;
};


const screeningRoom = async (id) => {

    const ticketService = require('../service/ticket.service');


    let filter = {

    }

    const screening = await screeningModel.findById(id);

    if (screening === null || screening === undefined) {
        return screening;
    }

    const room = await roomService.roomId(screening.id_room);

    if (!room) {
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

    room.diagram.element_selected = { ...seat };

    return {
        room,
        screening
    };
}

const expireRatesBasedOnScreening = async () => {
    const now = new Date();
    const screenings = await screeningModel.find({ status: { $ne: 1 } }).select('id_movie time_end date');
    const expiredIds = []

    for (const screening of screenings) {
        const dateStr = screening.date.toISOString().split('T')[0];

        const fullEndTime = new Date(`${dateStr}T${screening.time_end}:00`);
        if (fullEndTime < now) {
            expiredIds.push(screening.id_movie);
        }
    }

    const result = await rateModel.updateMany({
        id_movie: { $in: expiredIds },
        is_active: 1
    },
        {
            $set: { is_active: 2 },
        }
    );

    return result.modifiedCount;
}

const addSceening = async (screeningData) => {

    const movieService = require('../service/movie.service');

    const room = await roomService.roomByIdCinema(screeningData.id_room);

    let date = new Date(`${screeningData.date}T00:00:00.000Z`);

    if (!room && room.length < 0) {
        throw new Error("Không tìm thấy phòng");
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

    screeningData.time_start = moment(screeningData.time_start, "HH:mm").format("HH:mm");

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


const updateSceening = async (screeningData, id) => {
    const movieService = require('../service/movie.service');
    const screening = await screeningModel.findById(id);

    if (!screening || screening.status === 1) {
        throw new Error("Suất không có hoặc không còn hoạt động");
    }

    const date = screeningData.date
        ? new Date(`${screeningData.date}T00:00:00.000Z`)
        : screening.date;

    if (screeningData.id_room) {
        const room = await roomService.roomByIdCinema(screeningData.id_room);

        if (!room) {
            throw new Error("Không tìm thấy phòng");
        }

        if (room.status === 1) {
            throw new Error("Phòng không còn hoạt động");
        }
    }

    if (!screeningData.time_start || screeningData.time_start.trim() === "") {
        screeningData.time_start = screening.time_start
    }

    const movieId = screening.id_movie;
    let movie = await movieService.getMovieById(movieId);

    if (!movie) {
        throw new Error("Không tìm thấy phim");
    }

    const timeStart = screeningData.time_start;
    const timeEnd = moment(timeStart, "HH:mm")
        .add(movie.duration, 'minutes')
        .format("HH:mm");

    const conflict = await screeningModel.findOne({
        _id: { $ne: id },
        id_room: screeningData.id_room,
        date: date,
        time_start: { $lt: timeEnd },
        time_end: { $gt: timeStart }
    });

    if (conflict) {
        throw new Error("Đã có lịch chiếu trùng trong khoảng thời gian này.");
    }

    const newScreening = {
        ...screeningData,
        id_movie: new mongoose.Types.ObjectId(movieId),
        id_room: new mongoose.Types.ObjectId(screeningData.id_room || screening.id_room),
        date: date,
        time_end: timeEnd
    };

    const result = await screeningModel.findByIdAndUpdate(id, newScreening, { new: true });

    return result;
};

module.exports = {
    getScreeings,
    getScreeningByMovieId,
    getScreeingById,
    getScreeingByDay,
    getScreeningByCinema,
    getScreeningSchedule,
    screeningRoom,
    expireRatesBasedOnScreening,
    addSceening,
    updateSceening
}