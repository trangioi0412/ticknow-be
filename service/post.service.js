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

const addPost = async ( postData, file ) => {
    
}

module.exports = { getAll }