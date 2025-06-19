const roomModel = require('../model/room.model');
const cinemaControler = require("../controler/cinemas.controler");

const getRooms = async () => {
    try {

        const cinemas = await cinemaControler.getCinema();
        const cinemaMap = new Map();

        cinemas.forEach(cinema => {
            cinemaMap.set(cinema._id.toString(), cinema.name);
        })

        const rooms = await roomModel.find();

        const result = rooms.map( room => {

            const cinemaId = room.id_thear.toString();
            const nameCine = cinemaMap.get(cinemaId);

            return {
                ...room.toObject(),
                cinema: nameCine,
            }
        })
        return result;

    } catch (error) {

        console.error(error);
        throw new Error('Lấy dữ liệu không thành công', error.message);

    }
}

const roomById = async (id) => {
    try {

        const result = roomModel.findById(id)
        return result;

    } catch (error) {

        console.error(error);
        throw new Error('Lấy dữ liệu không thành công', error.message);

    }
}

module.exports = { getRooms, roomById };


