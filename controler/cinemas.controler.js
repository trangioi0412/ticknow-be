const cinemaModel = require('../model/cinemas.model')
const locationModel = require('../model/location.model');

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const getCinema = async () => {
    try{
        
        const locations = await locationModel.find();

        const locationMap = new Map();

        locations.forEach((loca) => {
            locationMap.set(loca._id.toString(), loca.name);
        })

        const cinemas =  await cinemaModel.find();

        const result = cinemas.map(cinema => {
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

        return result;
    } catch(error){
        console.error(error.message)
        throw new Error("❌ Lỗi lấy dữ liệu của cinema")
    }
}

const getCinemaLocation = async (locationId) => {
    try{

        const cinemaLocation = await cinemaModel.find({'location.id_location': new ObjectId(locationId) });

        const location = await locationModel.findById(locationId);

        const result = cinemaLocation.map(cinema => {
            return {
                ...cinema.toObject(),
                location: {
                    ...cinema.location,
                    location: location.name
                }
            }
        })

        return result;
    }catch(error){
        console.error(error);
        throw new Error("❌ Lỗi lấy dữ liệu theo địa chỉ cinema");
    }
}

const getCinemaById = async (id) => {
    try{

        const locations = await locationModel.find();

        const locationMap = new Map();

        locations.forEach((loca) => {
            locationMap.set(loca._id.toString(), loca.name);
        })

        const cinemas =  await cinemaModel.findById(id);

        
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
    }catch(error){
        console.error(error);
        throw new Error("❌ Lỗi lấy dữ liệu theo địa chỉ cinema");
    }
}

module.exports = { getCinema, getCinemaLocation, getCinemaById }