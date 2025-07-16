require('dotenv').config

const express = require('express');
const router = express.Router();

const sendMail = require("../utils/send.mail");

router.post('/', async (req, res, next) => {
    try {
        const email = process.env.EMAIL_USER
        const data = req.body;
        await sendMail({
            email: email,
            subject: '📩 Có người vừa liên hệ qua form liên hệ',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                  <h2 style="color: #2c3e50;">Thông tin liên hệ mới từ website</h2>

                  <p><strong>👤 Họ tên:</strong> ${data.name}</p>
                  <p><strong>📧 Email:</strong> ${data.email}</p>
                  <p><strong>📱 Số điện thoại:</strong> ${data.phone || 'Không cung cấp'}</p>
                  <p><strong>📝 Nội dung:</strong></p>
                  <div style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #3498db;">
                    ${data.content}
                  </div>

                  <hr style="margin-top: 20px;">
                  <p style="font-size: 12px; color: #888;">Email này được gửi tự động từ hệ thống TickNow.</p>
                </div>
            `
        })

        return res.status(201).json({ status: true, message:"Gửi mail cho bộ phận hỗ trợ thành công" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message })
    }
})

module.exports = router;