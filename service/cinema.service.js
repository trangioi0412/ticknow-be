const locationService = require('../service/location.service');
const cinemaModel = require('../model/cinemas.model');

const paginate = require('../utils/pagination');

const getCinema = async (page="", limit="") => {
    const locations = await locationService.getAll();

    const locationMap = new Map();

    locations.location.forEach((loca) => {
        locationMap.set(loca._id.toString(), loca.name);
    })

    const {data, pagination} = await paginate.paginateQuery(cinemaModel, {}, page, limit);

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

const getCinemaById = async (id)=> {
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

const cinemaDetail = async () => {
    
}

module.exports = { getCinema, getCinemaById }