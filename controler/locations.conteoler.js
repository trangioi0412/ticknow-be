const locationModel = require('../model/location.model');

const getLocation = async () => {
    try{
        const locations = await locationModel.find();
        return locations;
    }catch(error){
        console.error(error.message)
        throw new Error('❌ Lỗi lấy dữ liệu của location')
    }
    
}

module.exports = { getLocation }