const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.ObjectId;

const rateSchema = new Schema ({
    id_movie: {type: ObjectId, required: true, ref: 'movie'},
    id_ticket: {type: ObjectId, required: true, ref: 'ticket'},
    score: {type: Number, required: true},
    comment: { type: String, required: false, default: ""},
    date: {type: Date, required: false, default: Date.now()}
})

module.exports = mongoose.models.rate || mongoose.model('rate', rateSchema);
