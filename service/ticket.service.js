const mongoose = require('mongoose');

const paginate = require('../utils/pagination');
const generateUniqueTicketCode = require('../utils/randomCodeTicket');
const refundPayment = require('../utils/refundPayment.utils');

const ticketModel = require('../model/ticket.model');
const rateModel = require('../model/rates.model');
const moviesModel = require('../model/movies.model');
const screeningModel = require('../model/screening.model');
const cinemasModel = require('../model/cinemas.model');

const screeningService = require('./screening.service')
const usersService = require('./user.service');
const roomService = require('./room.service');
const voucherService = require('./vouchers.service');
const sendMail = require('../utils/send.mail');
const usersModel = require('../model/users.model');



const getTicket = async (filter, page = "", limit = "", sort, movieId = "") => {

    let skip = 0;
    if (page && limit) {
        page = parseInt(page);
        limit = parseInt(limit);
        skip = (page - 1) * limit;
    } else {
        page = 1;
        limit = total;
    }

    let screeningIds = undefined;

    if (movieId) {
        const screenings = await screeningModel.find({ id_movie: movieId }, '_id');
        screeningIds = screenings.map(s => s._id);
        filter.id_screening = { $in: screeningIds };
    }

    let ticket = ticketModel.find(filter)
        .skip(skip)
        .limit(limit)
        .populate([
            { path: 'id_user', select: '_id name' },
            {
                path: 'id_screening',
                select: 'time_start',
                populate: [
                    { path: 'id_movie', select: 'name' },
                    {
                        path: 'id_room',
                        select: '_id code_room',
                        populate: { path: 'id_cinema', select: '_id name' }
                    }
                ]
            },
            { path: 'rates', select: 'is_active' }
        ])

    if (sort) {
        ticket = ticket.sort(sort);
    }

    const ticketDocs = await ticket;


    const tickets = ticketDocs.map(item => {
        const id_user = item.id_user?._id || null;
        const userName = item.id_user?.name || null;
        const movie = item.id_screening.id_movie.name;
        const room = {
            id: item.id_screening.id_room._id,
            code: item.id_screening.id_room.code_room
        }

        const cinema = {
            id: item.id_screening.id_movie._id,
            name: item.id_screening.id_movie.name
        }

        const id_screening = item.id_screening._id
        const screeningTime = item.id_screening.time_start
        const status_cmt = item.rates?.[0]?.is_active ?? null;

        const plain = item.toObject();
        delete plain.id_user;
        delete plain.id_movie;
        delete plain.id_screening;
        delete plain.rates;
        delete plain.id;
        return {
            ...plain,
            id_ticket: item.id_ticket?._id,
            id_user,
            userName,
            movie: movie,
            id_screening,
            screeningTime,
            room,
            cinema,
            status_cmt
        };
    });

    const total = tickets.length;

    const totalPages = Math.ceil(total / limit);

    return {
        tickets,
        pagination: {
            total,
            totalPages,
            page,
            limit
        }
    }

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

const cancelRefund = async (id) => {
    const ticket = await ticketModel.findById(id)
        .populate({
            path: 'id_screening',
            select: 'status'
        });

    const user = await usersModel.findById(ticket.id_user);

    if (!ticket) {
        throw new Error("Không tìm thấy vé");
    }

    if (ticket.type == 1 || ticket.type == 3) {
        throw new Error('Vé đã bị hủy trước đó hoặc chưa thanh toán');
    }

    if (ticket.id_screening.status == 1) {
        throw new Error('Suất đã chiếu không thể hủy vé');
    }

    ticket.type = 3;
    await ticket.save();
    await sendMail({
        email: user.email,
        subject: "🎬 TICKNOW - Thông báo hủy vé & hướng dẫn hoàn tiền",
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #f2f2f2; padding: 20px; color: #333;">
              <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <div style="background-color: #d32f2f; color: #fff; padding: 20px; text-align: center;">
                  <h2 style="margin: 0;">🎬 Thông báo hủy vé & hoàn tiền</h2>
                </div>
                
                <div style="padding: 25px;">
                  <p style="font-size: 16px;">Kính gửi Quý khách,</p>
                
                  <p style="font-size: 15px;">Chúng tôi xin thông báo rằng vé xem phim của Quý khách đã bị <strong style="color: #d32f2f;">hủy</strong>.</p>
                
                  <p style="font-size: 15px;">Để tiến hành <strong style="color: #2e7d32;">hoàn tiền</strong>, vui lòng phản hồi email này và cung cấp:</p>
                
                  <ul style="font-size: 15px; padding-left: 20px; line-height: 1.6;">
                    <li>📷 Hình ảnh vé xem phim (nếu có)</li>
                    <li>🔢 Mã vé</li>
                    <li>🧑 Họ tên người đặt vé</li>
                    <li>📞 Số điện thoại liên hệ</li>
                    <li>🏦 Số tài khoản ngân hàng</li>
                    <li>🏛️ Tên ngân hàng</li>
                  </ul>
                
                  <p style="font-size: 15px;">Chúng tôi sẽ xử lý hoàn tiền trong vòng <strong style="color: #1976d2;">3–5 ngày làm việc</strong> sau khi nhận đầy đủ thông tin.</p>
                
                  <p style="font-size: 15px;">Chúng tôi xin lỗi vì sự bất tiện này và rất mong nhận được sự thông cảm từ Quý khách.</p>
                
                  <p style="margin-top: 30px; font-size: 15px;">--<br>
                    <strong style="color: #d32f2f;">TickNow</strong><br>
                    📧 Email: <a href="mailto:trangioi04122005@gmail.com" style="color: #1976d2; text-decoration: none;">trangioi04122005@gmail.com</a><br>
                    ☎️ Hotline: <a href="tel:0375837534" style="color: #1976d2; text-decoration: none;">0375 837 534</a>
                  </p>
                </div>
                
                <div style="background-color: #f1f1f1; text-align: center; padding: 10px; font-size: 13px; color: #666;">
                  © 2025 TickNow. Cảm ơn Quý khách đã đồng hành cùng chúng tôi.
                </div>
              </div>
            </div>
        `
    })

    await rateModel.updateMany({
        id_ticket: ticket._id,
    },
        {
            $set: { is_active: 4 },
        }
    );

    return 'Hủy vé thành công'

}

module.exports = { getTicket, filterTicket, getTicketId, addTicket, getDetail, checkticket, cancelTicket, cancelRefund }