const paginate = require('../utils/pagination')

const roomModel = require('../model/room.model');
const cinemaModel = require('../model/cinemas.model');

const cinemaService = require('../service/cinema.service');


const getAll = async (page, limit) => {
    const cinemas = await cinemaService.getCinema();
    const cinemaMap = new Map();

    cinemas.cinema.forEach(cinema => {
        cinemaMap.set(cinema._id.toString(), cinema.name);
    })

    const { data, pagination } = await paginate.paginateQuery(roomModel, {}, page, limit);


    const room = data.map(room => {

        const cinemaId = room.id_cinema.toString();
        const nameCine = cinemaMap.get(cinemaId);

        return {
            ...room.toObject(),
            cinema: nameCine,
        }
    })

    return {
        room,
        pagination
    };
}


const roomById = async (id, location) => {
    if (!id) {
        throw new Error('Vui lòng truyền id');
    }

    const room = await roomModel.findById(id);
    if (!room) {
        throw new Error('Không tìm thấy phòng');
    }

    const cinema = await cinemaModel.findById(room.id_cinema);
    if (!cinema) {
        throw new Error('Không tìm thấy rạp');
    }

    return {
        id_room: room._id,
        code_room: room.code_room,
        id_cinema: cinema._id,
        name_cinema: cinema.name,
    };
};

const roomId = async (id) => {
    if (!id) {
        throw new Error('Vui lòng truyền id');
    }

    const room = await roomModel.findById(id);
    if (!room) {
        throw new Error('Không tìm thấy phòng');
    }

    return room;
}

const roomByIdCinema = async (id) => {
    const room = await roomModel.find({id_cinema : id});
    if(!room){
        throw new Error('Không tìm thấy room');
    }
    return room
}

module.exports = { getAll, roomById, roomId, roomByIdCinema };