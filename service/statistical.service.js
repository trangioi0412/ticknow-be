
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

    filter.type = 2

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
                type: 2,
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

const revenueEachDayInMonth = async (year, month) => {
    const startOfMonth = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`);
    const endOfMonth = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const ticket = await ticketModel.aggregate([
        {
            $match: {
                type: 2,
                createdAt: {
                    $gte: startOfMonth,
                    $lt: endOfMonth
                }
            }
        },
        {
            $project: {
                day: { $dayOfMonth: "$createdAt" },
                price: { $toInt: "$price" }
            }
        },
        {
            $group: {
                _id: "$day",
                totalRevenue: { $sum: "$price" },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { "_id": 1 }
        }
    ]);

    const daysInMonth = new Date(year, month, 0).getDate();

    const fullDayData = Array.from({ length: daysInMonth }, (_, index) => {
        const data = ticket.find(item => item._id === index + 1);
        return {
            day: index + 1,
            totalRevenue: data ? data.totalRevenue : 0,
            count: data ? data.count : 0
        };
    });

    return fullDayData;
};


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

const statisticalCinema = async (startDay, endDay, pages, limits) => {

    let filter = {};

    filter.type = 2

    if (startDay && endDay) {
        const start = new Date(`${startDay}T00:00:00.000Z`);
        const end = new Date(`${endDay}T23:59:59.999Z`);
        filter.createdAt = { $gte: start, $lte: end };
    }

    let tickets = await ticketModel.find(filter).populate({
        path: 'id_screening',
        populate: {
            path: 'id_room',
            populate: {
                path: 'id_cinema'
            }
        }
    })

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

    let result = Object.values(cinemaRevenueMap);
    const total = result.length;

    if (pages && limits) {

        const pageNum = parseInt(pages);
        const limitNum = parseInt(limits);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;

        result = result.slice(startIndex, endIndex);

        return {
            data: result,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum
            }
        };
    }

    return {
        data: result,
        pagination: {
            total,
            page: 1,
            limit: total
        }
    };
}

const statisticalMovie = async (startDay, endDay, pages = 1, limits, sort = false, filter = {}, movie) => {

    filter.type = 2

    if (startDay && endDay) {
        const start = new Date(`${startDay}T00:00:00.000Z`);
        const end = new Date(`${endDay}T23:59:59.999Z`);
        filter.createdAt = { $gte: start, $lte: end };
    }

    let tickets = await ticketModel.find(filter)
        .populate({
            path: 'id_screening',
            populate: {
                path: 'id_movie',
                match:{
                    name: new RegExp(movie, 'i')
                }
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

    let result = Object.values(movieRevenueMap);

    if (sort) {
        result = result.sort((a, b) => b.totalRevenue - a.totalRevenue);
    }


    const total = result.length;

    if (pages && limits) {

        const pageNum = parseInt(pages);
        const limitNum = parseInt(limits);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;

        result = result.slice(startIndex, endIndex);

        return {
            data: result,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum
            }
        };
    }

    return {
        data: result,
        pagination: {
            total,
            page: 1,
            limit: total
        }
    };

}

module.exports = { statisticalByType, revenueEachMonthInYear, newUserDay, statisticalCinema, statisticalMovie, revenueEachDayInMonth }