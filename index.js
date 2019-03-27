// require("dotenv").config();
const schedule = require("./schedule.js");
const Telegraf = require("telegraf");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");
const express = require("express");
const HttpsProxyAgent = require("https-proxy-agent");
const TOKEN = process.env.TOKEN;
const https = require("https");

// const bot = new Telegraf(TOKEN, {
//   telegram: {
//     agent: new HttpsProxyAgent("http://178.128.168.122:8080")
//   }
// });

const app = express();
const port = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.send("Telegram bot is on");
});
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

fakeRequest();

// It is for Heroku wake up
function fakeRequest() {
  https.get("https://calm-escarpment-71381.herokuapp.com");
  setTimeout(fakeRequest, 300000);
}

const bot = new Telegraf(TOKEN);
bot.use(Telegraf.log());

bot.start(ctx => {
  return ctx.reply(
    "Добро пожаловать! Напиши название группы или выбери из списка, чтобы получить расписание.\nКоманды бота:\n/start - запуск/перезапуск бота\n/help - справка",
    Extra.markup(
      Markup.keyboard(
        [
          "Банковское дело",
          "Экономика и бухгалтерский учет",
          "Техник-программист"
        ],
        {
          wrap: (btn, index, currentRow) => currentRow.length >= 1
        }
      )
    )
  );
});

bot.hears("Банковское дело", ctx => {
  return ctx.reply(
    "Банковское дело. Выбери группу",
    Extra.markup(
      Markup.keyboard(["Б12", "Б22", "Б32"], {
        wrap: (btn, index, currentRow) => currentRow.length >= 1
      })
    )
  );
});

bot.hears("Экономика и бухгалтерский учет", ctx => {
  return ctx.reply(
    "Экономика и бухгалтерский учет, выбери группу",
    Extra.markup(
      Markup.keyboard(["Бух11", "Бух21", "Бух31"], {
        wrap: (btn, index, currentRow) => currentRow.length >= 1
      })
    )
  );
});

bot.hears("Техник-программист", ctx => {
  return ctx.reply(
    "Техник-программист, выбери группу",
    Extra.markup(
      Markup.keyboard(["Т13", "Т23", "Т33", "Т43"], {
        wrap: (btn, index, currentRow) => currentRow.length >= 3
      })
    )
  );
});

bot.command("help", ctx =>
  ctx.reply(
    "Для получения расписания нужно:\n1. Написать '/start' боту .\n2. Написать название группы или выбрать из списка специальность.\nКоманды бота:\n/start - запуск/перезапуск бота\n/help - справка"
  )
);

bot.on("message", async ctx => {
  let data = schedule.isGroup(ctx.message.text);
  if (data.status) {
    data = await schedule.getSchedule(data.group);
    ctx.reply(data ? data.join("") : "На эту группу пока нет расписания :-(");
  }
});

bot.launch();
