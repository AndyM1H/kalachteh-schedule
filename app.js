// require('dotenv').load();
const TOKEN = process.env.VK_API_KEY;
const express = require('express');
const bodyParser = require('body-parser');
const {Botact} = require('botact');
const schedule = require('./schedule');

const bot = new Botact({
  confirmation: '6f115fc4',
  token: TOKEN
});

const port = process.env.PORT || 8000;
const app = express();

app.use(bodyParser.json());

app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});

bot.addScene(
  'wizard',
  ({reply, scene: {next}}) => {
    next();
    reply('Привет, нажми начать!', null, {
      one_time: false,
      buttons: [
        [
          {
            action: {
              type: 'text',
              payload: {
                button: 'start'
              },
              label: 'Начать'
            },
            color: 'primary'
          }
        ]
      ]
    });
  },
  ({reply, body, scene: {leave}}) => {
    leave();
  }
);

bot.command('join', ({scene: {join}}) => join('wizard'));

bot.command('end', ctx => {
  ctx.reply('end', null, {
    one_time: true,
    buttons: [
      [
        {
          action: {
            type: 'text',
            payload: {
              button: 'Начать'
            },
            label: 'Начать'
          },
          color: 'secondary'
        }
      ]
    ]
  });
});

bot.command('Начать', ctx => {
  ctx.reply('Выбери группу, чтобы получить расписание', null, {
    one_time: false,
    buttons: [
      [
        {
          action: {
            type: 'text',
            payload: {
              button: 'Б12'
            },
            label: 'Б12'
          },
          color: 'secondary'
        },
        {
          action: {
            type: 'text',
            payload: {
              button: 'Б22'
            },
            label: 'Б22'
          },
          color: 'secondary'
        },
        {
          action: {
            type: 'text',
            payload: {
              button: 'Б32'
            },
            label: 'Б32'
          },
          color: 'secondary'
        }
      ],
      [
        {
          action: {
            type: 'text',
            payload: {
              button: 'Бух11'
            },
            label: 'Бух11'
          },
          color: 'primary'
        },
        {
          action: {
            type: 'text',
            payload: {
              button: 'Бух21'
            },
            label: 'Бух21'
          },
          color: 'primary'
        },
        {
          action: {
            type: 'text',
            payload: {
              button: 'Бух31'
            },
            label: 'Бух31'
          },
          color: 'primary'
        }
      ],
      [
        {
          action: {
            type: 'text',
            payload: {
              button: 'Т13'
            },
            label: 'Т13'
          },
          color: 'positive'
        },
        {
          action: {
            type: 'text',
            payload: {
              button: 'Т23'
            },
            label: 'Т23'
          },
          color: 'positive'
        },
        {
          action: {
            type: 'text',
            payload: {
              button: 'Т33'
            },
            label: 'Т33'
          },
          color: 'positive'
        },
        {
          action: {
            type: 'text',
            payload: {
              button: 'Т43'
            },
            label: 'Т43'
          },
          color: 'positive'
        }
      ]
    ]
  });
});

bot.on(async ctx => {
  if (isGroup(ctx.text)) {
    let data = await schedule.getSchedule(ctx.text);
    ctx.reply(data.join(''));
  } else {
    ctx.reply('Я не понимаю. Я могу отправлять только расписание!');
  }
});

function isGroup(group) {
  let groups = [
    'Б12',
    'Б22',
    'Б32',
    'Бух11',
    'Бух21',
    'Бух31',
    'Т13',
    'Т23',
    'Т33',
    'Т43'
  ];
  let found = groups.includes(group);
  if (found) return true;
  else return false;
}

// Bot's endpoint
app.post('/', bot.listen);
