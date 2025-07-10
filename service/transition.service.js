const paginate = require('../utils/pagination');

const transitionModel = require('../model/transition.model');

const ticketService = require('../service/ticket.service');
const payMethodService = require('../service/payMethods.service'); 

const getAll = async (filter, page, limit, sort) => {

    const tickets = await ticketService.getTicket();
    const ticketMap = new Map();
    tickets.ticket.forEach(ticket => {
        ticketMap.set(ticket._id, ticket)
    });

    const payMethods = await payMethodService.getAll();
    const payMethodMap = new Map();
    payMethods.payMethod.forEach(payMethod => {
        payMethodMap.set(payMethod._id, payMethod.name)
    })

    const { data, pagination } = await paginate.paginateQuery(transitionModel, filter, page, limit, sort);

    return {
        data,
        pagination
    };

}

const addTransition = async ( transitionData ) => {

    const ticket = await ticketService.getTicketId( transitionData.id_ticket );

    if (!ticket || (typeof ticket === 'object' && Object.keys(ticket).length === 0)) {
        throw new Error("Thông tin ticket không tồn tại")
    }

    const payMethod = await payMethodService.payMethodDetail( transitionData.id_payMethod );

    if(!payMethod || (typeof payMethod === 'object' && Object.keys(payMethod).length === 0)){
        throw new Error("Thông tin payMethod không tồn tại")
    }

    
}

module.exports = { getAll, addTransition }