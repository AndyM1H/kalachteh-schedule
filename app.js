// require("dotenv").config();
const TOKEN = process.env.VK_API_KEY;
const express = require("express");
const bodyParser = require("body-parser");
const { Botact } = require("botact");
const schedule = require("./schedule");

const bot = new Botact({
  confirmation: "6f115fc4",
  token: TOKEN
});

const port = process.env.PORT || 8000;
const app = express();

app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});

bot.addScene(
  "wizard",
  ({ reply, scene: { next } }) => {
    next();
    reply("Привет, нажми начать!", null, {
      one_time: false,
      buttons: [
        [
          {
            action: {
              type: "text",
              payload: {
                button: "start"
              },
              label: "Начать"
            },
            color: "primary"
          }
        ]
      ]
    });
  },
  ({ reply, body, scene: { leave } }) => {
    leave();
  }
);

bot.command("join", ({ scene: { join } }) => join("wizard"));

bot.command("end", ctx => {
  ctx.reply("end", null, {
    one_time: true,
    buttons: [
      [
        {
          action: {
            type: "text",
            payload: {
              button: "Начать"
            },
            label: "Начать"
          },
          color: "secondary"
        }
      ]
    ]
  });
});

bot.command("Начать", ctx => {
  ctx.reply("Выбери группу, чтобы получить расписание", null, {
    one_time: false,
    buttons: [
      [
        {
          action: {
            type: "text",
            payload: {
              button: "Б12"
            },
            label: "Б12"
          },
          color: "secondary"
        },
        {
          action: {
            type: "text",
            payload: {
              button: "Б22"
            },
            label: "Б22"
          },
          color: "secondary"
        },
        {
          action: {
            type: "text",
            payload: {
              button: "Б32"
            },
            label: "Б32"
          },
          color: "secondary"
        }
      ],
      [
        {
          action: {
            type: "text",
            payload: {
              button: "Бух11"
            },
            label: "Бух11"
          },
          color: "primary"
        },
        {
          action: {
            type: "text",
            payload: {
              button: "Бух21"
            },
            label: "Бух21"
          },
          color: "primary"
        },
        {
          action: {
            type: "text",
            payload: {
              button: "Бух31"
            },
            label: "Бух31"
          },
          color: "primary"
        }
      ],
      [
        {
          action: {
            type: "text",
            payload: {
              button: "Т13"
            },
            label: "Т13"
          },
          color: "positive"
        },
        {
          action: {
            type: "text",
            payload: {
              button: "Т23"
            },
            label: "Т23"
          },
          color: "positive"
        },
        {
          action: {
            type: "text",
            payload: {
              button: "Т33"
            },
            label: "Т33"
          },
          color: "positive"
        },
        {
          action: {
            type: "text",
            payload: {
              button: "Т43"
            },
            label: "Т43"
          },
          color: "positive"
        }
      ]
    ]
  });
});

bot.on(async ctx => {
  let data = await schedule.getSchedule(ctx.text);
  ctx.reply(data ? data.join("") : "На эту группу пока нет расписания :-(");
});

// Bot's endpoint
app.post("/", bot.listen);
