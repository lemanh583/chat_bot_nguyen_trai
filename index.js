require("dotenv").config();
const TelegramBot = require("./handle/telegram");
const QuestionHandle = require("./handle/question");
const express = require("express");
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_URL);
    return true;
  } catch (error) {
    console.error("Error connecting to", error);
    return false;
  }
}

const PORT = 5000;
app.listen(PORT, async () => {
  try {
    let conn = await connectDB();
    if (!conn) throw new Error("Connection failed");

    app.post('/api/create', QuestionHandle.create)

    const bot = new TelegramBot();
    bot.listen();
    bot.stop();

    console.log("Server running on port", PORT);
  } catch (error) {
    console.error("Error listening", error);
  }
});
