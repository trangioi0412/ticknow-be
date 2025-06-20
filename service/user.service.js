const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const userModel = require('../model/users.model');
const paginate = require('../utils/pagination');

require('dotenv').config();

const getUsers = async (page = 1, limit = 5) => {
    const result = await paginate.paginateQuery(userModel, {}, page, limit);
    result.data = result.data.map( user => {
        const {password, ...rest } = user.toObject();
        return rest;
    })
    if(!result){
        throw new Error("Lấy dữ liệu không thành công");
    }

    return result;
}

const login = async (email, password) => {

    const checkUser = await userModel.findOne( { email: email } );

    if(!checkUser){
        throw new Error(" Email Không tồn tại! ");
    }

    const isMatch = await bcrypt.compare(password ,checkUser.password);
    if(!isMatch){
        throw new Error(" Password Không Đúng ");
    }

    const jwtSecret = process.env.JWT_SECRET;

    const token = jwt.sign( { id: checkUser._id, role: checkUser.role }, jwtSecret, {expiresIn: "1h"});

    const { password: pwd, ...userWithoutPassword } = checkUser.toObject();

    return {
        ...userWithoutPassword
        ,token
    };

}

const register = async (user) => {
    const checkemail = await userModel.findOne({ email: user.email });

    if(checkemail){
        throw new Error(" Email đã tồn tại! ");
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(user.password, salt);

    const newUser = new userModel({
        name: user.name,
        phone: user.phone,
        email: user.email,
        password: hashPassword,
        year: user.year,
        status: user.status,
        role: user.role 
    })

    const result = await newUser.save()
    return result;
}

module.exports = { getUsers, login, register }