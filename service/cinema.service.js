const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');

const locationService = require('../service/location.service');
const locationModel = require("../model/location.model");

const cinemaModel = require('../model/cinemas.model');

const roomModel = require('../model/room.model');

const paginate = require('../utils/pagination');
const { saveImageToDisk, deleteImageFromDisk } = require('../utils/saveFile');



const getCinema = async (filter, page = "", limit = "", sort) => {
    const locations = await locationService.getAll();

    const locationMap = new Map();

    locations.location.forEach((loca) => {
        locationMap.set(loca._id.toString(), loca.name);
    })

    const { data, pagination } = await paginate.paginateQuery(cinemaModel, filter, page, limit, sort);

    const cinema = data.map(cinema => {
        const idLoca = cinema.location.id_location.toString();
        const nameLoca = locationMap.get(idLoca) || null

        return {
            ...cinema.toObject(),
            location: {
                ...cinema.location,
                location: nameLoca,
            }
        }
    })

    return {
        cinema,
        pagination
    };

}

const getCinemaById = async (id) => {
    const locations = await locationService.getAll();

    const locationMap = new Map();

    locations.location.forEach((loca) => {
        locationMap.set(loca._id.toString(), loca.name);
    })

    const cinemas = await cinemaModel.findById(id);


    const idLoca = cinemas.location.id_location.toString();
    const nameLoca = locationMap.get(idLoca) || null

    const result = {
        ...cinemas.toObject(),
        location: {
            ...cinemas.location,
            location: nameLoca,
        }
    }

    return result;
}

const cinemaDetail = async (id, filter) => {
    const screeningService = require('../service/screening.service');

    if (!id) {
        throw new Error("❌ id phim không hợp lệ");
    }

    const screening = await screeningService.getScreeningByCinema(id, filter);

    const result = screening;


    return result;
}

const addCinema = async (cinemaData, file) => {
    const locations = await locationModel.find({ _id: { $in: cinemaData.id_location } });

    if (!locations && locations.length <= 0) {
        throw new Error('Địa chỉ không tồn tại')
    }

    const checkCinema = await cinemaModel.findOne({ name: cinemaData.name });

    if (checkCinema) {
        throw new Error('Tên Cinema Đã Tồn Tại');
    }

    if (file) {
        const imageFile = file;
        const imageName = Date.now() + '-' + imageFile.originalname;
        saveImageToDisk(imageFile.buffer, imageName, 'cinema');
        cinemaData.image = imageName;
    }


    const newCinema = new cinemaModel({
        name: cinemaData.name,
        image: cinemaData.image,
        location: {
            id_location: new mongoose.Types.ObjectId(cinemaData.id_location),
            deatil_location: cinemaData.deatil_location
        },
        status: cinemaData.status
    })

    const data = await newCinema.save();

    return data;
}

const updateCinema = async (cinemaData, file, id) => {

    const cinema = await cinemaModel.findById(id);

    if (!cinema) {
        throw new Error(' Không tìm thấy rạp để sửa ');
    }

    const locations = await locationModel.find({ _id: { $in: cinemaData.id_location } });

    if (!locations && locations.length <= 0) {
        throw new Error('Địa chỉ không tồn tại')
    }

    if (cinemaData.status && cinemaData.status === 3) {
        const roomActive = await roomModel.find({ id_cinema: id, status: 2 });
        if (roomActive) {
            throw new Error('Hiện tại rạp vẫn đang còn phòng hoạt động!')
        }
    }

    if (file) {
        const imageFile = file;
        const imageName = Date.now() + '-' + imageFile.originalname;

        if (cinema.image) {
            deleteImageFromDisk(cinema.image, 'cinema');
        }

        saveImageToDisk(imageFile.buffer, imageName, 'cinema');

        cinemaData.image = imageName;

    } else if (cinemaData.removeImage === 'true') {
        if (cinema.image) {
            deleteImageFromDisk(cinema.image, 'cinema');
        }

        cinemaData.image = null;
    }

    if (!cinemaData.id_location) {
        cinemaData.id_location = cinema.location.id_location
    }

    if (!cinemaData.deatil_location) {
        cinemaData.deatil_location = cinema.location.deatil_location
    }

    if (!cinemaData.status) {
        cinemaData.status = cinema.location.status
    }

    const newCinema = {
        name: cinemaData.name,
        image: cinemaData.image,
        location: {
            id_location: new mongoose.Types.ObjectId(cinemaData.id_location),
            deatil_location: cinemaData.deatil_location
        },
        status: cinemaData.status
    }

    const result = await cinemaModel.findByIdAndUpdate(
        id,
        newCinema,
        { new: true }
    )

    return result;

}

module.exports = { getCinema, getCinemaById, cinemaDetail, addCinema, updateCinema }