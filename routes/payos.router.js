require('dotenv').config()

const express = require('express');
const router = express.Router();
const PayOS = require('@payos/node');
const mongoose = require('mongoose');

const screeningModel = require('../model/screening.model')

const { verifyToken } = require('../utils/auth.util');
const generateCinemaCode = require('../utils/randomCodeTicket');
const sendMailTicket = require('../utils/sendMail_ticket.utils');

const ticketService = require('../service/ticket.service');
const ticketModel = require('../model/ticket.model');
const transition = require('../service/transition.service');
const voucherService = require('../service/vouchers.service');
const screeningService = require('../service/screening.service');
const rateService = require('../service/rate.service');

const { emitRoomDataChanged } = require('../sockets/ticket.socket');

const payos = new PayOS(process.env.CLIENTID, process.env.APIKEY, process.env.CHECKSUMKEY);


const YOUR_DOMAIN = 'http://ticknow.xyz';

const expiresInMs = 60 * 60 * 1000;

// callbackUrl: 'https://evidently-sunny-tiger.ngrok-free.app/payos/receive-hook'

router.post('/create-payment-link', async (req, res) => {

    try {
        const expiredAt = Math.floor(Date.now() / 1000) + 5 * 60;

        const authHeader = req.headers.authorization;

        if (!authHeader) throw new Error('Không có token');

        const token = req.headers.authorization.split(' ')[1];

        if (!token) throw new Error('Token Không hợp lệ');

        const userId = await verifyToken(token);

        const code = await generateCinemaCode(ticketModel);

        const ticketData = req.body;
        const ticket = {
            ...ticketData,
            code: code,
            type: 1,
            autoDeleteAt: new Date(Date.now() + expiresInMs)
        }

        await ticketService.addTicket(ticket, userId);

        const order = {
            amount: ticketData.price,
            description: 'Thanh toán vé xem phim',
            orderCode: code,
            returnUrl: `${YOUR_DOMAIN}/booking-successful`,
            cancelUrl: `http://ticknow-be.onrender.com/payos/cancel-payment?orderCode=${code}`,
            expiry: expiredAt
        };

        const paymentLink = await payos.createPaymentLink(order);
        return res.status(201).json({ payUrl: paymentLink.checkoutUrl });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }

});

// https://ticknow-be.onrender.com/payos/receive-hook

router.post('/receive-hook', async (req, res) => {

    const paymentData = req.body;

    const id_payMethod = "684d203393b6ec82733bd8d5";

    const { data } = paymentData;

    if (!data || !data.orderCode) {
        return res.status(400).json({ message: 'Thiếu dữ liệu đơn hàng' });
    }

    let ticket = await ticketModel.findOne({ code: data.orderCode });

    // await ticketService.checkticket(ticket)

    if (data.code != "00") {
        console.log('Thanh toán thất bại');
        await ticketService.cancelTicket(ticket._id);
        return res.status(400).json({ message: 'Thanh toán thất bại' });
    }

    try {

        if (!ticket) return res.sendStatus(404);

        ticket.type = 2;

        ticket.autoDeleteAt = undefined;

        await ticket.save();

        sendMailTicket(ticket)

        const transitionData = {
            id_ticket: new mongoose.Types.ObjectId(ticket._id),
            id_payMethod: new mongoose.Types.ObjectId(id_payMethod),
            price: ticket.price
        }

        transition.addTransition(transitionData);

        let voucherData = {};

        if (ticket.id_voucher) {

            voucherData = {

                userCount: 0

            };

            await voucherService.updateVoucher(voucherData, ticket.id_voucher);
        }

        let rateData = {};
        rateData.id_ticket = ticket._id;
        const screening = await screeningService.getScreeingById(ticket.id_screening);
        rateData.id_movie = screening.id_movie;

        rateService.addRate(rateData);

        emitRoomDataChanged(screening);

        return res.status(200).json({ message: "Đặt vé thành công" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi xử lý dữ liệu" });
    }

});

router.get('/cancel-payment', async (req, res) => {
    try {
        const { orderCode } = req.query;

        let ticket = await ticketModel.findOne({ code: orderCode });

        console.log(`Đơn Hàng ${orderCode} đã bị hủy bởi người dùng`);

        await ticketService.cancelTicket(ticket._id);

        return res.redirect(`http://ticknow.xyz/booking-failed?orderCode=${orderCode}`);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Lỗi xử lý hủy thanh toán');
    }
});


module.exports = router;
