const paginate = require('../utils/pagination');

const transitionModel = require('../model/transition.model');

const ticketService = require('../service/ticket.service');
const payMethodService = require('../service/payMethods.service'); 

const getAll = async (page, limit) => {

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

    const { data, pagination } = await paginate.paginateQuery(transitionModel, {}, page, limit);

    const result = transitions.map(trasition => {
        const payMethodName = payMethodMap.get(trasition.id_payMethod);
    })

    return {
        data,
        pagination
    };

}

module.exports = { getAll }