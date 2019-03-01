const needle = require('needle');
const cheerio = require('cheerio'),
  cheerioTableparser = require('cheerio-tableparser');
const async = require('async');
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const each = require('async-each');
var fs = require('fs');

// get JSON data (emails of groups...)
let json_data = fs.readFileSync('emails.json', 'utf8');
json_data = JSON.parse(json_data);
// json_data['groups']['Б12']['emails']);

var correctDate = i => {
  return i < 10 ? '0' + i : i;
};

const url = 'http://kalachteh.ru/schedule/kioskschedule.html';
const i = schedule.scheduleJob('0 0 12 * * 1-6', () => {
  const j = schedule.scheduleJob('* */15 12-13 * * *', () => {
    needle.get(url, (err, res) => {
      if (err) throw err;

      let transporter = nodemailer.createTransport({
        pool: true,
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'travon.medhurst24@ethereal.email', // generated ethereal user
          pass: 'f4GpmPAES6mNTHZJ2j' // generated ethereal password
        }
      });

      let $ = cheerio.load(res.body);
      cheerioTableparser($);
      var data = $('table').parsetable(true, true, true);
      let date = data[0][0];
      let cutIndex = date.indexOf('Группа');
      scheduleDate = `Расписание на ${date.slice(0, cutIndex)}`;
      date = date.slice(14, 16);
      let dateNow = new Date();
      let scheduleCurrent = `Расписание на ${correctDate(
        dateNow.getDate()
      )}.${correctDate(dateNow.getMonth() + 1)}.${dateNow.getFullYear()}`;

      // Если расписание на сегодня готово в полном объеме (т.е на все группы)
      if (data[0][11].includes(scheduleCurrent)) {
        let pairs = {},
          group = {};
        for (let i = 1; i < 10 + 1; i++) {
          group = data[0][i];
          let htmlTable = `
          <table>
            <tr>
              <thead>
                <td>1-ая пара<td>
                <td>2-ая пара<td>
                <td>3-ая пара<td>
                <td>4-ая пара<td>
                <td>5-ая пара<td>
                <td>6-ая пара<td>
              </thead>
            </tr>
            <tr>
              <td>${data[1][i]}<td>
              <td>${data[2][i]}<td>
              <td>${data[3][i]}<td>
              <td>${data[4][i]}<td>
              <td>${data[5][i]}<td>
              <td>${data[6][i]}<td>
            </tr>
          </table>
        `;

          async.each(
            json_data['groups'][group]['emails'],
            (mail, cb) => {
              let mailOptions = {
                from: 'kalachtehschedule@gmail.com',
                to: mail,
                subject: `${scheduleDate} [kalachteh.ru]`,
                text: `Привет! Держи ${scheduleDate}!\n`,
                html: `<b>${htmlTable}</b>` // html body
              };

              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  return console.log(error);
                } else {
                  console.log(`Email successfully sent! ${mail}`);
                  cb(null, info);
                }
              });
            },
            (error, info) => {
              if (error) return console.log(error);
              console.log('done');
              // transporter.close();
              j.cancel();
            }
          );
        }
      }
    });
  });
});
