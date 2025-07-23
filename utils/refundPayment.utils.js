const axios = require('axios');

async function refundPayment(orderCode, amount) {
    try {
        const response = await axios.post(
            `https://api.payos.vn/v2/payment-requests/${orderCode}/cancel`,
            {
                amount, // chỉ cần amount và description
                description: 'Khách hủy vé',
            },
            {
                headers: {
                    'x-client-id': 'f4183646-18dd-4621-a493-de07f6b6b93a',
                    'x-api-key': '447887c6-1628-433c-9f63-b52bc05d29bd'
                }
            }
        );

        const resData = response.data;

        if (resData.code === '00' || resData.code === 0) {
            return { success: true, data: resData };
        }

        console.warn('❌ PayOS không hoàn tiền:', resData);
        return { success: false, error: resData };
    } catch (err) {
        const errorData = err.response?.data || err.message;
        console.error('❌ Lỗi API hoàn tiền PayOS:', errorData);
        return { success: false, error: errorData };
    }
}

module.exports = refundPayment;
