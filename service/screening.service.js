const screeningModel = require('../model/screening.model');

const movieService = require('../service/movie.service');

const roomService = require('../service/room.service');
const cinemaService = require('../service/cinema.service');

const getScreeings = async ( filter ) => {
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

const getScreeingById = async (id) => {
    if(!id){
        throw new Error('Vui Lòng truyền id');
    }

    const result = await screeningModel.findById(id);
    return result;

}

const getScreeningByMovieId = async (movieId, filter) => {

    const result = {
        date: "",
        cinemas: [

        ]
    };

    if(!filter.date){
        const now =  new Date();
        const vnTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));

        const year = vnTime.getUTCFullYear();
        const month = vnTime.getUTCMonth();
        const date = vnTime.getUTCDate();

        filter.date = new Date(Date.UTC(year, month, date));
    }

    const screenings = await screeningModel.find({ id_movie: movieId, date: filter.date });

    const firtDate = filter.date;
    result.date = firtDate;

    if(!screenings || screenings.length === 0) return result;

    const cinemaMap = new Map();

    for(const screening of screenings ){
        const room = await roomService.roomById(screening.id_room.toString());
        const cinema = await cinemaService.getCinemaById(room.id_thear.toString());

        const key = cinema._id.toString;
        if(!cinemaMap.has(key)){
            cinemaMap.set(key, {
                id: key,
                name: cinema.name,
                showtimes: [],
            });
        }

        cinemaMap.get(key).showtimes.push({
            id_room: screening.id_room,
            time: screening.time_start,
            showtype: screening.showtype,
        });

    }
    
    result.cinemas = Array.from(cinemaMap.values());

    return result;
};

module.exports = { getScreeings, getScreeningByMovieId, getScreeingById}