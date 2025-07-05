const mongoose = require("mongoose");

const postService = require('../service/post.service');

const getUploader = require('../middlewares/uploadFile');

const upload = getUploader()

const getPosts = async (req, res, next) => {
    try {

        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sort = { [sortField]: sortOrder };

        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);

        const filter = {};

        const { start_day, end_day, status, user } = req.query;

        if (start_day) {
            const startDate = new Date(start_day);
            startDate.setHours(0, 0, 0, 0);
            filter.start_day = { ...filter.start_day, $gte: startDate };
        }

        if (end_day) {
            const endDate = new Date(end_day);
            endDate.setHours(23, 59, 59, 999);
            filter.end_day = { ...filter.endDate, $lte: endDate };
        }

        if (status) {
            const statusArray = Array.isArray(status) ? status.map(s => Number(s)) : status.split(',').map(sta => Number(sta.trim()));
            filter.status = { $in: statusArray }
        }

        if(user){
            filter.id_user = new mongoose.Types.ObjectId(user);
        }

        const result = await postService.getAll(filter, page, limit, sort);

        if (!result) {
            return res.status(404).json({ status: false, message: "Lấy dữ liệu thật bại" })
        }

        return res.status(200).json({ data: result, status: true, message: 'Lấy dữ liệu thành công' })

    } catch (error) {
        console.error(error.message)
        return res.status(500).json({ status: false, message: error.message })
    }
}

const getDetail = async (req, res, next) => {
    try {

        const { id } = req.params

        const result = await postService.getDetail(id);

        if (!result) {
            return res.status(404).json({ status: false, message: "Lấy dữ liệu thật bại" })
        }

        return res.status(200).json({ data: result, status: true, message: 'Lấy dữ liệu thành công' })

    } catch (error) {
        console.error(error.message)
        return res.status(500).json({ status: false, message: error.message })
    }
}

const addPoster = [
    upload.single('image'),
    async (req, res, next) => {
        try {
            const poster = req.body;

            const file = req.file

            const result = await postService.addPost(poster, file);

            if (!result) {
                res.status(404).json({ status: false, message: " Thêm Dữ Liệu Không Thành Công " })
            }

            res.status(200).json({ data: result, status: true, message: " Thêm poster Thành Công " })
        } catch (error) {

            console.error(error);
            res.status(500).json({ status: false, message: error.message });
        }
    }
]

const updatePost = [
    upload.single('image'),
    async (req, res, next) => {
        try {
            const cinema = req.body;

            const file = req.file

            const { id } = req.params;

            if (!id) {
                res.status(404).json({ status: false, message: " Vui lòng truyền id " })
            }

            const result = await postService.updatepost(cinema, file, id);

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

const deletePost = async (req, res, next) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(401).json({ status: false, message: "Id Không hợp lệ" });
        }

        const result = await postService.deletePost(id);

        return res.status(200).json({ status: true, message: "Xóa rạp thành công" })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}


module.exports = { getPosts, addPoster, updatePost, deletePost, getDetail };
