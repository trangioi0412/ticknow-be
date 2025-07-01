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
    const room = await roomModel.find({ id_cinema: id });
    if (!room) {
        throw new Error('Không tìm thấy room');
    }
    return room
}

const addRoom = async (roomData) => {
    const rooms = await roomModel.findOne({
        id_cinema: roomData.id_cinema,

    }).sort({ code_room: -1 }).limit(1);

    if (!rooms && rooms.length < 0) {
        throw new Error("Cinema không tồn tại")
    }

    let code_room = parseInt(rooms.code_room) + 1;

    let element_remove = {}

    roomData.element_remove.forEach(item => {
        const match = item.match(/^([A-Z]+)(\d+)$/i);

        if (match) {
            const letter = match[1];
            const number = parseInt(match[2], 10);

            if (!element_remove[letter]) {
                element_remove[letter] = new Set();
            }
            element_remove[letter].add(number);
        }
    })

    Object.keys(element_remove).forEach(key => {
        element_remove[key] = Array.from(element_remove[key])
    })

    const roomDatas = {
        code_room: code_room,
        id_cinema: roomData.id_cinema,
        diagram: {
            row: parseInt(roomData.row),
            column: parseInt(roomData.column),
            element_remove,
            element_selected: {},
            element_selecting: {}
        }
    };

    const newRoom = await roomModel.create(roomDatas)

    return newRoom;

}

const updateRoom = async (roomData) => {

    const roomCheck = await roomModel.findById(roomData.id);

    console.log(roomCheck);

    if(roomCheck.diagram && Object.keys(roomCheck.diagram.element_selected || {}).length > 0 ){
        throw new Error("Hiện tại phòng đang có suất chiếu")
    }

    const rooms = await roomModel.findOne({
        id_cinema: roomData.id_cinema,

    }).sort({ code_room: -1 }).limit(1);

    if (!rooms && rooms.length < 0) {
        throw new Error("Cinema không tồn tại")
    }

    let code_room = parseInt(rooms.code_room) + 1;

    let element_remove = {}

    roomData.element_remove.forEach(item => {
        const match = item.match(/^([A-Z]+)(\d+)$/i);

        if (match) {
            const letter = match[1];
            const number = parseInt(match[2], 10);

            if (!element_remove[letter]) {
                element_remove[letter] = new Set();
            }
            element_remove[letter].add(number);
        }
    })

    Object.keys(element_remove).forEach(key => {
        element_remove[key] = Array.from(element_remove[key])
    })

    if(!roomData.status && roomData.status === ""){
        roomData.status = 1;
    }

    const roomDatas = {
        code_room: code_room,
        id_cinema: roomData.id_cinema,
        diagram: {
            row: parseInt(roomData.row),
            column: parseInt(roomData.column),
            element_remove,
            element_selected: {},
            element_selecting: {}
        },
        status: roomData.status
    };

    const newRoom = await roomModel.findByIdAndUpdate(
        roomData.id,
        roomDatas,
        {new: true}
    )

    return newRoom;
}

module.exports = { getAll, roomById, roomId, roomByIdCinema, addRoom, updateRoom };