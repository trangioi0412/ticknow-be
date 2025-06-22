const roomModel = require('../model/room.model');
const cinemaModel = require('../model/cinemas.model');

const roomById = async (id) => {
    if (!id) {
        throw new Error('Vui lòng truyền id');
    }

    const room = await roomModel.findById(id);
    if (!room) {
        throw new Error('Không tìm thấy phòng');
    }

    const cinema = await cinemaModel.findById(room.id_thear);
    if (!cinema) {
        throw new Error('Không tìm thấy rạp');
    }

    return {
        id_room: room._id,
        code_room: room.code_room,
        id_thear: cinema._id,
        name_cinema: cinema.name,
    };
};


module.exports = { roomById };