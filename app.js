var needle = require("needle");
var cheerio = require("cheerio");
var async = require("async");
var schedule = require('node-schedule');
let nodemailer = require("nodemailer");
var async = require('async');
var each = require('async-each');

var mails = ['andy.mih17@gmail.com']

var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "kalachtehschedule@gmail.com",
      pass: "p4ssw0rdFr0mMyH34rt"
    }
  });

var url = 'http://kalachteh.ru/schedule/kioskschedule.html'

var j = schedule.scheduleJob('* */15 11-23 * * *', function(){
        needle.get(url,function(err,res){
        if(err) throw(err);
       
        var $ = cheerio.load(res.body);
        var date = ($('td.fs0').text());
        var scheduleDate = date.slice(14,24);
        date = date.slice(14,16);
        var dateNow = new Date();
        if (date != dateNow.getDate()) {
          var schedule = ($('tr').text());
          dateNow = new Date();
          // Поиск конца расписания на завтра
          var endSchedule = schedule.indexOf(`Расписание на ${dateNow.getDate()}.${dateNow.getMonth()+1}.${dateNow.getFullYear()}`); 
          // Оставляем в расписании только расписание на завтра
          schedule = schedule.slice(0,endSchedule);
          // Поиск нужной группы
          var startInd = schedule.indexOf('Т33');
          var endInd = schedule.indexOf('Т43');
          schedule = schedule.slice(startInd, endInd);

          async.each(mails, function(mail, cb) {
            let mailOptions = {
              from: "kalachtehschedule@gmail.com",
              to: mail,
              subject: `Расписание на ${scheduleDate}! [kalachteh.ru]`,
              text: `Привет! Держи расписание на ${scheduleDate}!\n ${schedule}`
            };

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                return console.log(error);
              } else {
                console.log(`Email successfully sent! ${mail}`);
                cb(null, info);
              }
            });
          }, function(error, info) {
            if (error) return console.log(error);
            console.log('done')
            j.cancel();
          });

          
        }
    });
});

