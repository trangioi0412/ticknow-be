const userService = require("../service/user.service");

const { verifyToken } = require('../utils/auth.util');

const getAllUsers = async (req, res, next) => {
  try {

    const sortField = req.query.sortField || '_id';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const filter = {}

    const { name, phone, email, status, role } = req.query;

    if (name) {
      filter.name = new RegExp(name, 'i');
    }

    if (phone) {
      filter.phone = { $eq: phone };
    }

    if (email) {
      filter.email = new RegExp(email, 'i');
    }

    if (status) {
      const statusArray = Array.isArray(status) ? status.map(s => s) : status.split(',').map(sta => sta.trim());
      filter.status = { $in: statusArray }
    }

    if (role) {
      const roleArray = Array.isArray(role) ? role.map(s => s) : role.split(',').map(sta => sta.trim());
      filter.role = { $in: roleArray }
    }

    const data = await userService.getUsers(filter, page, limit, sort);

    if (!data) {
      return res
        .status(404)
        .json({ status: false, message: "Lấy dữ liêu không thành công" });
    }

    return res
      .status(200)
      .json({ data: data, status: true, message: "Lấy dữ liệu thành công" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Lấy dữ liệu không thành công" });
  }
};

const getDetail = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) throw new Error('Không có token');

    const token = req.headers.authorization.split(' ')[1];

    if (!token) throw new Error('Token Không hợp lệ');

    const userId = await verifyToken(token);

    const data = await userService.getUserDetail(userId);

    if (!data) {
      return res
        .status(404)
        .json({ status: false, message: "Lấy dữ liêu không thành công" });
    }

    return res
      .status(200)
      .json({ data: data, status: true, message: "Lấy dữ liệu thành công" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Lấy dữ liệu không thành công" });
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { requireRole } = req;

    if (!email || !password) {
      return res
        .status(400)
        .json({ status: false, message: "Email và Password là bắt buộc" });
    }

    const result = await userService.login(email, password, requireRole);

    if (!result || !result.token || !result.user) {
      return res
        .status(401)
        .json({ status: false, message: "Đăng Nhập thất bại, sai thông tin hoặc không có quyền admin" });
    }

    // if (requireRole && result.user.role != requireRole) {
    //   return res
    //     .status(403)
    //     .json({ status: false, message: `Tài khoản không có quyền admin` });
    // }

    return res
      .status(200)
      .json({ data: result, status: true, message: "Đăng Nhập Thành Công" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

const register = async (req, res, next) => {
  try {
    const user = req.body;
    if (!user.name || !user.email || !user.password) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin bắt buộc" });
    }
    await userService.register(user);

    return res.status(200).json({ status: true, message: "Đăng Ký Thành Công" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

const updateUser = async (req, res, next) => {
  try {
    console.log(req.params);
    const user = req.body;

    const { id } = req.params;

    if (!id) {
      res.status(404).json({ status: false, message: " Vui lòng truyền id " })
    }

    const result = await userService.updateUser(user, id);

    if (!result) {
      return res.status(200).json({ status: true, message: 'Lấy dữ liệu thành công' })
    }

    res.status(200).json({ data: result, status: true, message: "Sửa dữ liệu thành công" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message })
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await userService.resetPassword(email)
    res.json({ message: 'Đã gửi email đặt lại mật khẩu' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message })
  }
}

const newPassword = async (req, res, next ) => {
  try {
    const { password } = req.body;
    res.json({ message: 'Thay Đổi mật khẩu thành công' })
  }catch (error){
    
  }
}

module.exports = { getAllUsers, login, register, getDetail, updateUser, resetPassword };
