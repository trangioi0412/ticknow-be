const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.ObjectId;

const screeningSchema = new Schema ({
    id_room: { type: ObjectId, required: true },
    id_movie: { type: ObjectId, required: true },
    time_start: { type: String, required: true },
    time_end: { type: String, required: false },
    date: { type: Date, required: false, default: Date.now()},
    status: { type: Number, required: false, default:  2},
    showtype: { type: Number, required: true },
}, {versionKey: false, timestamps: true })

module.exports = mongoose.models.screening || mongoose.model('screening', screeningSchema);