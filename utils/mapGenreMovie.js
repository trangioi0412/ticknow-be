const genreService = require('../service/genres.service');


const mapGenreMovie  = async ( movies ) => {

    const genres = await genreService.getGenres();
    const genreMap =  new Map();
    genres.genres.forEach(genre => {
        genreMap.set(genre._id.toString(), genre.name);
    });

    const result = movies.map( movie => {
        const mappedGenres = movie.genre.map(genre => (
            {
                id: genre.id,
                name: genreMap.get(genre.id.toString())
            }
        ))
        
        return {
            ...movie.toObject(),
            genre: mappedGenres
        }
    })
    return result;

}

const mapGenreMovieOne  = async ( movie ) => {
    
    const genres = await genreService.getGenres();
    const genreMap =  new Map();
    
    genres.genres.forEach(genre => {
        genreMap.set(genre._id.toString(), genre.name);
    });

     const mappedGenres = movie.genre.map(g => ({
        id: g.id,
        name: genreMap.get(g.id.toString()) || null,
    }));

    return {
        ...movie.toObject(),
        genre: mappedGenres
    }

}

module.exports = { mapGenreMovie, mapGenreMovieOne }