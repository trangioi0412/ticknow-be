
const check = require('../utils/checkDateQuery');


const screeningService = require('../service/screening.service');

const getScreeings = async (req, res, next) => {
    try {
        let filter = {};

        const screenings  = await screeningService.getScreeings(filter);

        if( screenings ){
            return res.status(200).json({ data: screenings , status: true, message: 'Lấy dữ liệu thành công'})
        }else{
            return res.status(404).json({ status: false, message: 'Lấy dữ liêu không thành công' })
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({status: false, message: 'Lấy dữ liệu không thành công'})
    }
}

const filterScreening = async (req, res, next) => {
    try {
        const { date } = req.query;
        
        let filter = {};

        if(date) filter.date = check.checkDate(date);

        const screenings  = await screeningService.getScreeningFilter(filter);

        if( screenings ){
            return res.status(200).json({ data: screenings , status: true, message: 'Lấy dữ liệu thành công'})
        }else{
            return res.status(404).json({ status: false, message: 'Lấy dữ liêu không thành công' })
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({status: false, message: 'Lấy dữ liệu không thành công'})
    }
}

const ScreeningRoom = async (req, res, next) => {
    try {
        const { id } = req.params;

        const screenings  = await screeningService.screeningRoom(id);

        if( screenings ){
            return res.status(200).json({ data: screenings , status: true, message: 'Lấy dữ liệu thành công'})
        }else{
            return res.status(404).json({ status: false, message: 'Lấy dữ liêu không thành công' })
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({status: false, message: 'Lấy dữ liệu không thành công'})
    }
}

module.exports = { getScreeings, filterScreening, ScreeningRoom }