const cron = require('node-cron');

const ticketModel = require('../model/ticket.model');
const ticketService = require('../service/ticket.service');

cron.schedule('* * * * *', async () => {
    const now = new Date();
    const expiredOrders = await ticketModel.find({
        status: 1,
        autoDeleteAt: { $lte: now }
    });

    for (const ticket of expiredOrders) {
        await ticketService.cancelTicket(ticket._id);
    }
    console.log("So luong ve da doi ", expiredOrders.length);
});