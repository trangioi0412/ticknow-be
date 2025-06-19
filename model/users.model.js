const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema ({
    name: {type: String, required: true},
    phone: { type: String, required: true},
    email: { type: String, required: true },
    password: { type: String, required: true, select: false },
    year: { type: Number, required: true },
    status: { type: String, required: false, default: "Hoạt Động"},
    role: {type: Boolean, required: false, default: false }
})

module.exports = mongoose.models.user || mongoose.model('user', usersSchema);