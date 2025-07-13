require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userModel = require('../model/users.model');
const paginate = require('../utils/pagination');

const sendMail = require("../utils/send.mail");
const parseBoolean = require("../utils/translate")

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

const login = async (email, password) => {
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

  const jwtSecret = process.env.JWT_SECRET;

  const token = jwt.sign(
    { id: checkUser._id, role: checkUser.role },
    jwtSecret,
    { expiresIn: "1h" }
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

module.exports = { getUsers, getUserDetail, login, register, updateUser };
