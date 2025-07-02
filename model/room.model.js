const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ObjectId = Schema.ObjectId;

const roomSchema = new Schema({
  code_room: { type: String, required: true },
  id_cinema: { type: ObjectId, required: true },
  diagram: {
    row: { type: Number, required: true, max: 15 },
    column: { type: Number, required: true, max: 20 },
    element_remove: { type: Map, of: [Number], default: {} },
    element_selected: { type: Map, of: [Number], default: {} },
    element_selecting: { type: Map, of: [Number], default: {} },
  },
  status: { type: Number, required: false, default: 2 },
}, {
  versionKey: false,
  timestamps: true,
  toObject: {
    transform: function (doc, ret) {
      if (ret.diagram) {
        const convert = map => (map instanceof Map ? Object.fromEntries(map) : map);
        ret.diagram.element_remove = convert(ret.diagram.element_remove);
        ret.diagram.element_selected = convert(ret.diagram.element_selected);
        ret.diagram.element_selecting = convert(ret.diagram.element_selecting);
      }
      return ret;
    }
  }

});

module.exports = mongoose.models.room || mongoose.model('room', roomSchema)