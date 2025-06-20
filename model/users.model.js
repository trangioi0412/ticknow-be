const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema ({
    name: {type: String, required: true},
    phone: { type: String, required: false, default: ""},
    email: { type: String, required: true },
    password: { type: String, required: true },
    year: { type: Number, required: false, default: "" },
    status: { type: String, required: false, default: "Hoạt Động"},
    role: {type: Boolean, required: false, default: false }
}, { versionKey: false});

module.exports = mongoose.models.user || mongoose.model('user', usersSchema);