const check = require('../utils/checkDateQuery');

const movieServiece = require('../service/movie.service');

const getMovies = async (req, res, next) => {
    try {
        // query host
        const { name, status, date } = req.query;

        const limit = parseInt(req.query.limit);

        const page = parseInt(req.query.page);

        // create variable storage
        let filter = {};

        let result

        // check variable  
        if (status) filter.status = status;

        if (date) filter.release_date = check.checkDate(date);

        if (name) {
            filter.name = new RegExp(name, 'i');
        }

        // get data
        result = await movieServiece.getMovies(filter, limit, page);

        // check data
        if (!result) {
            return res.status(404).json({ status: false, message: 'Lấy dữ liệu thất bại' })
        }
        return res.status(200).json({ data: result, status: true, message: 'Lấy dữ liệu thành công' })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Lấy dữ liệu movie thất bại' })
    }
}

const getDetailMovie = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { date, location } = req.query;

        const filter = {};

        if (date) filter.date = check.checkDate(date);

        if (location) {
            filter.location = location;
        }

        let result = await movieServiece.getDetailMovie(id, filter);
        
        if (result) {

            return res.status(200).json({ data: result, status: true, message: 'Lấy dữ liệu thành công' })

        } else {

            return res.status(404).json({ status: false, message: 'Lấy dữ liệu thất bại' })

        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Lấy dữ liệu movie thất bại' })
    }
}

module.exports = { getMovies, getDetailMovie };
