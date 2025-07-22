const paginate = require('../utils/pagination')

const roomModel = require('../model/room.model');
const cinemaModel = require('../model/cinemas.model');

const cinemaService = require('../service/cinema.service');

const getAll = async (filter, page, limit, sort) => {
    const cinemas = await cinemaService.getCinema();
    const cinemaMap = new Map();

    cinemas.cinema.forEach(cinema => {
        cinemaMap.set(cinema._id.toString(), cinema.name);
    })

    const { data, pagination } = await paginate.paginateQuery(roomModel, filter, page, limit, sort);


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

    const cinema = await cinemaService.getCinemaById(room.id_cinema);

    if (!cinema) {
        throw new Error('Không tìm thấy rạp');
    }

    return {
        id_room: room._id,
        code_room: room.code_room,
        id_cinema: cinema._id,
        name_cinema: cinema.name,
        location: cinema.location
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

    const cinema = await cinemaService.getCinemaById(room.id_cinema);

    if (!cinema) {
        throw new Error('Không tìm thấy rạp');
    }

    return {
        ...room.toObject(),
        id_cinema: cinema._id,
        cinema: cinema.name,
        location: cinema.location
    };
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

    console.log(rooms)

    let code_room

    code_room = 1;

    if ( rooms && rooms.code_room > 0 ) {
        code_room = parseInt(rooms.code_room) + 1;
    }


    let element_remove = roomData.seatRemoved;

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

    const newRoom = await roomModel.create(roomDatas);

    return newRoom;

}

const updateRoom = async (roomData, id) => {

    if (roomData.id_cinema) {

        const rooms = await roomModel.findOne({
            id_cinema: roomData.id_cinema,

        }).sort({ code_room: -1 }).limit(1);

        let code_room = 1

        if (rooms) {
            if (String(rooms._id) === String(id)) {
                code_room = parseInt(rooms.code_room);
            } else if (rooms.code_room > 0) {

                code_room = parseInt(rooms.code_room) + 1;
            }
        }

        roomData.code_room = code_room;

    }


    const { screeningRoom } = require('./screening.service');

    const roomCheck = await roomModel.findById(id);

    const screening = await screeningRoom(id);

    if (screening != null || screening != undefined) {
        throw new Error("Hiện tại phòng đang chiếu");
    }

    if (
        roomCheck.diagram.element_selected instanceof Map &&
        roomCheck.diagram.element_selected.size > 0
    ) {
        throw new Error("Hiện tại phòng đang chiếu");
    }

    let element_remove = roomData.seatRemoved || roomCheck.diagram.element_remove;

    roomData.row = roomData.row || roomCheck.diagram.row;
    roomData.column = roomData.column || roomCheck.diagram.column;
    roomData.id_cinema = roomData.id_cinema || roomCheck.id_cinema;
    roomData.element_selected = roomData.element_selected || roomCheck.element_selected || {};
    roomData.element_selecting = roomData.element_selecting || roomCheck.element_selecting || {};

    const row = parseInt(roomData.row);
    const column = parseInt(roomData.column);

    if (isNaN(row) || isNaN(column)) {
        throw new Error("row hoặc column không hợp lệ (không phải số)");
    }

    const roomDatas = {
        id_cinema: roomData.id_cinema,
        code_room: roomData.code_room,
        diagram: {
            row,
            column,
            element_remove,
            element_selected: roomData.element_selected,
            element_selecting: roomData.element_selecting
        },
        status: roomData.status
    };

    const newRoom = await roomModel.findByIdAndUpdate(
        id,
        roomDatas,
        { new: true }
    );

    return newRoom;
};


module.exports = { getAll, roomById, roomId, roomByIdCinema, addRoom, updateRoom };