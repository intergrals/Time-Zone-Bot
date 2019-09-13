const tt = require("./time-zone");
const Discord = require("discord.js");
const client = new Discord.Client();
const auth = require("./auth.json");

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

help = msg => {
  msg.channel.send(
    "Available commands:\n\
  **!zones**\n\
  - lists all supported time zones\n\
  **!convert {time} {zone} {new zone} [yesterday/tomorrow/±day]**\n\
  - converts a time from zone to new zone\n\
  - uses date of first time zone provided\n\
  - date can be incremented by specifying a number"
  );
};

client.on("message", msg => {
  if (msg.content.substring(0, 1) === "!") {
    var args = msg.content.substring(1).split(" ");
    var cmd = args[0];

    switch (cmd) {
      case "help":
        help(msg);
        break;
      case "convert":
        tt.convert(msg, args);
        break;
      case "zones":
        tt.listZones(msg);
        break;
      case "myzone":
        tt.setZone(msg, args);
        break;
      case "from":
        tt.convertFrom(msg, args);
        break;
    }
  }
});

client.login(auth.token);
