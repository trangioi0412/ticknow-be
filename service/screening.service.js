const screeningModel = require('../model/screening.model');

const movieService = require('../service/movie.service');

const roomControler = require('../controler/room.controler');
const cinemaControler = require('../controler/cinemas.controler');

const getScreeings = async ( filter ) => {
    try {

        const movies = await movieService.getMovies();
        const movieMap = new Map()

        movies.movie.forEach(movie => {

            movieMap.set(movie._id.toString(), movie.name);

        });

        const rooms = await roomControler.getRooms();
        const roomMap = new Map();

        rooms.forEach(room => {

            roomMap.set(room._id.toString(), room.code_room);

        });

        const screenings = await screeningModel.find( filter );
        
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

let getMovieToScreening = async (id) => {
    const movie = await movieService.getDetailMovie(id);
    return movie;
}

const getScreeningFilter = async (filter) => {
    try {

        const screenings = await screeningModel.find( filter );
        
        const result = await Promise.all( screenings.map( async screening => {
            const movie = await getMovieToScreening(screening.id_movie.toString());
            return {
                ...screening.toObject(),
                movie: movie,
            }
        }) )

        console.log(result);
        return result

    } catch (error) {
        console.error(error)
        throw new Error("Lấy dữ liệu không thành công");
    }
}


const getScreeningById = async (movieId, filter) => {

    const result = {
        date: "",
        cinemas: [

        ]
    };

    const screenings = await screeningModel.find({ id_movie: movieId, date: filter.date });

    if(!screenings || screenings.length === 0) return result;
    const firtDate = screenings[0].date?.toISOString().split("T")[0];
    result.date = firtDate || "";

    const cinemaMap = new Map();

    for(const screening of screenings ){
        const room = await roomControler.roomById(screening.id_room.toString());
        const cinema = await cinemaControler.getCinemaById(room.id_thear.toString())

        const key = cinema._id.toString;
        if(!cinemaMap.has(key)){
            cinemaMap.set(key, {
                id: key,
                name: cinema.name,
                showtimes: [],
            });
        }

        cinemaMap.get(key).showtimes.push({
            time: screening.time_start,
            showtype: screening.showtype,
        });

    }

    result.cinemas = Array.from(cinemaMap.values());

    return result;
};

module.exports = { getScreeings, getScreeningFilter, getScreeningById}