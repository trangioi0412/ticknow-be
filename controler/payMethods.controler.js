const payMethodModel = require('../model/payMethods.model');

const getPayMethod = async () => {
    try{
        const payMethod = await payMethodModel.find();
        
        return payMethod
    }catch(error){
        console.log(error.message)
        throw new Error('❌ Lỗi lấy dữ liệu của movie')
    }
}

module.exports = { getPayMethod }