const needle = require('needle');
const cheerio = require('cheerio'),
  cheerioTableparser = require('cheerio-tableparser');

exports.getSchedule = async function(req_group) {
  var correctDate = i => {
    return i < 10 ? '0' + i : i;
  };

  const url = 'http://kalachteh.ru/schedule/kioskschedule.html';

  let res_needle = await needle('get', url);
  let $ = cheerio.load(res_needle.body);
  cheerioTableparser($);
  let data = $('table').parsetable(true, true, true);

  let dateOfSchedule = data[0][0].replace(
    new RegExp('Группа|[/\\\\/]|пара', 'g'),
    ''
  );

  let group = {};
  let schedule = '';
  for (let i = 1; i < 10 + 1; i++) {
    group = data[0][i];
    if (group == req_group) {
      schedule = [
        dateOfSchedule,
        `\nГруппа: ${group}`,
        `\n1 пара: ${
          data[1][i] != '//'
            ? data[1][i].replace(new RegExp('([:)\n//])', 'g'), '  ')
            : '-'
        } `.replace(/\d{3}/g, ' $& '),
        `\n2 пара: ${
          data[2][i] != '//'
            ? data[2][i].replace(new RegExp('[:)\n//]', 'g'), '  ')
            : '-'
        }`.replace(/\d{3}/g, ' $& '),
        `\n3 пара: ${
          data[3][i] != '//'
            ? data[3][i].replace(new RegExp('[:)\n//]', 'g'), '  ')
            : '-'
        }`.replace(/\d{3}/g, ' $& '),
        `\n4 пара: ${
          data[4][i] != '//'
            ? data[4][i].replace(new RegExp('[:)\n//]', 'g'), '  ')
            : '-'
        }`.replace(/\d{3}/g, ' $& '),
        `\n5 пара: ${
          data[5][i] != '//'
            ? data[5][i].replace(new RegExp('[:)\n//]', 'g'), '  ')
            : '-'
        }`.replace(/\d{3}/g, ' $& '),
        `\n6 пара: ${
          data[6][i] != '//'
            ? data[6][i].replace(new RegExp('[:)\n//]', 'g'), '  ')
            : '-'
        }\n`.replace(/\d{3}/g, ' $& ')
      ];
    }
  }
  if (schedule == '') schedule = 'На эту группу пока нет расписания :-(';
  for (let i = 0; i < schedule.length; i++) {
    schedule[i] = schedule[i]
      .split(' ')
      .filter(function(allItems, i, a) {
        return i == a.indexOf(allItems);
      })
      .join(' ');
  }
  return schedule;
};
