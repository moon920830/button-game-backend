const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const socialSchema = new Schema({
  t_id: { type: Schema.ObjectId, required: true, ref: "Item" },
  s_name: { type: String, required: true },
  s_date: { type: Date, required:true}
});

const Social = mongoose.model('Social', socialSchema)

const itemSchema = new Schema({
    t_id: { type: String, required: true },
    t_name: { type: String, required: true },
    mount: { type: Number, required: true }
});

const Item = mongoose.model('Item', itemSchema)

module.exports = { Item, Social }
