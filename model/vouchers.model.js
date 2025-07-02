const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.ObjectId;

const voucherSchema = new Schema({
    code: {type: String, required: true},
    discount_type: {type: Number, required: true},
    user_count: {type: Number, required: false, default: 0},
    max_users: {type: Number, required: true},
    start_date: { type: Date, required: true},
    end_day: { type: Date, required: true},
    is_active: { type: String, required: false, default: "Hoạt Động" },
}, { versionKey: false, timestamps: true})

module.exports = mongoose.models.voucher || mongoose.model('voucher', voucherSchema);