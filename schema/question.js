const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  command: String, // first message
  option: String,
  content: String,
  parent_id: { type: Schema.Types.ObjectId, ref: "questions", require: false},
  created_time: { type: Number, default: Date.now },
  updated_time: { type: Number, default: Date.now },
});

const questions = mongoose.model("questions", questionSchema);
module.exports = questions;
