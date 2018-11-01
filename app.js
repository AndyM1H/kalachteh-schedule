const needle = require("needle");
const cheerio = require("cheerio");
const async = require("async");
const schedule = require('node-schedule');
const nodemailer = require("nodemailer");
const each = require('async-each');


const MAILS = ['andy.mih17@gmail.com']

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "kalachtehschedule@gmail.com",
      pass: "p4ssw0rdFr0mMyH34rt"
    }
  });

var correctDate = (i)  => { 
    return (i < 10)? "0" + i : i;
}
  
const url = 'http://kalachteh.ru/schedule/kioskschedule.html'
const i = schedule.scheduleJob('0 0 11 * * 1-6', 
() => {

  const j = schedule.scheduleJob('* */15 11-13 * * *', () => {
    needle.get(url, (err,res) => {
    if(err) throw(err);
   
    let $ = cheerio.load(res.body);
    let date = ($('td.fs0').text());
    let scheduleDate = date.slice(14,24);
    date = date.slice(14,16);
    let dateNow = new Date();
    if (date != correctDate(dateNow.getDate())) {
      let schedule = ($('tr').text());
      dateNow = new Date();
      // Поиск конца расписания на завтра
      let endSchedule = schedule.indexOf(`Расписание на ${correctDate(dateNow.getDate())}.${correctDate(dateNow.getMonth()+1)}.${dateNow.getFullYear()}`); 
      // Оставляем в расписании только расписание на завтра
      schedule = schedule.slice(0,endSchedule);
      // Поиск нужной группы
      let startInd = schedule.indexOf('Т33');
      let endInd = schedule.indexOf('Т43');
      schedule = schedule.slice(startInd, endInd)
      async.each(MAILS, (mail, cb) => {
        let mailOptions = {
          from: "kalachtehschedule@gmail.com",
          to: mail,
          subject: `Расписание на ${scheduleDate}! [kalachteh.ru]`,
          text: `Привет! Держи расписание на ${scheduleDate}!\n ${schedule}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          } else {
            console.log(`Email successfully sent! ${mail}`);
            cb(null, info);
          }
        });
      }, (error, info) => {
        if (error) return console.log(error);
        console.log('done')
        j.cancel();
      });      
    }
});
});

})

