const statisticalService = require('../service/statistical.service');

const revenue = async (req, res, next) => {
    try {
        const { type, value } = req.query;

        if (!['day', 'month', 'year'].includes(type)) {
            return res.status(400).json({ status: false, message: "Loại thống kê không hợp lệ" });
        }

        if (!value) {
            return res.status(400).json({ status: false, message: `Thiếu giá trị cho '${type}'` });
        }

        const data = await statisticalService.statisticalByType(type, value);

        return res.status(200).json({ data, status: true, message: "Lấy dữ liệu thành công" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

const revenueUser = async (req, res, next) => {
    try {
        const { type, value } = req.query;

        if (!['day', 'month', 'year'].includes(type)) {
            return res.status(400).json({ status: false, message: "Loại thống kê không hợp lệ" });
        }

        if (!value) {
            return res.status(400).json({ status: false, message: `Thiếu giá trị cho '${type}'` });
        }

        const data = await statisticalService.newUserDay(type, value);

        return res.status(200).json({ data, status: true, message: "Lấy dữ liệu thành công" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

const revenueYear = async (req, res, next) => {
    try {
        const { year } = req.query;

        if (!year) {
            return res.status(400).json({ status: false, message: "Thiếu năm cần thống kê" });
        }

        const data = await statisticalService.revenueEachMonthInYear(year);

        return res.status(200).json({ data, status: true, message: "Lấy dữ liệu thành công" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

const revenueMonth = async (req, res, next) => {
    try {
        const { year, month } = req.query;

        if (!year) {
            return res.status(400).json({ status: false, message: "Thiếu năm cần thống kê" });
        }

        if (!month) {
            return res.status(400).json({ status: false, message: "Thiếu tháng cần thống kê" });
        }

        const data = await statisticalService.revenueEachDayInMonth(year, month);

        return res.status(200).json({ data, status: true, message: "Lấy dữ liệu thành công" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

const revenueCinema = async (req, res, next) => {
    try {

        const { start, end, page, limit } = req.query;

        const data = await statisticalService.statisticalCinema(start, end, page, limit);

        return res.status(200).json({ data, status: true, message: "Lấy dữ liệu thành công" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}

const revenueMovie = async (req, res, next) => {
    try {
        const { start, end, page, limit } = req.query;

        const data = await statisticalService.statisticalMovie(start, end, page, limit);

        return res.status(200).json({ data, status: true, message: "Lấy dữ liệu thành công" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, message: error.message })
    }
}


module.exports = { revenue, revenueYear, revenueUser, revenueCinema, revenueMovie, revenueMonth }