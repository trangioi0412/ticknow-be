const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path')

const { saveImageToDisk, deleteImageFromDisk } = require('../utils/saveFile');

const postModel = require('../model/post.model');
const userService = require('../service/user.service');

const paginate = require('../utils/pagination');

const getAll = async (filter, page = "", limit = "", sort) => {
    const users = await userService.getUsers();

    const usersName = new Map();

    users.user.forEach((user) => {
        usersName.set(user._id.toString(), user.name);
    })

    const { data, pagination } = await paginate.paginateQuery(postModel, filter, page, limit, sort);

    const post = data.map(post => {
        const idUser = post.id_user.toString();
        const nameUser = usersName.get(idUser);
        return {
            ...post.toObject(),
            nameUser: nameUser
        }
    })

    return {
        post,
        pagination
    };
}

const addPost = async (postData, file) => {

    if (!postData.title && postData.title === "") {
        throw new Error("Vui lòng tiêu đề của bài viết")
    }

    if (!postData.title && postData.title === "") {
        throw new Error("Vui lòng nội dung của bài viết")
    }

    if (file) {
        const imageFile = file;
        const imageName = Date.now() + '-' + imageFile.originalname;
        saveImageToDisk(imageFile.buffer, imageName, 'post');
        postData.image = imageName;
    } else {
        throw new Error("Vui lòng Thêm Ảnh")
    }

    if (!postData.start_day && postData.start_day === "") {
        throw new Error("Vui lòng Thêm Ngày bắt đầu")
    }

    let start_day = new Date(`${postData.start_day}T00:00:00.000Z`);

    if (!postData.end_day && postData.end_day === "") {
        throw new Error("Vui lòng Thêm Ngày kết thúc")
    }

    let end_day = new Date(`${postData.end_day}T00:00:00.000Z`);

    const user = await userService.getUserDetail(postData.id_user);

    if (!user || (typeof user === 'object' && Object.keys(user).length === 0)) {
        throw new Error("thông tin user không đúng")
    }

    const newPoster = new postModel({
        ...postData,
        id_user : new mongoose.Types.ObjectId(postData.id_user),
        start_day: start_day,
        end_day: end_day
    })

    const result = await postModel.create(newPoster);

    return result;

}

const updatepost = async (postData, file, id) => {

    const post = await postModel.findById(id);

    if (!post) {
        throw new Error(' Không tìm thấy bài viết để sửa ');
    }

    if (file) {
        const imageFile = file;
        const imageName = Date.now() + '-' + imageFile.originalname;

        if (post.image) {
            deleteImageFromDisk(post.image, 'post');
        }

        saveImageToDisk(imageFile.buffer, imageName, 'post');

        postData.image = imageName;
    }

    const result = await postModel.findByIdAndUpdate(
        id,
        postData,
        { new: true }
    )

    return result;

}

const deletePost = async (id) => {

    const post = await postModel.findById(id);

    if (!post) {
        throw new Error(' Không tìm thấy rạp để xóa ');
    }

    const imagePath = path.join(__dirname, '../public/images/post', post.image);

    if (post.image && fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }

    return await postModel.findByIdAndDelete(id);

}

module.exports = { getAll, addPost, updatepost, deletePost }