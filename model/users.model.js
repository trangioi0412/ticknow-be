const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema ({
    name: {type: String, required: true},
    phone: { type: String, required: false, default: ""},
    email: { type: String, required: true },
    password: { type: String, required: true },
    year: { type: Date, required: true},
    status: { type: Boolean, required: false, default: true},
    role: {type: Boolean, required: false, default: false }
}, { versionKey: false, timestamps: true});

module.exports = mongoose.models.user || mongoose.model('user', usersSchema);