const express = require('express');
const router = express.Router();
const PayOS = require('@payos/node');

const { verifyToken } = require('../utils/auth.util');

const ticketService = require('../service/ticket.service');

const payos = new PayOS('f4183646-18dd-4621-a493-de07f6b6b93a', '447887c6-1628-433c-9f63-b52bc05d29bd', '645d652132ec6507e3f038d335da5a476c3d2a88b67d011bfae54a0f3dd0bf86');

const YOUR_DOMAIN = 'http://localhost:1001';

const extraDataMap = new Map();

router.post('/create-payment-link', async (req, res) => {

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) throw new Error('Không có token');

        const token = req.headers.authorization.split(' ')[1];

        if (!token) throw new Error('Token Không hợp lệ');

        const userId = await verifyToken(token);

        const ticketData = req.body;

        await ticketService.checkticket(ticketData, userId);

        const data = {
            ticketData: ticketData,
            userId
        }

        const order = {
            amount: ticketData.price,
            description: 'Thanh toán vé xem phim',
            orderCode: ticketData.code,
            returnUrl: `${YOUR_DOMAIN}/success.html`,
            cancelUrl: `${YOUR_DOMAIN}/cancel.html`
        };

        extraDataMap.set(order.orderCode, data);

        const paymentLink = await payos.createPaymentLink(order);

        return res.status(201).json({ payUrl: paymentLink.checkoutUrl });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }

})

// https://c2e810f29b12.ngrok-free.app/payos/receive-hook

router.post('/receive-hook', async (req, res) => {
    const paymentData = req.body;

    const { data } = paymentData;

    if (!data || !data.orderCode) {
        return res.status(400).json({ message: 'Thiếu dữ liệu đơn hàng' });
    }

    if (data.code != "00") {
        console.log('Thanh toán thất bại');
        return res.status(400).json({ message: 'Thanh toán thất bại' });
    }

    const extraDataRaw = extraDataMap.get(data.orderCode);


    try {
        const { ticketData, userId } = extraDataRaw;

        await ticketService.addTicket(ticketData, userId);

        return res.status(200).json({ message: "Đặt vé thành công" });
        
    } catch (err) {
        console.error("Lỗi giải mã extraData:", err);
        return res.status(500).json({ message: "Lỗi xử lý dữ liệu" });
    }

});




module.exports = router;
