const express = require('express');
const router = express.Router();

const {
    VNPay,
    ignoreLogger,
    ProductCode,
    VnpLocate,
    dateFormat
} = require('vnpay');

router.post('/create-qr', async (req, res) => {
    try {
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

        const txnRef = Date.now().toString();

        const paymentUrl = await vnpay.buildPaymentUrl({
            vnp_Amount: 50000, // 50.000 VND
            vnp_IpAddr: '127.0.0.1',
            vnp_TxnRef: txnRef,
            vnp_OrderInfo: `Thanh toan don hang ${txnRef}`,
            vnp_OrderType: ProductCode.Other,
            vnp_ReturnUrl: 'http://localhost:1001/vnpay/check-payment-vnpay',
            vnp_Locale: 'vn',
            vnp_CreateDate: dateFormat(new Date()),
            vnp_ExpireDate: dateFormat(tomorrow),
        });

        // 👉 Tạo link ảnh QR
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentUrl)}`;

        return res.status(201).json({
            paymentUrl,
            qrImageUrl, // ✅ Trả về ảnh QR (link)
        });
    } catch (error) {
        console.error("VNPAY QR creation error:", error);
        return res.status(500).json({ message: 'Failed to create VNPAY QR', error });
    }
});

router.get('/check-payment-vnpay', (req, res) => {
    console.log(req.query)
})

module.exports = router;