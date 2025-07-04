require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userModel = require('../model/users.model');
const paginate = require('../utils/pagination');

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

  const user =  await userModel.findById(id);

  if(user == null || user == undefined){
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

  const jwtSecret = process.env.JWT_SECRET;

  const token = jwt.sign(
    { id: checkUser._id, role: checkUser.role },
    jwtSecret,
    { expiresIn: "1h" }
  );

  const { password: pwd, ...userWithoutPassword } = checkUser.toObject();
    return {
        user: userWithoutPassword.name
        ,token
    };

};

const register = async (user) => {
  const checkemail = await userModel.findOne({ email: user.email });

  if (checkemail) {
    throw new Error(" Email đã tồn tại! ");
  }

  const date = new Date(user.year);
  const year = date.getFullYear();

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
  return result;
};


module.exports = { getUsers, getUserDetail, login, register };
