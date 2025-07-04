const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.ObjectId;

const postSchema = new Schema({ 
    id_user: {type: ObjectId, required: true},
    content: {type: String, required: true},
    start_day: {type: Date, required: true},
    end_day: { type: Date, required: true},
    status: { type: Number, required: false, default: 2 },
    image: {type: String, required: true}
}, {versionKey: false, timestamps: true })

module.exports = mongoose.models.post || mongoose.model('post', postSchema);