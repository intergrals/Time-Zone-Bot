const moment = require("moment");
require("moment-timezone");
const Discord = require("discord.js");
const zones = require("./zones.json");

convertErr = msg => {
  msg.channel.send(
    "Usage: **!convert {time} {zone} {new zone} [±day]**. \nFor a list of available time zones, enter **!zones**."
  );
};

module.exports = {
  // !convert {time} {zone} {zone} [±day]
  convert: function(msg, args) {
    // wrong arguments
    if (args.length < 4) {
      console.log("a");
      convertErr(msg);
      return;
    }

    // ensure time given is valid
    if (!/^\d{1,2}:\d{2}(am|pm)$/i.test(args[1])) {
      convertErr(msg);
      return;
    }

    var time = args[1].split(":");

    args[2] = args[2].toUpperCase();
    args[3] = args[3].toUpperCase();

    // if time zones don't exist (or aren't supported)
    if (!zones.hasOwnProperty(args[2]) || !zones.hasOwnProperty(args[3])) {
      convertErr(msg);
      return;
    }

    // get time in local time zone
    hour = parseInt(time[0]);
    minute = parseInt(time[1].substring(0, 2));
    isPM = time[1].substring(2).toUpperCase() === "PM";
    addDay = 0;

    if (isPM && hour != 12) hour += 12;
    else if (!isPM && hour === 12) hour = 0;

    if (hour > 24 || minute >= 60 || (hour >= 24 && minute > 0)) {
      convertErr(msg);
      return;
    }

    // change day if provided
    if (args.length >= 5) {
      if (args[4] === "yesterday") {
        addDay = -1;
      } else if (args[4] === "tomorrow") {
        addDay = 1;
      } else if (args[4] === "today") {
        addDay = 0;
      } else {
        if (!/^[-+]?\d+$/.test(args[4])) {
          convertErr(msg);
          return;
        }
        addDay = parseInt(args[4]);
      }
    }

    var date = moment()
      .add(addDay, "days")
      .tz(zones[args[2]]);
    date.set({ hour: hour, minute: minute });

    var date2 = date.clone().tz(zones[args[3]]);

    msg.channel.send(
      `${date.format("MMMM Do, YYYY | hh:mmA")} ${args[2]} = \n${date2.format(
        "MMMM Do, YYYY | hh:mmA"
      )} ${args[3]}`
    );
  },

  listZones: function(msg) {
    var zonelst = "";
    for (var key in zones) {
      if (zonelst) zonelst += ", ";
      zonelst += key;
    }

    msg.channel.send("Supported timezones: " + zonelst);
  }
};
