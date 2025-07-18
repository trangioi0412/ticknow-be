const payMethodService = require('../service/payMethods.service');

const getPayMethod = async (req, res, next) => {
    try {

        const sortField = req.query.sortField || '_id';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sort = { [sortField]: sortOrder };

        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page);

        const filter = {}

        const { name, type, status } = req.query;

        if (name) {
            filter.name = new RegExp(name, 'i');
        }

        if(type) {
            const typeArray = Array.isArray(type) ? type.map(t => Number(t) ) : type.split(',').map(t => Number( t.trim()) )
            filter.type = { $in: typeArray}
        }

        if(status){
            const statusArray = Array.isArray(status) ? status.map( s => Number(s) ) : status.split(',').map(sta => Number( sta.trim()) );
            filter.status = { $in: statusArray }
        }

        const result = await payMethodService.getAll(filter, page, limit, sort);

        if (!result) {
            return res.status(404).json({ status: false, message: "Lấy dữ liệu thật bại" })
        }

        return res.status(200).json({ data: result, status: true, message: 'Lấy dữ liệu thành công' })

    } catch (error) {
        console.error(error.message)
        return res.status(500).json({ status: false, message: error.message })
    }
}

module.exports = { getPayMethod }