const cron = require('node-cron');

const voucherService = require('../service/vouchers.service')
const postService = require('../service/post.service')

cron.schedule('* * * * *', async () => {
    try {
        const result = await voucherService.expireVoucher();
        console.log(result)
    } catch (error) {
        console.error('Cron job lỗi:', error);
    }
})

cron.schedule('* * * * *', async () => {
    try {
        const result = await voucherService.activateVoucher();
        console.log(result)
    } catch (error) {
        console.error('Cron job lỗi:', error);
    }
})

cron.schedule('* * * * *', async () => {
    try {
        const result = await postService.expirepost();
        // console.log(result)
    } catch (error) {
        console.error('Cron job lỗi:', error);
    }
})

cron.schedule('* * * * *', async () => {
    try {
        const result = await postService.activatepost();
        // console.log(result)
    } catch (error) {
        console.error('Cron job lỗi:', error);
    }
})
