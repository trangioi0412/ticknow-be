const postModel = require('../model/post.model');
const userService = require('../service/user.service');

const paginate = require('../utils/pagination');

const getAll = async (page = "", limit = "") => {
    const users = await userService.getUsers();

    const usersName = new Map();

    users.user.forEach((user) => {
        usersName.set(user._id.toString(), user.name);
    })

    const { data, pagination } = await paginate.paginateQuery(postModel, {}, page, limit);

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

module.exports = { getAll }