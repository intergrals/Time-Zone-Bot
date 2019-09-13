const moment = require("moment");
require("moment-timezone");
const Discord = require("discord.js");
const zones = require("./zones.json");
var fs = require("fs");
var uZones = JSON.parse(fs.readFileSync("./user-zones.json"));

convertErr = (msg, cmd) => {
  usage = "Usage: ";
  switch (cmd) {
    case "convert":
      usage +=
        "**!convert {time} {zone} {new zone} [±day]**. \nFor a list of supported time zones, enter **!zones**.";
      break;
    case "from":
      usage +=
        "**!from {zone} {time}**. \nFor a list of supported time zones, enter **!zones**.";
      break;
    case "to":
      usage +=
        "**!to {zone} {time}**. \nFor a list of supported time zones, enter **!zones**.";
      break;
  }
  msg.channel.send(usage);
};

module.exports = {
  // !convert {time} {zone} {zone} [±day]
  convert: function(msg, args) {
    // wrong arguments
    if (args.length < 4) {
      convertErr(msg, args[0]);
      return;
    }

    // ensure time given is valid
    if (!/^\d{1,2}:\d{2}(am|pm)$/i.test(args[1])) {
      convertErr(msg, args[0]);
      return;
    }

    var time = args[1].split(":");

    args[2] = args[2].toUpperCase();
    args[3] = args[3].toUpperCase();

    // if time zones don't exist (or aren't supported)
    if (!zones.hasOwnProperty(args[2]) || !zones.hasOwnProperty(args[3])) {
      convertErr(msg, args[0]);
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
      convertErr(msg), args[0];
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
          convertErr(msg, args[0]);
          return;
        }
        addDay = parseInt(args[4]);
      }
    }

    var date = moment()
      .add(addDay, "days")
      .tz(zones[args[2]].region);
    date.set({ hour: hour, minute: minute });

    var date2 = date.clone().tz(zones[args[3]].region);

    msg.channel.send(
      `${date.format("MMMM Do, YYYY | hh:mmA")} ${args[2]} = \n${date2.format(
        "MMMM Do, YYYY | hh:mmA"
      )} ${args[3]}`
    );
  },

  // convert from given time zone to user's default
  convertFrom: function(msg, args) {
    // check for proper input
    if (args.length !== 3) {
      convertErr(msg, args[0]);
      return;
    }

    if (!uZones.hasOwnProperty(msg.author.tag)) {
      msg.reply("you have not set a default time zone.");
      return;
    }

    // create args to send to convert
    newArgs = ["from", args[2], args[1], uZones[msg.author.tag]];

    this.convert(msg, newArgs);
  },

  // sets a user's default time zone
  setZone: function(msg, args) {
    // no argument case: return user's time zone
    if (args.length === 1) {
      if (uZones.hasOwnProperty(msg.author.tag)) {
        msg.reply(`your default time zone is ${uZones[msg.author.tag]}.`);
      } else {
        msg.reply("you have not set a default time zone.");
      }
      return;
    }
    // error case: return error message
    if (args.length !== 2) {
      msg.channel.send("Usage: **!default {zone}**");
      return;
    }

    args[1] = args[1].toUpperCase();

    // no time zone case: display message.
    if (!zones.hasOwnProperty(args[1])) {
      msg.channel.send(
        `Time zone \"${
          args[1]
        }\" not supported. \nFor a list of supported time zones, enter **!zones**.`
      );
      return;
    }

    // set user's default zones
    uZones[msg.author.tag] = args[1];

    fs.writeFile("./user-zones.json", JSON.stringify(uZones), err => {
      if (err) console.log(err);
      else msg.reply(`your time zone has been set to ${args[1]}.`);
    });
  },

  // lists the supported time zones
  listZones: function(msg) {
    var zonelst = "";
    for (var key in zones) {
      if (zonelst) zonelst += ", ";
      zonelst += key;
    }

    msg.channel.send("Supported timezones: " + zonelst);
  }
};
