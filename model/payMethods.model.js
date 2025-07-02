const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const payMethodSchema = new Schema ({
    name: {type: String, required: true},
    description: {type: String, required: true},
    logo: {type: String, required: true},
    type: {type: String, required: true},
    dateCreta: {type: Date, required: false, default: Date.now()},
    is_active: {type: Boolean, required: false, default: false}
    },
    { collection: 'payMethods', versionKey: false, timestamps: true }
)

module.exports = mongoose.models.payMethod || mongoose.model('payMethod', payMethodSchema);
