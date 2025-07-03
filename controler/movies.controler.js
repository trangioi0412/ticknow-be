const check = require('../utils/checkDateQuery');

const movieService = require('../service/movie.service');

const getUploader = require('../middlewares/uploadFile');

const upload = getUploader()

const getMovies = async (req, res, next) => {
    try {

        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sort = { [sortField]: sortOrder };

        const { name, status, date } = req.query;

        const limit = parseInt(req.query.limit);

        const page = parseInt(req.query.page);

        let filter = {};

        let result
  
        if (status) filter.status = status;

        if (date) filter.release_date = check.checkDate(date);

        if (name) {
            filter.name = new RegExp(name, 'i');
        }

        result = await movieService.getMovies(filter, limit, page, sort);

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

        let result = await movieService.getDetailMovie(id, filter);

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

const filterMovie = async (req, res, next) => {
    try {
        // query host
        const { name, status, date, genre, cinema } = req.query;

        const limit = parseInt(req.query.limit);

        const page = parseInt(req.query.page);

        // create variable storage
        let filter = {};

        let result

        // check variable  
        if (status) filter.status = status;

        if (cinema) filter.cinema = cinema;

        if (date) filter.date = check.checkDate(date);


        if (name) {
            filter.name = new RegExp(name, 'i');
        }

        // get data
        result = await movieService.filterMovie(filter, genre, limit, page);

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

const filterSChedule = async (req, res, next) => {
    try {
        // query host

        const { status, date, cinema, id } = req.query;

        const limit = parseInt(req.query.limit);

        const page = parseInt(req.query.page);

        // create variable storage
        let filter = {};

        let result

        // check variable  
        if (status) filter.status = status;

        if (date) filter.date = check.checkDate(date);

        if (id) filter.id = id;

        // get data
        result = await movieService.filterSchedule(filter, cinema, limit, page);

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

const addMovie = [
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "banner", maxCount: 1 }
    ]),
    async (req, res, next) => {
        try {
            const movie = req.body;
            const file = req.files

            const result = await movieService.addMovies(movie, file);
            if (!result) {
                res.status(404).json({ status: false, message: " Thêm Dữ Liệu Không Thành Công " })
            }

            res.status(200).json({ data: result, status: true, message: " Thêm Movie Thành Công " })
        } catch (error) {

            console.error(error);
            res.status(500).json({ status: false, message: error.message });
        }
    }
]

const deleteMovie = async (req, res, next) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(401).json({ status: false, message: "Id Không hợp lệ" });
        }

        const result = await movieService.deleteMovie(id);

        return res.status(200).json({ status: true, message: "Xóa phim thành công" })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

const updateMovie = [
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "banner", maxCount: 1 }
    ]),
    async (req, res, next) => {
        try {
            const movie = req.body;

            const { id } = req.params;

            if (!id) {
                res.status(404).json({ status: false, message: " Vui lòng truyền id " })
            }

            const file = req.files || {};

            const result = await movieService.updateMovie(movie, file, id);

            if (!result) {
                res.status(404).json({ status: false, message: " Sửa Dữ Liệu Không Thành Công " })
            }

            res.status(200).json({ data: result, status: true, message: " Sửa Movie Thành Công " })
        } catch (error) {

            console.error(error);
            res.status(500).json({ status: false, message: error.message });
        }
    }
]


module.exports = { getMovies, getDetailMovie, filterMovie, filterSChedule, addMovie, deleteMovie, updateMovie };
