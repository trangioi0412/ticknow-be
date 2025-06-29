const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
const ObjectId = Schema.ObjectId

const cinemaSchema = new Schema({
    name: { type: String, require: true },
    image: { type: String, require: false, default: ""},
    location: {
        id_location: { type: ObjectId, ref: 'location',require: true},
        deatil_location: {type: String, require: true}
    }
})

module.exports = mongoose.models.cinema || mongoose.model('cinema', cinemaSchema);