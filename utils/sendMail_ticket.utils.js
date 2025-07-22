const sendMail = require("../utils/send.mail");

const moviesModel = require('../model/movies.model');

const screeningService = require('../service/screening.service')
const usersService = require('../service/user.service');

const sendMailTicket = async (tickets) => {

    const user = await usersService.getUserDetail(tickets.id_user);

    if (!user || (typeof user === 'object' && Object.keys(user).length === 0)) {
        throw new Error("Thông tin user không tồn tại")
    }

    const screening = await screeningService.getScreeingById(tickets.id_screening);

    if (!screening || (typeof screening === 'object' && Object.keys(screening).length === 0) || screening.status !== 2) {
        throw new Error("Suất chiếu không tồn tại hoặc không còn hoạt động")
    }

    const movie = await moviesModel.findById(screening.id_movie)

    const rooms = await screeningService.screeningRoom(tickets.id_screening);

    const seats = tickets.seat.flatMap(seat => {
        const row = seat[0];
        const numbers = seat.slice(1);
        return numbers.split('').map(n => row + n);
    });

    await sendMail({
        email: user.email,
        subject: "🎫 Vé của bạn đã được đặt thành công!",
        html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                <h2 style="background: #4CAF50; color: white; padding: 10px;">🎉 Đặt Vé Thành Công</h2>
                <p>Xin chào <strong>${user.name}</strong>,</p>
                <p>Bạn đã đặt vé thành công với thông tin như sau:</p>
                <div style="background: #f2f2f2; padding: 10px; border-radius: 5px;">
                  <p><strong>Phim:</strong> ${movie.name}</p>
                  <p><strong>Phòng: </strong>${rooms.room.code_room} - <strong>Rạp:</strong> ${rooms.room.cinema}</p>
                  <p><strong>Địa chỉ:</strong> Phòng ${rooms.room.location.deatil_location}, ${rooms.room.location.location}</p>
                  <p><strong>Ghế: </strong>${seats}</p>
                  <p><strong>Suất chiếu:</strong> ${screening.time_start} - ${screening.date}</p>
                  <p><strong>Mã đơn hàng:</strong> ${tickets.code}</p>
                </div>
                <p>Cảm ơn bạn đã sử dụng dịch vụ!</p>
                <p style="font-size: 12px; color: #777;">© 2025 TickNow</p>
              </div>
            `
    })
}

module.exports = sendMailTicket