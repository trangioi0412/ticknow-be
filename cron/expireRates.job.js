const cron = require('node-cron');

const screeningService = require('../service/screening.service');
const movieService = require('../service/movie.service')

cron.schedule('* * * * *', async () => {
    try {
       const result = await screeningService.expireRatesBasedOnScreening();
    } catch (error) {
        console.error('Cron job lỗi:', error);
    }
})

cron.schedule('* * * * *', async () => {
    try {
        const result = await screeningService.expireScreening();
    } catch (error) {
        console.error('Cron job lỗi:', error);
    }
})

cron.schedule('* * * * *', async () => {
    try {
        const result = await movieService.expireMovie();
    } catch (error) {
        console.error('Cron job lỗi:', error);
    }
})