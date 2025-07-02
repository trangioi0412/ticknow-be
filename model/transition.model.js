const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.ObjectId;

const transitionSchema = new Schema ({
    id_ticket: { type: ObjectId, required: true, ref: "ticket"},
    id_payMethod: { type: ObjectId, required: true, ref: "payMethod" },
    amount: { type: String, required: true },
    payment_time: { type: Date, required: false, default: Date.now()},
    status: { type: String, required: true} 
}, {versionKey: false, timestamps: true})

module.exports = mongoose.models.transition || mongoose.model('transition', transitionSchema);