const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.ObjectId;

const rateSchema = new Schema ({
    id_movie: {type: ObjectId, required: true, ref: 'movie'},
    id_ticket: {type: ObjectId, required: true, ref: 'ticket'},
    score: {type: Number, required: false, default: 0},
    comment: { type: String, required: false, default: ""},
    date: {type: Date, required: false, default: Date.now()},
    is_active: {type: Number, required: false, default: 1 }
}, {versionKey: false, timestamps: true })

module.exports = mongoose.models.rate || mongoose.model('rate', rateSchema);
