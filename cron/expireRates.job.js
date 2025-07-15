const cron = require('node-cron');

const screeningService = require('../service/screening.service');

cron.schedule('* * * * *', async () => {
    try{
        await screeningService.expireRatesBasedOnScreening();
    }catch(error){
        console.error('Cron job lỗi:', error);
    }
})
