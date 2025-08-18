const cron = require('node-cron');

const ticketService = require('../service/ticket.service');

cron.schedule('* * * * *', async () => {
    try {
        const result = await ticketService.remindTicket();
        console.log("đã gửi mail nhắc nhở vé xem phim: ",result)
    } catch (error) {
        console.error('Cron job lỗi:', error);
    }
})
