const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.ObjectId;

const ticketSchema = new Schema ({
    id_user: { type: ObjectId, required: true },
    id_screening: { type: ObjectId, required: true },
    seat: { type: Array, required: true },
    id_voucher: { type: ObjectId, required: false, default: ""},
    price: { type: Number, required: true },
    type: { type: Number, required: false, default: 1},
}, {versionKey: false, timestamps: true})

module.exports = mongoose.models.ticket || mongoose.model('ticket', ticketSchema);