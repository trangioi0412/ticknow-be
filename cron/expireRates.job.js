const cron = require('node-cron');

const screeningService = require('../service/screening.service');

cron.schedule('* * * * *', async () => {
    try{
        const updateCount = await screeningService.expireRatesBasedOnScreening();
        console.log(`Đã cập nhật ${updateCount} rate có thể bình luận.`);

    }catch(error){
        console.error('Cron job lỗi:', error);
    }
})

cron.schedule('* * * * *', () => {
  console.log(`[Cron] Job is running at ${new Date().toLocaleString()}`);
});