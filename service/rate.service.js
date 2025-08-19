const paginate = require('../utils/pagination');

const rateModel = require('../model/rates.model');

const ticketService = require('../service/ticket.service');

const mongoose = require('mongoose');

const userService = require('./user.service');

const { geminiApi } = require('../utils/gemini_api');


const getAll = async (filter, page, limit, sort) => {

    const total = await rateModel.countDocuments(filter);

    let skip = 0;
    if (page && limit) {
        page = parseInt(page);
        limit = parseInt(limit);
        skip = (page - 1) * limit;
    } else {
        page = 1;
        limit = total;
    }

    let query = rateModel.find(filter)
        .skip(skip)
        .limit(limit)
        .populate([
            {
                path: 'id_ticket',
                populate: {
                    path: 'id_user',
                    select: 'name'
                }
            },
            {
                path: 'id_movie',
                select: 'name'
            }
        ]);

    if (sort) {
        query = query.sort(sort);
    }

    const rateDocs = await query;

    const rates = rateDocs.map(item => {
        const user = item.id_ticket?.id_user || null;
        const movie = item.id_movie;
        const plain = item.toObject();
        return {
            ...plain,
            id_ticket: item.id_ticket?._id,
            id_movie: movie?._id,
            userName: user?.name || null,
            movieName: movie?.name || null
        };
    });


    const totalPages = Math.ceil(total / limit);

    return {
        data: rates,
        pagination: {
            total,
            totalPages,
            page,
            limit
        }
    };
}


const getByIdMovie = async (movieId, page, limit) => {

    const filter = { id_movie: movieId, is_active: 3 };

    const total = await rateModel.countDocuments(filter);

    let skip = 0;
    if (page && limit) {
        page = parseInt(page);
        limit = parseInt(limit);
        skip = (page - 1) * limit;
    } else {
        page = 1;
        limit = total;
    }

    let rate = await rateModel.find(filter)
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'id_ticket',
            populate: {
                path: 'id_user',
                select: '-password -__v'
            }
        });

    const rates = rate.map(item => {
        const user = item.id_ticket?.id_user || null;
        const plain = item.toObject();
        delete plain.id_ticket;

        return {
            ...plain,
            user
        };
    });

    const totalPages = Math.ceil(total / limit);

    return {
        data: rates,
        pagination: {
            total,
            totalPages,
            page,
            limit
        }
    };
};


const addRate = async (rateData) => {
    const movieService = require('../service/movie.service');

    const ticket = await ticketService.getTicketId(rateData.id_ticket);
    if (!ticket) {
        throw new Error("Vé không hợp lệ")
    }

    const movie = await movieService.getMovieId(rateData.id_movie);

    if (!movie) {
        throw new Error("Phim Không hợp lệ");
    }

    const newRate = await rateModel.create(rateData);

    return newRate;
}

const updateRate = async (rateData) => {
    const movieService = require('../service/movie.service');

    const movie = await movieService.getMovieId(rateData.movie);
    if (!movie) {
        throw new Error("Phim không hợp lệ");
    }

    const rates = await rateModel.findOne({
        _id: new mongoose.Types.ObjectId(rateData._id),
        id_movie: new mongoose.Types.ObjectId(movie._id),
        id_ticket: new mongoose.Types.ObjectId(rateData.ticket)
    });

    console.log(rateData._id);

    if (!rates) {
        throw new Error("Không tìm thấy đánh giá để cập nhật");
    }

    if (!rateData.score || rateData.score <= 0) {
        throw new Error("Vui lòng chọn số sao và số phải lớn hơn 0");
    }

    rateData.is_active = 3;

    if (rateData.comment && rateData.comment != "") {
        const message = `
        Bạn là hệ thống kiểm duyệt. Hãy phân loại comment sau:
        "${rateData.comment}"
        Trả về JSON hợp lệ:
        { "is_active": 3 } nếu bình thường,
        hoặc { "is_active": 4, "reason": "lý do" } nếu phản cảm/thô tục.
        `;

        try {
            const reply = await geminiApi(message);
            const cleaned = reply
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            const output = JSON.parse(cleaned);

            if (output && output.is_active || output.is_active == 4) {
                throw new Error(output.reason);
            }
        } catch (err) {
            console.error("Lỗi kiểm duyệt Gemini:", err);
        }
    }

    const rate = await rateModel.findByIdAndUpdate(rates._id, rateData, { new: true });

    await movieService.updateRate(rateData.movie);

    return rate;
}


module.exports = { getAll, getByIdMovie, addRate, updateRate }