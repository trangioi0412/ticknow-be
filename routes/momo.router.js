const express = require('express');
const router = express.Router();

const { verifyToken } = require('../utils/auth.util');
const axios = require('axios');

const ticketService = require('../service/ticket.service');

router.post('/create-qr', async (req, res) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) throw new Error('Không có token');

    const token = req.headers.authorization.split(' ')[1];

    if (!token) throw new Error('Token Không hợp lệ');

    const userId = await verifyToken(token);

    const ticketData = req.body;

    await ticketService.checkticket(ticketData, userId);

    const accessKey = 'F8BBA842ECF85';
    const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const orderInfo = 'pay with MoMo';
    const partnerCode = 'MOMO';
    const redirectUrl = 'http://localhost:1001/momo/ipn';
    const ipnUrl = 'http://localhost:1001/momo/ipn';
    const requestType = "payWithMethod";
    const amount = `${ticketData.price}`;

    const orderId = partnerCode + new Date().getTime();
    const requestId = orderId;

    const extraData = Buffer.from(JSON.stringify({
        ...ticketData,
        userId: userId
    })).toString('base64');
    
    const orderGroupId = '';
    const autoCapture = true;
    const lang = 'vi';

    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    var rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType;

    //puts raw signature
    console.log("--------------------RAW SIGNATURE----------------")
    console.log(rawSignature)

    //signature
    const crypto = require('crypto');
    var signature = crypto.createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');
    console.log("--------------------SIGNATURE----------------")
    console.log(signature)

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        partnerName: "Test",
        storeId: "MomoTestStore",
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        lang: lang,
        requestType: requestType,
        autoCapture: autoCapture,
        extraData: extraData,
        orderGroupId: orderGroupId,
        signature: signature
    });

    const options = {
        method: "POST",
        url: "https://test-payment.momo.vn/v2/gateway/api/create",
        headers: {
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(requestBody),
        },
        data: requestBody
    }

    let result;

    try {
        result = await axios(options);
        return res.status(201).json(result.data)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: "Lỗi server" })
    }
});

router.all('/ipn', async (req, res) => {
    const crypto = require('crypto');

    try {
        const {
            partnerCode,
            orderId,
            requestId,
            amount,
            orderInfo,
            orderType,
            transId,
            resultCode,
            message,
            payType,
            responseTime,
            extraData,
            signature
        } = req.method === 'POST' ? req.body : req.query;

        let ticketInfo;

        try {

            ticketInfo = JSON.parse(Buffer.from(extraData, 'base64').toString('utf-8'));
            
            ticketInfo.type = 2;

            const {userId, ...rest} = ticketInfo

            await ticketService.addTicket(rest, userId);

        } catch (err) {

            console.log(err);
            return res.status(400).json({ message: "Invalid extraData" });

        }

        const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
        const rawSignature = `accessKey=F8BBA842ECF85&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

        const expectedSignature = crypto
            .createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        if (signature !== expectedSignature) {
            return res.status(400).json({ message: "Chữ ký không hợp lệ" });
        }

        if (Number(resultCode) === 0) {
            return res.status(200).json({ message: "IPN xử lý thành công", ticketInfo });
        } else {
            return res.status(200).json({ message: "Thanh toán thất bại" });
        }

    } catch (err) {
        return res.status(500).json({ message: "Lỗi server IPN" });
    }
});


module.exports = router;
