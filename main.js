import {Markup, Telegraf} from "telegraf";
import 'dotenv/config'
import {message} from "telegraf/filters";
import mongoose from "mongoose";
import {ApplicationService} from "./application/application.service.js";
import {SessionService} from "./session/session.service.js";
import express from "express";

const bot = new Telegraf(process.env.BOT_API_KEY);
const applicationService = new ApplicationService();
const sessionService = new SessionService();
const healthCheckApp = express();
healthCheckApp.listen(8080, () => console.log('Health check is running...'));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'bot-db',
}).then(() => console.log('Connected to mongodb...'));

const keyboard = Markup.keyboard([
  Markup.button.callback('Оставить заявку', 'paste_application'),
  Markup.button.callback('Мои заявки', 'my_applications'),
  Markup.button.callback('Поддержка', 'support'),
]);

bot.start((ctx) => {
  ctx.reply('Привет!', keyboard);
});

bot.hears('Оставить заявку', async (ctx) => {
  const session = await sessionService.findByTelegramId(ctx.from.id);

  if (!session) {
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

  if (!session.text) {
    ctx.reply(
      'Опишите суть проблемы и отправьте сообщение', {
        reply_markup: {
          force_reply: true,
          input_field_placeholder: 'Опишите суть проблемы и отправьте сообщение',
        },
      });
  }
});

bot.hears('Мои заявки',  async (ctx) => {
  const applications = await applicationService.findAllByTelegramId(ctx.from.id);

  if (!applications) {
    ctx.reply('Вы еще не оставляли заявок');
    return;
  }

  for (const application of applications) {
    const applicationDate = new Date(application.date).toLocaleString('uk', { timeZone: 'Europe/Kiev'});
    const text = `Имя: ${application.name} \nДата: ${applicationDate} \n\n ${application.text}`;
    ctx.reply(text);
  }
});

bot.hears('Поддержка', (ctx) => ctx.reply('По каким-либо вопросам пишите @…'));

bot.on(message('text'), async (ctx) => {
  const session = await sessionService.findByTelegramId(ctx.from.id);

  if (!session) {
    await sessionService.create(ctx.from.id, ctx.message.text);
    ctx.reply(
      'Опишите суть проблемы и отправьте сообщение', {
        reply_markup: {
          force_reply: true,
          input_field_placeholder: 'Опишите суть проблемы и отправьте сообщение',
        },
      });
    return;
  }

  if (!session.text) {
    applicationService.create(
      session.telegramId,
      session.name,
      new Date(),
      ctx.message.text,
    );
    ctx.reply('Ваша завка принята и будет рассмотрена в ближайшее время', keyboard);
    await sessionService.deleteByTelegramId(session.telegramId);
  }
})

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
