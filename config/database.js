require('dotenv').config()

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI

const CONNECT_DB = async () => {
    try{
       await mongoose.connect(`${MONGODB_URI}`)
        .then(()=>{console.log('Kết nối thành công')})
        .catch(err=> console.log(err))
        
    }catch(err){
        console.error('❌ MongoDB lỗi kết nối:', err.message);
    }
}

module.exports = CONNECT_DB;