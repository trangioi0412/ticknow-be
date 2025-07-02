const mongoose = require('mongoose');
const Schema =  mongoose.Schema;

const locationSchema = new Schema({
    name: { type: String, require: true },
}, {versionKey: false, timestamps: true})

module.exports = mongoose.models.location || mongoose.model('location', locationSchema);