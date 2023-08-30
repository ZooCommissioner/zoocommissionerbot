import {Markup, Telegraf} from "telegraf";
import 'dotenv/config'
import {message} from "telegraf/filters";
import mongoose from "mongoose";
import {session} from "telegraf-session-mongoose";
import {ApplicationService} from "./application/application.service.js";

const bot = new Telegraf(process.env.BOT_API_KEY);
const applicationService = new ApplicationService();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'bot-db',
}).then(() => console.log('Connected to mongodb...'));

bot.use(session({ sessionName: 'bot-db' }));

const keyboard = Markup.keyboard([
  Markup.button.callback('Оставить заявку', 'paste_application'),
  Markup.button.callback('Мои заявки', 'my_applications'),
  Markup.button.callback('Поддержка', 'support'),
]);

bot.start((ctx) => {
  ctx.reply('Привет!', keyboard);
});

bot.hears('Оставить заявку', (ctx) => {
  if (!ctx.session.name) {
    ctx.reply(
      'Введите имя',
      {
      reply_markup: {
        force_reply: true,
        input_field_placeholder: 'Введите имя',
      },
    });
    return;
  }

  if (!ctx.session.text) {
    ctx.reply(
      'Опишите суть проблемы и отправьте сообщение', {
        reply_markup: {
          force_reply: true,
          input_field_placeholder: 'Опишите суть проблемы и отправьте сообщение',
        },
      });
  }
});

bot.hears('Мои заявки', (ctx) => ctx.reply('my_application'));

bot.hears('Поддержка', (ctx) => ctx.reply('support'));

bot.on(message('text'), (ctx) => {
  if (!ctx.session.name) {
    ctx.session.name = ctx.message.text;
    ctx.reply(
      'Опишите суть проблемы и отправьте сообщение', {
        reply_markup: {
          force_reply: true,
          input_field_placeholder: 'Опишите суть проблемы и отправьте сообщение',
        },
      });
    return;
  }

  if (!ctx.session.text) {
    ctx.session.text = ctx.message.text;
    applicationService.pasteApplication(
      ctx.from.id,
      ctx.session.name,
      new Date(ctx.message.date).toLocaleString(),
      ctx.message.text,
    );
    ctx.reply('Ваша завка принята и будет рассмотрена в ближайшее время', keyboard);
  }
})

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
