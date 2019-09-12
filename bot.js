const Discord = require("discord.js");
const client = new Discord.Client();
const auth = require("./auth.json");
const zones = require("./zones.json");

convertErr = msg => {
  msg.channel.send(
    "Usage: **!convert {time} {zone} {new zone}**. \nFor a list of available time zones, enter **!zones**."
  );
};

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("message", msg => {
  if (msg.content.substring(0, 1) === "!") {
    var args = msg.content.substring(1).split(" ");
    var cmd = args[0];

    switch (cmd) {
      case "help":
        //TODO: Insert help manual here
        break;
      case "convert":
        // !convert {time} {zone} {zone}

        // wrong arguments
        if (args.length !== 4) {
          convertErr(msg);
          return;
        }

        var time = args[1].split(":");

        // if input is not a unit of time
        if (time[1].length < 2 || /\D/.test(time[0])) {
          convertErr(msg);
          return;
        }

        // if time zones don't exist (or aren't supported)
        if (!zones.hasOwnProperty(args[2]) || !zones.hasOwnProperty(args[3])) {
          convertErr(msg);
          return;
        }

        var hour =
          parseInt(time[0]) +
          (time[1].substring(2).toUpperCase() === "PM" ? 12 : 0);

        if (hour === 12 && time[1].substring(2).toUpperCase() === "AM") {
          hour = 0;
        }

        var diff = zones[args[3]] - zones[args[2]];

        hour = (hour + diff) % 24;

        isPM = hour > 12;
        if (isPM) hour -= 12;

        var newTime =
          hour.toString() +
          ":" +
          time[1].substring(0, 2) +
          (isPM ? "PM" : "AM");

        msg.channel.send(
          `${args[1]} ${args[2]} => ${diff > 0 ? "+" : "-"}${Math.abs(
            diff
          )} hours => ${newTime} ${args[3]}.`
        );
    }
  }
});

client.login(auth.token);
