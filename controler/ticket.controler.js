const ticketModel = require('../model/ticket.model');
const screeningService = require('../service/screening.service');
const usersService = require('../service/user.service');


const getTickets = async () => {
    try {
        const screenings = await screeningService.getScreeings();
        const screeningMap = new Map();

        screenings.forEach( screening => {
            screeningMap.set(screening._id.toString(), screening.time_start)
        })

        const users = await usersService.getUsers();
        const userMap = new Map();

        users.data.forEach(user => {
            userMap.set(user._id.toString(), user.name);
        })

        const tickets = await ticketModel.find();

        const result = tickets.map(ticket => {
            const screeningId = ticket.id_screening.toString();
            const screeningTime = screeningMap.get(screeningId);

            const userId = ticket.id_user.toString();
            const userName = userMap.get(userId);

            return {
                ...ticket.toObject(),
                userName: userName,
                screeningTime: screeningTime
            }
        })
        
        return result;

    } catch (error) {
        console.error(error)
        throw new Error("Lấy dữ liệu không thành công");
    }
}

module.exports = { getTickets }
