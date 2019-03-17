require('dotenv').load();
const TOKEN = process.env.VK_API_KEY;
const express = require('express');
const bodyParser = require('body-parser');
const {Bot, Keyboard, KeyboardColor} = require('node-vk-bot');
const bot = new Bot({
  token: TOKEN,
  group_id: 179100601,
  api: {
    lang: 'ru'
  }
});

const port = 8000;
const app = express();

app.use(bodyParser.json());

app.post('/', (req, res) => {
  if (req.body.type == 'confirmation') return res.send('6f115fc4');
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});

bot.get(/Hi|Привет|Hey/i, (message, exec, reply) => {
  const keyboard = new Keyboard().addButton('Привет!', KeyboardColor.POSITIVE);
  const options = {forward_messages: message.id, keyboard};

  bot
    .api('users.get', {user_ids: message.from_id})
    .then(res => reply('Привет ' + res[0].first_name));
});
