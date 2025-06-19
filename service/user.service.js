const userModel = require('../model/users.model');
const paginate = require('../utils/pagination');

const getUsers = async (page = 1, limit = 5) => {
    try {
        const result = await paginate.paginateQuery(userModel, {}, page, limit)
        
        return result;
    } catch (error) {
        console.error(error)
        throw new Error("Lấy dữ liệu không thành công");
    }
}

module.exports = { getUsers }