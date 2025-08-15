const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.ObjectId;

const ticketSchema = new Schema({
    code: { type: Number, required: true },
    id_user: { type: ObjectId, ref: 'user', required: true },
    id_screening: { type: ObjectId, ref: 'screening', required: true },
    seat: { type: Array, required: true },
    id_voucher: { type: ObjectId, required: false, default: null },
    price: { type: Number, required: true },
    type: { type: Number, required: false, default: 2 },
    autoDeleteAt: { type: Date, required: false }
}, { versionKey: false, timestamps: true })


ticketSchema.virtual('rates', {
    ref: 'rate',
    localField: '_id',
    foreignField: 'id_ticket'
});

ticketSchema.set('toObject', { virtuals: true });
ticketSchema.set('toJSON', { virtuals: true });


module.exports = mongoose.models.ticket || mongoose.model('ticket', ticketSchema);