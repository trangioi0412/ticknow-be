const mongoose = require('mongoose');

const paginate = require('../utils/pagination');
const generateUniqueTicketCode = require('../utils/randomCodeTicket');
const refundPayment = require('../utils/refundPayment.utils');

const ticketModel = require('../model/ticket.model');
const rateModel = require('../model/rates.model');
const moviesModel = require('../model/movies.model');
const cinemasModel = require('../model/cinemas.model');

const screeningService = require('./screening.service')
const usersService = require('./user.service');
const roomService = require('./room.service');
const voucherService = require('./vouchers.service');



const getTicket = async (filter, page = "", limit = "", sort) => {

    const movieService = require('./movie.service');

    const screenings = await screeningService.getScreeings();

    const screeningMap = new Map();
    const movieMap = new Map();
    const roomMap = new Map();
    const cinemaMap = new Map();

    await Promise.all(
        screenings.result.map(async (screening) => {
            const [cinemaRoom, movieInfo] = await Promise.all([
                roomService.roomById(screening.id_room),
                movieService.getMovieById(screening.id_movie),
            ]);

            const screeningId = screening._id.toString();

            screeningMap.set(screeningId, screening.time_start);
            movieMap.set(screeningId, { id: movieInfo._id, name: movieInfo.name });
            roomMap.set(screeningId, {
                id: cinemaRoom.id_room,
                code: cinemaRoom.code_room,
            });
            cinemaMap.set(screeningId, {
                id: cinemaRoom.id_cinema,
                name: cinemaRoom.name_cinema,
            });
        })
    );

    const users = await usersService.getUsers();
    const userMap = new Map();

    users.user.forEach(user => {
        userMap.set(user._id.toString(), user.name);
    });

    const { data, pagination } = await paginate.paginateQuery(ticketModel, filter, page, limit, sort);

    const tickets = await Promise.all(data.map(async ticket => {
        const screeningId = ticket.id_screening.toString();
        const movies = movieMap.get(screeningId)

        const rate = await rateModel
            .findOne({ id_movie: movies.id, id_ticket: ticket._id })
            .select('is_active');

        return {
            ...ticket.toObject(),
            userName: userMap.get(ticket.id_user.toString()),
            screeningTime: screeningMap.get(screeningId),
            movie: movies.name,
            room: roomMap.get(screeningId),
            cinema: cinemaMap.get(screeningId),
            status_cmt: rate?.is_active,
        };
    }));


    return {
        tickets,
        pagination,
    };
};


const filterTicket = async (filter) => {
    const tickets = await ticketModel.find(filter);

    if (!tickets) {
        throw new Error('Không có vé phù hợp');
    }

    return tickets;
}

const getTicketId = async (id) => {
    const ticket = await ticketModel.findById(id);
    return ticket
}

const getDetail = async (id) => {
    const movieService = require('./movie.service');

    const ticket = await ticketModel.findById(id);

    if (!ticket || (typeof ticket === 'object' && Object.keys(ticket).length === 0)) {
        throw new Error("Không tìm thấy vé")
    }

    const user = await usersService.getUserDetail(ticket.id_user);

    if (!user || (typeof user === 'object' && Object.keys(user).length === 0)) {
        throw new Error("Không tìm thấy user")
    }

    const screening = await screeningService.getScreeingById(ticket.id_screening);

    if (!screening || (typeof screening === 'object' && Object.keys(screening).length === 0)) {
        throw new Error("Không tìm thấy screening")
    }

    const movie = await movieService.getMovieById(screening.id_movie);

    if (!movie || (typeof movie === 'object' && Object.keys(movie).length === 0)) {
        throw new Error("Không tìm thấy movie")
    }

    const rate = await rateModel.findOne({ id_movie: screening.id_movie, id_ticket: id });

    const room = await roomService.roomById(screening.id_room);

    return {
        ticket,
        user,
        screening,
        movie,
        room
    }

}

const addTicket = async (tickets, idUser) => {

    const user = await usersService.getUserDetail(idUser);

    if (!user || (typeof user === 'object' && Object.keys(user).length === 0)) {
        throw new Error("Thông tin user không tồn tại")
    }

    const screening = await screeningService.getScreeingById(tickets.screening);

    if (!screening || (typeof screening === 'object' && Object.keys(screening).length === 0) || screening.status !== 2) {
        throw new Error("Suất chiếu không tồn tại hoặc không còn hoạt động")
    }

    const movie = await moviesModel.findById(screening.id_movie)

    const rooms = await screeningService.screeningRoom(tickets.screening);
    const isExist = tickets.seat.some(seat => {

        const row = seat[0];
        const seatNumber = parseInt(seat.slice(1));
        const selected = rooms.room.diagram.element_selected?.[row];
        return Array.isArray(selected) && selected.includes(seatNumber);

    });

    if (isExist) {
        throw new Error("Ghế đã được đặt! Vui lòng chọn ghế khác.");
    }

    const { screening: id_screening, voucher: id_voucher, ...rest } = tickets;

    const newTickets = {
        ...rest,
        id_screening,
        id_user: idUser,
    }

    if (id_voucher && typeof id_voucher === "string" && id_voucher.length === 24) {
        newTickets.id_voucher = mongoose.Types.ObjectId.isValid(id_voucher) ? id_voucher : null;
    }

    const newTicket = await ticketModel.create(newTickets);

    const seats = tickets.seat.flatMap(seat => {
        const row = seat[0];
        const numbers = seat.slice(1);
        return numbers.split('').map(n => row + n);
    });



    return newTicket;
}

const checkticket = async (tickets, idUser) => {
    const user = await usersService.getUserDetail(idUser);

    if (!user || (typeof user === 'object' && Object.keys(user).length === 0)) {
        throw new Error("Thông tin user không tồn tại")
    }

    const screening = await screeningService.getScreeingById(tickets.screening);

    if (!screening || (typeof screening === 'object' && Object.keys(screening).length === 0) || screening.status !== 2) {
        throw new Error("Suất chiếu không tồn tại hoặc không còn hoạt động")
    }

    const rooms = await screeningService.screeningRoom(tickets.screening);
    const isExist = tickets.seat.some(seat => {

        const row = seat[0];
        const seatNumber = parseInt(seat.slice(1));
        const selected = rooms.room.diagram.element_selected?.[row];
        return Array.isArray(selected) && selected.includes(seatNumber);

    });

    if (isExist) {
        throw new Error("Ghế đã được đặt! Vui lòng chọn ghế khác.");
    }


    // if (tickets.voucher) {
    //     const voucher = await voucherService.getDetail(tickets.voucher);
    //     console.log(voucher)
    //     const now = new Date();

    //     const isInvalid =
    //         !voucher ||
    //         (typeof voucher === 'object' && Object.keys(voucher).length === 0) ||
    //         voucher.is_active !== 2 ||
    //         voucher.max_users <= voucher.user_count ||
    //         new Date(voucher.start_date) > now ||
    //         new Date(voucher.end_date) < now;

    //     if (isInvalid) {
    //         throw new Error("Voucher không hợp lệ hoặc không còn hiệu lực");
    //     }

    // }

}

const cancelTicket = async (id) => {
    const ticket = await ticketModel.findById(id);

    if (!ticket) {
        throw new Error('Không tìm thấy ticket đểcancel');
    }

    if (ticket.type == 2) {
        throw new Error('Đơn hàng này đã được thanh toán không thể xóa');
    }

    await ticketModel.findByIdAndDelete(id);
}

const cancelRefund = async (orderCode) => {
    const ticket = await ticketModel.findOne({ code: orderCode });

    if (!ticket) {
        throw new Error("Không tìm thấy vé");
    }

    if (ticket.type === 3) {
        throw new Error('Vé đã bị hủy trước đó');
    }

    ticket.type = 3;
    await ticket.save();

    const refundResult = await refundPayment(ticket.code, ticket.price);

    if (!refundResult.success) {
        console.error('Lỗi hoàn tiền PayOS:', refundResult.error); 
        throw new Error('Hủy vé thành công nhưng hoàn tiền thất bại');
    }

    return {
        success: true,
        message: 'Hủy vé và hoàn tiền thành công',
        refund: refundResult.data
    };

}

module.exports = { getTicket, filterTicket, getTicketId, addTicket, getDetail, checkticket, cancelTicket, cancelRefund }