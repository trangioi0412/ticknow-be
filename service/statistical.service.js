
const ticketService = require('./ticket.service')
const ticketModel = require('../model/ticket.model');
const usersService = require('../service/user.service');

const statisticalByType = async (type, value) => {
    let filter = {}
    let start, end;

    if (!value) {
        throw new Error("Thiếu giá trị thời gian");
    }

    switch (type) {
        case 'day':
            start = new Date(`${value}T00:00:00.000Z`);
            end = new Date(`${value}T23:59:59.999Z`);
            break;

        case 'month': {
            const [year, month] = value.split('-').map(Number);
            start = new Date(Date.UTC(year, month - 1, 1));
            end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
            break;
        }

        case 'year': {
            const year = parseInt(value);
            start = new Date(Date.UTC(year, 0, 1));
            end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
            break;
        }

        default:
            throw new Error("Loại thống kê không hợp lệ");
    }


    filter.createdAt = {
        $gte: start,
        $lte: end
    }

    const { tickets } = await ticketService.getTicket(filter);

    const revenue = tickets.reduce((sum, item) => {
        return sum + parseInt(item.price || 0);
    }, 0)

    return {
        count: tickets.length,
        totalRevenue: revenue
    }
}

const revenueEachMonthInYear = async (year) => {
    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);


    const ticket = await ticketModel.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startOfYear,
                    $lt: endOfYear
                }
            }
        },
        {
            $project: {
                month: { $month: "$createdAt" },
                price: { $toInt: "$price" }
            }
        },
        {
            $group: {
                _id: "$month",
                totalRevenue: { $sum: "$price" },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { "_id": 1 },
        }
    ]);

    const fullMonthData = Array.from({ length: 12 }, (_, index) => {
        const data = ticket.find(item => item._id === index + 1);
        return {
            month: index + 1,
            totalRevenue: data ? data.totalRevenue : 0,
            count: data ? data.count : 0
        };
    });
    return fullMonthData
}

const newUserDay = async (type, value) => {
    let filter = {}
    let start, end;

    if (!value) {
        throw new Error("Thiếu giá trị thời gian");
    }

    switch (type) {
        case 'day':
            start = new Date(`${value}T00:00:00.000Z`);
            end = new Date(`${value}T23:59:59.999Z`);
            break;

        case 'month': {
            const [year, month] = value.split('-').map(Number);
            start = new Date(Date.UTC(year, month - 1, 1));
            end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
            break;
        }

        case 'year': {
            const year = parseInt(value);
            start = new Date(Date.UTC(year, 0, 1));
            end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
            break;
        }

        default:
            throw new Error("Loại thống kê không hợp lệ");
    }


    filter.createdAt = {
        $gte: start,
        $lte: end
    }

    const { user } = await usersService.getUsers(filter);

    return {
        count: user.length,
    }
}

const statisticalCinema = async (startDay, endDay) => {

    let filter = {};

    if (startDay && endDay) {
        const start = new Date(`${startDay}T00:00:00.000Z`);
        const end = new Date(`${endDay}T23:59:59.999Z`);
        filter.createdAt = { $gte: start, $lte: end };
    }

    const tickets = await ticketModel.find(filter).populate({
        path: 'id_screening',
        populate: {
            path: 'id_room',
            populate: {
                path: 'id_cinema'
            }
        }
    });

    const cinemaRevenueMap = {};

    tickets.forEach(ticket => {
        const screening = ticket.id_screening;
        const room = screening?.id_room;
        const cinema = room?.id_cinema;

        if (!cinema || !ticket.price) return;
        const cinemaId = cinema._id.toString();

        if (!cinemaRevenueMap[cinemaId]) {
            cinemaRevenueMap[cinemaId] = {
                cinemaId: cinema._id,
                cinemaName: cinema.name,
                totalRevenue: 0,
                ticketCount: 0
            };
        }

        cinemaRevenueMap[cinemaId].totalRevenue += ticket.price;
        cinemaRevenueMap[cinemaId].ticketCount += 1;
    });

    const result = Object.values(cinemaRevenueMap);

    return result
}

const statisticalMovie = async (startDay, endDay) => {

    let start = new Date(`${startDay}T00:00:00.000Z`);
    let end = new Date(`${endDay}T23:59:59.999Z`);

    const tickets = await ticketModel.find({
        createdAt: {
            $gte: start,
            $lte: end
        }
    }).populate({
        path: 'id_screening',
        populate: {
            path: 'id_movie',
        }
    });

    const movieRevenueMap = {};

    tickets.forEach(ticket => {
        const screening = ticket.id_screening;
        const movie = screening?.id_movie;

        if (!movie || !ticket.price) return;
        const movieId = movie._id.toString();

        if (!movieRevenueMap[movieId]) {
            movieRevenueMap[movieId] = {
                movieId: movie._id,
                movieName: movie.name,
                totalRevenue: 0,
                ticketCount: 0
            };
        }

        movieRevenueMap[movieId].totalRevenue += ticket.price;
        movieRevenueMap[movieId].ticketCount += 1;
    });

    const result = Object.values(movieRevenueMap);

    return result;

}

module.exports = { statisticalByType, revenueEachMonthInYear, newUserDay, statisticalCinema, statisticalMovie }