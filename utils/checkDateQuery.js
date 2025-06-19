const dayjs = require('dayjs');

const checkDate = (date) => {
    
    if(date){
        const parsedDate = dayjs(date, 'MM-DD-YYYY');
        if(parsedDate.isValid()){

            const start = parsedDate.startOf('day').toDate();
            const end = parsedDate.endOf('day').toDate();

            return {
                $gte: start,
                $lte: end
            };
        }else{
            console.warn('⚠️ Ngày không hợp lệ:', date);
        }
    }
}

module.exports = { checkDate };