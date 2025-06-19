const userService = require('../service/user.service');

const getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt( req.query.page )
        const limit = parseInt( req.query.limit )


        const { data, pagination }  = await userService.getUsers(page, limit);

        if( data ){
            return res.status(200).json({ data: data , pagination, status: true, message: 'Lấy dữ liệu thành công'})
        }else{
            console.log(data);
            return res.status(404).json({ status: false, message: 'Lấy dữ liêu không thành công' })

        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: false, message: 'Lấy dữ liệu không thành công'})
    }
}

module.exports = { getAllUsers }