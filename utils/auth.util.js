const jwt = require('jsonwebtoken');

const userModel = require('../model/users.model');

const verifyAdmin = async (userId) => {
    const user = await userModel.findById(userId);

    if (!user) {
        throw new Error('Không tìm thấy user');
    }

    if (!user.role) {
        throw new Error('Không có quyền truy cập');
    }

    return true;
};

const verifyToken = async (token) => {
    try {
        const jwtSecret = process.env.JWT_SECRET;

        const decoded = jwt.verify(token, jwtSecret);
        return decoded.id;
    } catch (err) {
        switch (err.name) {
            case 'TokenExpiredError':
                throw new Error('Token đã hết hạn');
            case 'JsonWebTokenError':
                throw new Error('Token không hợp lệ');
            default:
                throw new Error('Lỗi xác thực token');
        }
    }
};

module.exports = { verifyAdmin, verifyToken }