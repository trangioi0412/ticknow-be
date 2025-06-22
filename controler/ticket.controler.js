const ticketService = require('../service/ticket.service');


const getTickets = async (req, res, next) => {
    try {
        const tickets  = await ticketService.getTicket();

        if( !tickets ){
            return res.status(404).json({ status: false, message: 'Lấy dữ liêu không thành công' })
        }

        return res.status(299).json({ data: tickets ,status: true, message: 'Lấy tất cả vé thành công' })

    } catch (error) {
        console.error(error);
        return res.status(500).json({status: false, message: 'Lấy dữ liệu không thành công'})
    }
}

module.exports = { getTickets }
