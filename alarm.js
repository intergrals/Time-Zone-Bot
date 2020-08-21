const moment = require("moment");
const tt = require("./time-zone");
const zones = require("./zones.json");

const monthsLong = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december"
];
const monthsShort = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec"
];

parseDateTime = (dateTime, zone) => {
  // get date
  var inputDate = "";
  var dateFormat = "";
  if (/\d{4}(\s?[\-\/\s]\s?\d{2}){2}/.test(dateTime)) {
    inputDate = dateTime.match(/\d{4}(\s?[\-\/\s]\s?\d{2}){2}/)[0];
    var separator = inputDate[4];
    dateFormat = "YYYY-MM-DD";
  } else if (
    new RegExp(
      "(" + monthsLong.join("|") + ") \\d{1,2}(st|nd|rd)?,? \\d{4}",
      "i"
    ).test(dateTime)
  ) {
    inputDate = dateTime.match(
      new RegExp(
        "(" + monthsLong.join("|") + ") \\d{1,2}(st|nd|rd)?,? \\d{4}",
        "i"
      )
    )[0];
    dateFormat = "MMMM DD YYYY";
  } else if (
    new RegExp(
      "(" + monthsShort.join("|") + ") \\d{1,2}(st|nd|rd)?,? \\d{4}",
      "i"
    ).test(dateTime)
  ) {
    inputDate = dateTime.match(
      new RegExp(
        "(" + monthsShort.join("|") + ") \\d{1,2}(st|nd|rd)?,? \\d{4}",
        "i"
      )
    )[0];
    dateFormat = "MMM DD YYYY";
  }

  var inputTime = "";
  var timeFormat = "";
  if (/\d{1,2}:\d{2}\s?(am|pm)/i.test(dateTime)) {
    inputTime = dateTime.match(/\d{1,2}:\d{2}\s?(am|pm)/i)[0];
    timeFormat = "h:mm A";
  } else if (/\d{1,2}:\d{2}/.test(dateTime)) {
    inputTime = dateTime.match(/\d{1,2}:\d{2}/)[0];
    timeFormat = "h:mm";
  } else {
    //error case no time provided
    throw "Error: Unable to parse time from input.";
  }

  var format = dateFormat + " " + timeFormat;
  var dt = inputDate + " " + inputTime;

  return moment.tz(dt, format, zones[zone].region);
};

createAlarmMessage = (msg, dt, alarmMsg) => {
  setTimeout(function() {
    msg.author.send(
      "The time is now: **" +
        dt.format("MMMM DD, YYYY - h:mma") +
        "**\n" +
        alarmMsg
    );
  }, dt - new Date().getTime());
};

module.exports = {
  setAlarm: function(msg, args) {
    try {
      // Split message into time and actual alarm message.
      fullMsg = args.slice(1).join(" ");
      partitions = fullMsg.split('"');

      // get time and message (without quotes)
      // assumes time format has no quotes
      tempTime = partitions[0];
      alarmMsg = partitions.slice(1).join('"');
      alarmMsg = alarmMsg.slice(0, -1);

      // get user's time zone
      zone = tt.getZone(msg) || "EDT";

      var dt = parseDateTime(tempTime, zone);
      var curtime = new Date().getTime();

      // Respond with error if date entered has already passed
      if (dt < curtime) {
        msg.reply("Error: Time has already passed.");
        return;
      }

      msg.reply(
        (tt.getZone(msg)
          ? ""
          : "You have not set a default time zone. Using EDT.\n") +
          "Alarm set for " +
          dt.format("MMMM DD, YYYY - h:mma z") +
          "\nMessage: " +
          alarmMsg
      );

      createAlarmMessage(msg, dt, alarmMsg);
    } catch (error) {
      console.log(error);
      msg.reply(error);
    }
  }
};
