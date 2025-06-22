const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId

const movieSchema = new Schema({

    name: {type: String, required: true},
    release_date: { type: Date, required: true },
    nation: {type: String, required: false, default: 'Khác' },
    age: {type: String, required: false, default: 'P'},
    duration: {type: Number, required: true, min: 1, max: 240},
    description: {type: String, required: false, default: 'Không có mô tả'},
    director: {type: String, required: true},
    actor: {type: String, required: false, default: ''},
    trailer: {type: String, required: true},
    image: {type: String, required: true},
    banner: {type: String, required: true},
    genre: [ { _id: false, id: { type: ObjectId, ref: 'genre', required: true } } ],
    status: { type: Number, enum: [1, 2, 3], required: false, default: 2 }
});

module.exports = mongoose.models.movie || mongoose.model('movie', movieSchema );
