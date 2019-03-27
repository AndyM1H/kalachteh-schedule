const needle = require("needle");
const cheerio = require("cheerio"),
  cheerioTableparser = require("cheerio-tableparser");

exports.isGroup = function(req_group) {
  function convert(group) {
    return group.replace(/-/g, "");
  }

  function ucFirst(str) {
    // только пустая строка в логическом контексте даст false
    if (!str) return str;
    return str[0].toUpperCase() + str.slice(1);
  }

  let groups = [
    "Б12",
    "Б22",
    "Б32",
    "Бух11",
    "Бух21",
    "Бух31",
    "Т13",
    "Т23",
    "Т33",
    "Т43"
  ];
  req_group = convert(req_group);
  req_group = req_group.toLowerCase();
  req_group = ucFirst(req_group).replace(/ /g, "");
  let found = {};
  found.status = groups.includes(req_group);
  found.group = req_group;
  return found;
};

function toString(date) {
  date = [
    correctDate(date.getDate()),
    correctDate(date.getMonth() + 1),
    date.getFullYear()
  ];
  date = date.join(".").replace(/(^|\/)(\d)(?=\/)/g, "$10$2");
  return date;
}
function toDate(date) {
  date = date.split(".");
  date = new Date(date[2], +date[1] - 1, +date[0]);
  return date;
}
// string data
function addDays(data, day) {
  data = data.split(".");
  data = new Date(data[2], +data[1] - 1, +data[0] + day, 0, 0, 0, 0);
  data = [
    correctDate(data.getDate()),
    correctDate(data.getMonth() + 1),
    data.getFullYear()
  ];
  data = data.join(".").replace(/(^|\/)(\d)(?=\/)/g, "$10$2");
  return data;
}

function findIndexInArray(array, search) {
  for (var i = 0; i < array[0].length; i++) {
    let j = array[0][i].indexOf(search);

    if (j >= 0) {
      return i;
    }
  }
  return 0;
}

var correctDate = i => {
  return i < 10 ? "0" + i : i;
};

exports.getSchedule = async function(req_group) {
  const url = "http://kalachteh.ru/schedule/kioskschedule.html";

  let res_needle = await needle("get", url);
  let $ = cheerio.load(res_needle.body);
  cheerioTableparser($);
  let data = $("table").parsetable(true, true, true);

  let date = new Date();
  date = toString(date);
  date = addDays(date, 1);

  let index = findIndexInArray(data, date);
  let dateOfSchedule = data[0][index].replace(
    new RegExp("Группа|[/\\\\/]|пара", "g"),
    ""
  );
  let group = {};
  let schedule = "";
  if (index === undefined) {
    index = 1;
  }
  for (let i = index; i < index + 11; i++) {
    group = data[0][i];
    if (group == req_group) {
      schedule = [
        dateOfSchedule,
        `\nГруппа: ${group}`,
        `\n1 пара: ${
          data[1][i] != "//"
            ? data[1][i].replace(new RegExp("([:)\n//])", "g"), "  ")
            : "-"
        } `
          .replace(/\d{3}/g, " $& ")
          .replace(/культ/g, "$& "),
        `\n2 пара: ${
          data[2][i] != "//"
            ? data[2][i].replace(new RegExp("[:)\n//]", "g"), "  ")
            : "-"
        }`
          .replace(/\d{3}/g, " $& ")
          .replace(/культ/g, "$& "),
        `\n3 пара: ${
          data[3][i] != "//"
            ? data[3][i].replace(new RegExp("[:)\n//]", "g"), "  ")
            : "-"
        }`
          .replace(/\d{3}/g, " $& ")
          .replace(/культ/g, "$& "),
        `\n4 пара: ${
          data[4][i] != "//"
            ? data[4][i].replace(new RegExp("[:)\n//]", "g"), "  ")
            : "-"
        }`
          .replace(/\d{3}/g, " $& ")
          .replace(/культ/g, "$& "),
        `\n5 пара: ${
          data[5][i] != "//"
            ? data[5][i].replace(new RegExp("[:)\n//]", "g"), "  ")
            : "-"
        }`
          .replace(/\d{3}/g, " $& ")
          .replace(/культ/g, "$& "),
        `\n6 пара: ${
          data[6][i] != "//"
            ? data[6][i].replace(new RegExp("[:)\n//]", "g"), "  ")
            : "-"
        }\n`
          .replace(/\d{3}/g, " $& ")
          .replace(/культ/g, "$& ")
      ];
    }
  }

  for (let i = 0; i < schedule.length; i++) {
    schedule[i] = schedule[i]
      .split(" ")
      .filter(function(allItems, i, a) {
        return i == a.indexOf(allItems);
      })
      .join(" ");
  }
  return schedule;
};
