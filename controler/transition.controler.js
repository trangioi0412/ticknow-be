const transitionModel = require('../model/transition.model');
const ticketControler = require('./ticket.controler');
const payMethodControler = require('../controler/payMethods.controler'); 


const getTransition = async () => {
    try {

        const tickets = await ticketControler.getTickets();
        const ticketMap = new Map();
        tickets.forEach(ticket => {
            ticketMap.set(ticket._id, ticket)
        });

        const payMethods = await payMethodControler.getPayMethod();
        const payMethodMap = new Map();
        payMethods.forEach(payMethod => {
            payMethodMap.set(payMethod._id, payMethod.name)
        })

        const transitions = await transitionModel.find();

        const result = transitions.map( trasition => {
            const payMethodName = payMethodMap.get(trasition.id_payMethod);
        })
        return transitions;

    } catch (error) {
        console.error(error)
        throw new Error("Lấy dữ liệu không thành công");
    }
}

module.exports = { getTransition }