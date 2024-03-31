const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  message_id: String,
  thread_id: String,
  sender_id: String,
  sender_name: String,
  sender_username: String,
  reply_message_id: String,
  type: String,
  body: String,
  timestamp: String,
  topic_id: { type: Schema.Types.ObjectId, ref: "options", require: false},
  created_time: { type: Number, default: Date.now },
  updated_time: { type: Number, default: Date.now },
});

const message = mongoose.model("messages", messageSchema);
module.exports = message;
