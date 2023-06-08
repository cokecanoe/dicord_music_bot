const { Player } = require("discord-player");
const { Collection, REST, Routes } = require("discord.js");
const dotenv = require("dotenv");
const { client } = require("./src/functions/client.js");
const fs = require("fs");

const player = new Player(client, {
  ytdlOptions: { quality: "highestaudio", highWaterMark: 1 << 25 },
});
dotenv.config();
const slashCommands = new Collection();

let commands = [];
const TOKEN =
  "MTExMjk0ODMwNzg4NzY2NTIxNA.GXqodc.ZGE-3YpDPH6VRAffOfjPiBkmyKk3PbgM_hOY1o";
const LOAD_SLASH = process.argv[2] == "load";
const CLIENT_ID = "1112948307887665214";
const GUILD_ID = "322970417537220609";
const slashFiles = fs
  .readdirSync("./src/slash")
  .filter((file) => file.endsWith(".js"));

for (const file of slashFiles) {
  const slashcmd = require(`./slash/${file}`);
  slashCommands.set(slashcmd.data.name, slashcmd);
  if (LOAD_SLASH) commands.push(slashcmd.data.toJSON());
}

if (LOAD_SLASH) {
  const rest = new REST({ version: 9 }).setToken(TOKEN);
  console.log("Deploying slash commands");
  rest
    .put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    })
    .then(() => {
      console.log("Successfully loaded");
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
} else {
  client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}`);
  });
  client.on("interactionCreate", (interaction) => {
    const handleCommand = async () => {
      if (!interaction.isCommand()) return;
      const slashcmd = client.slashCommands.get(interaction.commandName);
      if (!slashcmd) interaction.reply("Not a valid slash command");

      await interaction.deferReply();
      await slashcmd.run({ client, interaction });
    };
    handleCommand();
  });
  client.login(TOKEN);
}
