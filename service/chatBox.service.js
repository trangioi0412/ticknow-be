
const screeningModel = require('../model/screening.model');
const movieModel = require('../model/movies.model');
const genreModel = require('../model/genres.model');
const locationModel = require('../model/location.model');
const cinemasModel = require('../model/cinemas.model');
const roomModel = require('../model/room.model');

async function findMoviesAggregate(entities) {

    const movieCondition = {}
    const genreCondition = {}
    const locationCondition = {}
    const screeningCondition = {}

    let genre;

    if (entities.movie_name) {
        movieCondition.name = new RegExp(entities.movie_name, "i");
    }

    if (entities.genre) {
        genreCondition.name = new RegExp(entities.genre, "i");
        genre = await genreModel.find(genreCondition);
        movieCondition.genre = {};
        movieCondition.genre.id = genre[0]._id;
    }

    if (entities.location) {
        locationCondition.name = new RegExp(entities.location, "i");
        let location = await locationModel.find(locationCondition);
        const cinema = await cinemasModel.find({ "location.id_location": location[0]._id });
        const room = await roomModel.find({ id_cinema: cinema[0]._id })
        const roomIds = room.map(r => r._id);
        screeningCondition.id_room = { $in: roomIds };
    }

    if (entities.date) {
        screeningCondition.date = `${entities.date}T00:00:00.000+00:00`;
    }

    if (entities.time) {
        const [start, end] = entities.time.split('-');
        screeningCondition.time_start = start;
        screeningCondition.time_end = end;
    }

    let movieQuery = movieModel.find(movieCondition);

    if (entities.star) {
        movieQuery = movieQuery.sort({ star: -1 }).limit(entities.limit);
    }

    const movie = await movieQuery;

    if (entities.star) {
        return movie;
    }

    const movieIds = movie.map(m => m._id);

    screeningCondition.id_movie = { $in: movieIds };


    const screening = await screeningModel.find(screeningCondition);
    const screeningIds = screening.map(s => s.id_movie);
    const movies = await movieModel.find({ _id: { $in: screeningIds }, status: 1 });

    return movies
}

module.exports = { findMoviesAggregate }