const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path')

const { saveImageToDisk, deleteImageFromDisk } = require('../utils/saveFile');

const postModel = require('../model/post.model');
const userService = require('../service/user.service');

const paginate = require('../utils/pagination');

const getAll = async (filter, page = "", limit = "", sort) => {
    const users = await userService.getUsers();

    const posttest = await postModel(filter);

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

const getDetail = async (id) => {
    const postDetail = await postModel.findById(id);

    if (!postDetail) {
        throw new Error("không tìm thấy bài viết")
    }

    return postDetail
}

const expirepost = async () => {
    const now = new Date();
    const posts = await postModel.find();
    const expiredIds = [];

    for (const post of posts) {
        const fullEndTime = new Date(post.end_day);

        const isExpired = fullEndTime < now;

        if (isExpired) {
            expiredIds.push(post._id);
        }
    }

    if (expiredIds.length === 0) return 0;

    const result = await postModel.updateMany(
        { _id: { $in: expiredIds } },
        { $set: { status: 1 } }
    );

    return result.modifiedCount;
};


const activatepost = async () => {
    const now = new Date();
    const posts = await postModel.find();
    const activateIds = [];

    for (const post of posts) {
        const start = new Date(post.start_day);
        const end = new Date(post.end_day);

        const isValidTime = start <= now && now <= end;

        if (isValidTime) {
            activateIds.push(post._id);
        }
    }

    if (activateIds.length === 0) return 0;

    const result = await postModel.updateMany(
        { _id: { $in: activateIds } },
        { $set: { status: 2 } }
    );

    return result.modifiedCount;
};

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
        const result = await uploadToCloudinary(imageFile.buffer, imageName, 'post');
        postData.image = `${result.public_id}.${result.format}`
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

    // const user = await userService.getUserDetail(postData.id_user);

    // if (!user || (typeof user === 'object' && Object.keys(user).length === 0)) {
    //     throw new Error("thông tin user không đúng")
    // }

    const newPoster = new postModel({
        ...postData,
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
            await cloudinary.uploader.destroy(post.image);
        }

        const result = await uploadToCloudinary(imageFile.buffer, imageName, 'post');

        postData.image = result.public_id;
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

module.exports = { getAll, addPost, updatepost, deletePost, getDetail, expirepost, activatepost }