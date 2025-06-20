const { verifyAdmin, verifyToken } = require('../utils/auth.util');

const isAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader) throw new Error('Không có token');
        
        const token = req.headers.authorization.split(' ')[1];

        if(!token) throw new Error('Token Không hợp lệ');
        
        const userId = await verifyToken(token);
        await verifyAdmin(userId);

        req.userId = userId;
        next();

    }catch(error){
        res.status(403).json({ message: error.message });
    }
}

module.exports = { isAdmin };