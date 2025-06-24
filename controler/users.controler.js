const userService = require("../service/user.service");

const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const data = await userService.getUsers(page, limit);

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
}

const login = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json( {status: false, message: "Email và Password là bắt buộc"} );
        }

        const result = await userService.login(email, password);
        if(!result || !result.token){
            return res.status(401).json({status: false, message:"Đăng Nhập thất bại, sai thông tin"});
        }

        return res.status(200).json( { data: result, status: true, message: "Đăng Nhập Thành Công"} );

    } catch (error) {

        console.log(error);
        return res.status(400).json( { status: false, message: error.message} );

const register = async (req, res, next) => {
  try {
    const user = req.body;
    console.log(user.name, user.email, user.password);
    if (!user.name || !user.email || !user.password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin bắt buộc" });
    }

    await userService.register(user);

    return res
      .status(200)
      .json({ status: true, message: "Đăng Ký Thành Công" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = { getAllUsers, login, register };
