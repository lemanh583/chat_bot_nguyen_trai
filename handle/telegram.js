const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const messageSchema = require("../schema/message");
const questionSchema = require("../schema/question");
const fs = require("fs");
const path = require("path");

class TelegramBot {
  constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
  }

  listen() {
    console.log("__bot started ___");

    this.bot.start(async (ctx) => {
      const question = await questionSchema.findOne({ command: "/start" }).sort({ createdAt: -1 });
      const options = await questionSchema.find({ parent_id: question._id }).sort({ createdAt: 1 });
      const buttons = options.map((item) => {
        return {
          text: item.option,
          callback_data: "call_" + item._id.toString(),
        };
      });

      // ctx.replyWithPhoto({ source: fs.createReadStream( path.join(__dirname, '../image/start.png')) });

      const m = await ctx.reply(question.content, {
        reply_markup: {
          inline_keyboard: [buttons],
        },
      });

      await messageSchema.create({
        message_id: m.message_id,
        sender_id: m.from?.sender_id,
        sender_name: m.from?.first_name,
        sender_username: m.from?.username,
        type: "bot",
        body: m.text,
        timestamp: m.date,
        topic_id: question._id,
      });
    });

    this.bot.help((ctx) => ctx.reply("Send me /start"));

    // on message
    this.bot.on(message("text"), async (ctx) => {
      if (ctx.update.message?.reply_to_message && ctx.update.message?.text) {
        const reply = ctx.update.message?.reply_to_message;
        const text = ctx.update.message?.text;

        const prevMessageReply = await messageSchema.findOne({ message_id: String(reply.message_id) });
        if (!prevMessageReply) return;

        const replyText = await questionSchema.findOne({ parent_id: prevMessageReply.topic_id, option: text });
        if (!replyText) {
          ctx.reply("Not Found");
          return;
        }

        const options = await questionSchema.find({ parent_id: replyText._id }).sort({ createdAt: 1 });

        const buttons = options.map((item) => {
          return {
            text: item.option,
            callback_data: "call_" + item._id.toString(),
          };
        });

        const mentionText = `[${ctx.update?.message?.from?.first_name + ' ' + ctx.update?.message?.from?.last_name}](tg://user?id=${ctx.update?.message?.from?.id})`;

        const m = await ctx.reply(`${mentionText} \n \n ${replyText.content}`, {
          reply_markup: {
            inline_keyboard: [buttons],
          },
          parse_mode: 'Markdown'
        });

        messageSchema.create({
          message_id: m.message_id,
          sender_id: m.from?.sender_id,
          sender_name: m.from?.first_name,
          sender_username: m.from?.username,
          type: "bot",
          body: m.text,
          timestamp: m.date,
          topic_id: replyText._id,
        });
      }
      // console.log("ctx", ctx.update.message);
      // const m = await ctx.reply('heheh');
      // console.log("m", m);
    });

    // this.bot.on(message(""))
    this.bot.action(/^call_.*/, async (ctx) => {
      const data = ctx.update.callback_query;
      // console.log("ctx", ctx.update.callback_query);

      const replyText = await questionSchema.findOne({ _id: data?.data.replace("call_", "") });
      if (!replyText) {
        ctx.reply("Not Found");
        return;
      }
      const options = await questionSchema.find({ parent_id: replyText._id }).sort({ createdAt: 1 });

      const buttons = options.map((item) => {
        return {
          text: item.option,
          callback_data: "call_" + item._id.toString(),
        };
      });

      const mentionText = `[${data.from?.first_name + ' ' + data.from?.last_name}](tg://user?id=${data.from?.id})`;
      const m = await ctx.reply(`${mentionText} \n \n ${replyText.content}`, {
        reply_markup: {
          inline_keyboard: [buttons],
        },
        parse_mode: 'Markdown',
      });

      messageSchema.create({
        message_id: m.message_id,
        sender_id: m.from?.sender_id,
        sender_name: m.from?.first_name,
        sender_username: m.from?.username,
        type: "bot",
        body: m.text,
        timestamp: m.date,
        topic_id: replyText._id,
      });

      await ctx.answerCbQuery("");
    });

    this.bot.launch();
  }

  stop() {
    // Enable graceful stop
    process.once("SIGINT", () => this.bot.stop("SIGINT"));
    process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
  }
}

module.exports = TelegramBot;
