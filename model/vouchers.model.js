const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.ObjectId;

const voucherSchema = new Schema({
    code: {type: String, required: true},
    discount_type: {type: Number, required: true},
    user_count: {type: Number, required: false, default: 0},
    max_users: {type: Number, required: false, default: 0},
    start_date: { type: Date, required: false, default: "0000-00-00"},
    end_day: { type: Date, required: false, default: "0000-00-00"},
    is_active: { type: Boolean, required: false, default: true },
}, { versionKey: false, timestamps: true})

module.exports = mongoose.models.voucher || mongoose.model('voucher', voucherSchema);