const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const cinemaService = require('../service/cinema.service')

const check = require('../utils/checkDateQuery');

const getUploader = require('../middlewares/uploadFile');

const upload = getUploader()

const getCinema = async (req, res, next) => {
    try {

        const limit = parseInt(req.query.limit);

        const page = parseInt(req.query.page);

        const result = await cinemaService.getCinema(page, limit);

        if (!result) {
            return res.status(404).json({ status: false, message: "Lấy dữ liệu thật bại" })
        }

        return res.status(200).json({ data: result, status: true, message: 'Lấy dữ liệu thành công' })


    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

const getDetail = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { date } = req.query;

        const filter = {};

        if (date) filter.date = check.checkDate(date);

        let result = await cinemaService.cinemaDetail(id, filter);

        if (result) {

            return res.status(200).json({ data: result, status: true, message: 'Lấy dữ liệu thành công' })

        } else {

            return res.status(404).json({ status: false, message: 'Lấy dữ liệu thất bại' })

        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

const addCinema = [
    upload.single('image'),
    async (req, res, next) => {
        try {
            const cinema = req.body;
            const file = req.file

            const result = await cinemaService.addCinema(cinema, file);
            if (!result) {
                res.status(404).json({ status: false, message: " Thêm Dữ Liệu Không Thành Công " })
            }

            res.status(200).json({ data: result, status: true, message: " Thêm cinema Thành Công " })
        } catch (error) {

            console.error(error);
            res.status(500).json({ status: false, message: error.message });
        }
    }
]

const deleteCinema = async (req, res, next) => {
    try{

        const { id } = req.params;

        if(!id){
            return res.status(401).json({status: false, message: "Id Không hợp lệ"});
        }

        const result = await cinemaService.deleteCinema(id);

        return res.status(200).json({ status: true, message: "Xóa rạp thành công"})
    }catch (error) {
        console.error(error);
        return res.status(500).json({status: false, message: error.message})
    }
}

const updateCinema = [
    upload.single('image'),
    async (req, res, next) => {
        try {
            const cinema = req.body;

            const file = req.file

            const result = await cinemaService.updateCinema(cinema, file);

            if (!result) {
                res.status(404).json({ status: false, message: " Sửa Dữ Liệu Không Thành Công " })
            }

            res.status(200).json({ data: result, status: true, message: " Sửa cinema Thành Công " })
        } catch (error) {

            console.error(error);
            res.status(500).json({ status: false, message: error.message });
        }
    }
]


module.exports = { getCinema, getDetail, addCinema, deleteCinema, updateCinema }