const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const genresSchema = new Schema({
    name: {type: String, require: true},
})

module.exports = mongoose.models.genre || mongoose.model('genre', genresSchema);
