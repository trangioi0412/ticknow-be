const express = require('express');
const router = express.Router();

const { verifyToken } = require('../utils/auth.util');

// const { validateVnpReturnUrl } = require('../utils/validateVnpReturnUrl');

const crypto = require('crypto');

function validateVnpReturnUrl(query, secretKey) {
    const secureHash = query.vnp_SecureHash;
    const inputData = { ...query };
    delete inputData.vnp_SecureHash;
    delete inputData.vnp_SecureHashType;

    const sortedKeys = Object.keys(inputData).sort();
    const sortedQuery = sortedKeys.map(key => `${key}=${inputData[key]}`).join('&');

    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(sortedQuery, 'utf8').digest('hex');

    return signed === secureHash;
}

const pendingTickets = {};

const {
    VNPay,
    ignoreLogger,
    ProductCode,
    VnpLocate,
    dateFormat
} = require('vnpay');

router.post('/create-qr', async (req, res) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) throw new Error('Không có token');

        const token = req.headers.authorization.split(' ')[1];

        if (!token) throw new Error('Token Không hợp lệ');

        const userId = await verifyToken(token);

        const data = req.body;
        const txnRef = data.code;

         pendingTickets[txnRef] = {
            ...data,
            id_user: userId
        };

        const vnpay = new VNPay({
            tmnCode: 'BDH7N46W',
            secureSecret: 'DYUWCVBZXRD5M9U988X7K0FRW9WLZG1S',
            vnpayHost: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
            testMode: true,
            hashAlgorithm: 'SHA512',
            loggerFn: ignoreLogger,
        });

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const paymentUrl = await vnpay.buildPaymentUrl({
            vnp_Amount: data.price,
            vnp_IpAddr: '127.0.0.1',
            vnp_TxnRef: txnRef,
            vnp_OrderInfo: `Thanh toan don hang ${txnRef}`,
            vnp_OrderType: ProductCode.Other,
            vnp_ReturnUrl: 'http://localhost:1001/vnpay/check-payment-vnpay',
            vnp_Locale: 'vn',
            vnp_CreateDate: dateFormat(new Date()),
            vnp_ExpireDate: dateFormat(tomorrow),
        });

        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentUrl)}`;

        return res.status(201).json({
            paymentUrl,
            qrImageUrl
        });
    } catch (error) {
        console.error("VNPAY QR creation error:", error);
        return res.status(500).json({ message: 'Failed to create VNPAY QR', error });
    }
});

router.get('/check-payment-vnpay', (req, res) => {
    try {

        const isValid = validateVnpReturnUrl(req.query, 'DYUWCVBZXRD5M9U988X7K0FRW9WLZG1S');


        if (!isValid) {
            return res.status(400).send('Sai chữ ký! Dữ liệu không hợp lệ');
        }

        const txnRef = req.query.vnp_TxnRef;
        const responseCode = req.query.vnp_ResponseCode;
        const status = req.query.vnp_TransactionStatus;

        if (responseCode === '00' && status === '00') {

        const ticketData = pendingTickets[txnRef];

        }
        
    } catch (error) {
        console.error("VNPAY check error:", error);
        return res.status(500).send('Lỗi kiểm tra thanh toán');
    }
});


module.exports = router;