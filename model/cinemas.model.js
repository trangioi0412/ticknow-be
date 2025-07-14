const mongoose = require('mongoose');
const Schema =  mongoose.Schema;
const ObjectId = Schema.ObjectId

const cinemaSchema = new Schema({
    name: { type: String, required: true },
    image: { type: String, required: false, default: ""},
    location: {
        id_location: { type: ObjectId, ref: 'location',required: true},
        deatil_location: {type: String, required: true}
    },
    status: {type: Number, required: false, default: 1}
}, { versionKey: false, timestamps: true},)

module.exports = mongoose.models.cinema || mongoose.model('cinema', cinemaSchema);