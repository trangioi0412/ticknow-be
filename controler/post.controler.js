const postModel = require('../model/post.model');
const usersModel = require('../model/users.model');

const getPosts = async () => {
    try{

        const users = await usersModel.find();

        const usersName = new Map();

        users.forEach((user) => {
            usersName.set(user._id.toString(), user.name);
        })

        const posts = await postModel.find();

        const result = posts.map(post => {
            const idUser = post.id_user.toString();
            const nameUser = usersName.get(idUser);
            return {
                ...post.toObject(),
                nameUser: nameUser
            }
        })
        return result;
    }catch(error){
        console.error(error);
        throw new Error("❌ Lỗi lấy dữ liệu từ post");
    }
} 

module.exports = { getPosts };
