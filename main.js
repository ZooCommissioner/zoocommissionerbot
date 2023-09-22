import {Markup, Telegraf} from "telegraf";
import 'dotenv/config'
import {message} from "telegraf/filters";
import mongoose from "mongoose";
import {ApplicationService} from "./application/application.service.js";
import {SessionService} from "./session/session.service.js";
import express from "express";
import {MY_APPLICATIONS, PASTE_APPLICATION, SUPPORT} from "./constaints/button-names.js";
import {
  APPLICATION_REQUEST, APPLICATION_SUBMIT,
  APPLICATION_TEXT,
  APPLICATIONS_NOT_FOUND,
  ENTER_NAME, ENTER_PHONE_NUMBER,
  GREETING,
  NAME, PHONE_NUMBER, SUPPORT_TEXT
} from "./constaints/textes.js";
import {INCORRECT_PHONE_NUMBER} from "./constaints/error-textes.js";

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
  Markup.button.callback(PASTE_APPLICATION, 'paste_application'),
  Markup.button.callback(MY_APPLICATIONS, 'my_applications'),
  Markup.button.callback(SUPPORT, 'support'),
]);

bot.start((ctx) => ctx.reply(GREETING, keyboard));

bot.hears(PASTE_APPLICATION, async (ctx) => {
  const session = await sessionService.findByTelegramId(ctx.from.id);

  if (!session) {
    ctx.reply(
      ENTER_NAME,
      {
      reply_markup: {
        force_reply: true,
        input_field_placeholder: NAME,
      },
    });
    return;
  }

  if (!session.text) {
    ctx.reply(
      APPLICATION_REQUEST, {
        reply_markup: {
          force_reply: true,
          input_field_placeholder: APPLICATION_TEXT,
        },
      });
  }
});

bot.hears(MY_APPLICATIONS,  async (ctx) => {
  const applications = await applicationService.findAllByTelegramId(ctx.from.id);

  if (!applications) {
    ctx.reply(APPLICATIONS_NOT_FOUND);
    return;
  }

  for (const application of applications) {
    const applicationDate = new Date(application.date).toLocaleString('uk', { timeZone: 'Europe/Kiev'});
    const text = `Ім’я: ${application.name} \nДата: ${applicationDate} \n\n ${APPLICATION_TEXT}\n ${application.text}`;
    ctx.reply(text);
  }
});

bot.hears(SUPPORT, (ctx) => ctx.reply(SUPPORT_TEXT));

bot.on(message('text'), async (ctx) => {
  const session = await sessionService.findByTelegramId(ctx.from.id);

  if (!session) {
    await sessionService.create(ctx.from.id, ctx.message.text);
    ctx.reply(
      ENTER_PHONE_NUMBER, {
        reply_markup: {
          force_reply: true,
          input_field_placeholder: PHONE_NUMBER,
        },
      });
    return;
  }

  if (!session.phoneNumber) {
    if (!sessionService.isValidPhoneNumber(ctx.message.text)) {
      ctx.reply(
        INCORRECT_PHONE_NUMBER, {
          reply_markup: {
            force_reply: true,
            input_field_placeholder: PHONE_NUMBER,
          },
        });
      return;
    }

    await sessionService.update(ctx.from.id, { phoneNumber: ctx.message.text });

    ctx.reply(
      APPLICATION_REQUEST, {
        reply_markup: {
          force_reply: true,
          input_field_placeholder: APPLICATION_TEXT,
        },
      });
    return;
  }

  if (!session.text) {
    applicationService.create(
      session.telegramId,
      ctx.from.username,
      session.phoneNumber,
      session.name,
      new Date(),
      ctx.message.text,
    );
    ctx.reply(APPLICATION_SUBMIT, keyboard);
    await sessionService.deleteByTelegramId(session.telegramId);
  }
})

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
