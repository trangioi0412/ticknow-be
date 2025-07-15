const express = require('express');
const router = express.Router();
const PayOS = require('@payos/node');
const mongoose = require('mongoose');

const { verifyToken } = require('../utils/auth.util');

const ticketService = require('../service/ticket.service');
const ticketModel = require('../model/ticket.model');
const transition = require('../service/transition.service');
const voucherService = require('../service/vouchers.service');
const screeningService = require('../service/screening.service');
const rateService = require('../service/rate.service');

const payos = new PayOS('f4183646-18dd-4621-a493-de07f6b6b93a', '447887c6-1628-433c-9f63-b52bc05d29bd', '645d652132ec6507e3f038d335da5a476c3d2a88b67d011bfae54a0f3dd0bf86');

const YOUR_DOMAIN = 'http://localhost:1001';

const extraDataMap = new Map();

const expiresInMs = 60 * 60 * 1000;

// callbackUrl: 'https://evidently-sunny-tiger.ngrok-free.app/payos/receive-hook'

router.post('/create-payment-link', async (req, res) => {

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) throw new Error('Không có token');

        const token = req.headers.authorization.split(' ')[1];

        if (!token) throw new Error('Token Không hợp lệ');

        const userId = await verifyToken(token);

        const ticketData = req.body;
        const ticket = {
            ...ticketData,
            type: 1,
            autoDeleteAt: new Date(Date.now() + expiresInMs)
        }

        await ticketService.addTicket(ticket, userId);

        const order = {
            amount: ticketData.price,
            description: 'Thanh toán vé xem phim',
            orderCode: ticketData.code,
            returnUrl: `${YOUR_DOMAIN}/success.html`,
            cancelUrl: `${YOUR_DOMAIN}/cancel.html`,
            callbackUrl: 'https://d1817ee1488c.ngrok-free.app/payos/receive-hook'
        };

        const paymentLink = await payos.createPaymentLink(order);
        return res.status(201).json({ payUrl: paymentLink.checkoutUrl });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }

})



// https://d1817ee1488c.ngrok-free.app/payos/receive-hook

router.post('/receive-hook', async (req, res) => {

    const paymentData = req.body;

    const id_payMethod = "684d203393b6ec82733bd8d5";

    const { data } = paymentData;

    if (!data || !data.orderCode) {
        return res.status(400).json({ message: 'Thiếu dữ liệu đơn hàng' });
    }

    if (data.code != "00") {
        console.log('Thanh toán thất bại');
        return res.status(400).json({ message: 'Thanh toán thất bại' });
    }

    try {
        
        let ticket = await ticketModel.findOne({code: data.orderCode});

        if (!ticket) return res.sendStatus(404);

        ticket.type = 2;

        ticket.autoDeleteAt = undefined;

        await ticket.save();

        const transitionData = {
            id_ticket: new mongoose.Types.ObjectId(ticket._id),
            id_payMethod: new mongoose.Types.ObjectId(id_payMethod),
            price: ticket.price
        }

        transition.addTransition(transitionData);

        let voucherData = {};

        if (ticket.voucher) {

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

        return res.status(200).json({ message: "Đặt vé thành công" });

    } catch (err) {
        console.error( err);
        return res.status(500).json({ message: "Lỗi xử lý dữ liệu" });
    }

});


module.exports = router;
