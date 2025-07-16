require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userModel = require('../model/users.model');
const paginate = require('../utils/pagination');

const sendMail = require("../utils/send.mail");
const parseBoolean = require("../utils/translate");

const getUsers = async (filter, page, limit, sort) => {
  const { data, pagination } = await paginate.paginateQuery(
    userModel,
    filter,
    page,
    limit,
    sort
  );

  const user = data.map((user) => {
    const { password, ...rest } = user.toObject();
    return rest;
  });

  const result = {
    user,
    pagination,
  };

  if (!result) {
    throw new Error("Lấy dữ liệu không thành công");
  }

  return result;
};

const getUserDetail = async (id) => {

  const user = await userModel.findById(id);

  if (user == null || user == undefined) {
    throw new Error("Thông tin người dùng sai")
  }

  const { password, ...rest } = user.toObject();

  return rest;

}

const login = async (email, password, role) => {
  const checkUser = await userModel.findOne({ email: email });

  if (!checkUser) {
    const error = new Error(" Email Không tồn tại! ");
    error.status = 400;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, checkUser.password);
  if (!isMatch) {
    const error = new Error(" Password Không Đúng ");
    error.status = 400;
    throw error;
  }

  if (checkUser.status === false) {
    const error = new Error(" Tài khoản của bạn đã bị khóa");
    error.status = 400;
    throw error;
  }

  if (role && checkUser.role != role) {
    throw new Error("Tài khoản của bạn không có quyền admin");
  }

  const jwtSecret = process.env.JWT_SECRET;

  const token = jwt.sign(
    { id: checkUser._id, role: checkUser.role },
    jwtSecret,
    { expiresIn: "1d" }
  );

  const { password: pwd, ...userWithoutPassword } = checkUser.toObject();
  return {
    user: userWithoutPassword.name
    , token
  };

};

const register = async (user) => {
  const checkemail = await userModel.findOne({ email: user.email });

  if (checkemail) {
    throw new Error(" Email đã tồn tại! ");
  }

  let year;

  if (user.year) {
    year = new Date(`${user.year}`);
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(user.password, salt);

  const newUser = new userModel({
    name: user.name,
    phone: user.phone,
    email: user.email,
    password: hashPassword,
    year: year,
    status: user.status,
    role: user.role,
  });

  const result = await newUser.save();

  await sendMail({
    email: user.email,
    subject: "CHUC MUNG BAN DANG KY THANH CONG",
    html: `
      <h1>Cảm ơn bạn đã đăng ký tài khoản tại TickNow</h1>
      <p>Name: ${user.name}</p>
      <p>Email: ${user.email}</p>
      <p>password: ${year}</p>
    `
  })

  return result;
};

const updateUser = async (userData, id) => {

  const user = await userModel.findById(id);

  if (userData.email) {
    throw new Error(" Không thể chỉnh sửa email ");
  }

  if (!user) {
    throw new Error(" User Không tồn tại ");
  }

  if (userData.password) {

    const isMatch = await bcrypt.compare(userData.retypePassword, user.password);

    if (!isMatch) {
      throw new Error("Password không đúng");
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(userData.password, salt);

    userData.password = hashPassword;
  }

  if (userData.year) {
    year = new Date(`${userData.year}`);
  }


  if (user.role === true && userData.role) {
    throw new Error("Không thể đổi role của user này");
  }

  if (userData.status) {
    userData.status = parseBoolean(userData.status);
  }

  if (userData.role) {
    userData.role = parseBoolean(userData.role);
  }

  const { retypePassword, ...rest } = userData;
  const newUser = rest
  const result = await userModel.findByIdAndUpdate(
    id,
    newUser,
    { new: true }
  )

  if (userData.status === false) {

    await sendMail({
      email: user.email,
      subject: "THÔNG Báo TỪ TICKNOW",
      html: `
      <h1 style="color: red">Tài khoản của bạn đã bị cấm truy cập tài website của TickNow</h1>
    `
    })
  }

  return result;

}

const resetPassword = async (email) => {

  const user = await userModel.findOne({ email: email });

  if (!user) {
    throw new Error('Email không tồn tại');
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_RESET_SECRET,
    { expiresIn: '20m' }
  )

  const resetLink = `http://localhost:3000/reset-password?token=${token}`;
  await sendMail({
    email: email, subject: '🔐 Yêu cầu đặt lại mật khẩu - TickNow', html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f2f4f8; color: #333;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
          <h2 style="color: #e50914;">TickNow - Đặt lại mật khẩu</h2>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn vào nút bên dưới để tạo mật khẩu mới:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" target="_blank" style="padding: 12px 24px; background-color: #e50914; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Đặt lại mật khẩu
            </a>
          </div>
          <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này. Liên kết này sẽ hết hạn sau 15 phút vì lý do bảo mật.</p>
          <hr style="margin: 40px 0;">
          <p style="font-size: 14px; color: #999;">© 2025 TickNow. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    ` });
}

const newPassword = async (id, password) => {
  const user = await userModel.findById(id);

  if (!user || user.status === false) {
    throw new Error('Người dùng không tồn tại hoặc đã bị khóa');
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  const result = await userModel.findByIdAndUpdate(
    id,
    { password: hashPassword },
    { new: true }
  );

  return result;
}

module.exports = { getUsers, getUserDetail, login, register, updateUser, resetPassword, newPassword };
