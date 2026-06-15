const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

// ---------------- ENV ----------------
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// ---------------- LOAD COMMAND FILES ----------------
const commands = [];

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));

  if (command.data && command.data.toJSON) {
    commands.push(command.data.toJSON());
  }
}

// ---------------- REST CLIENT ----------------
const rest = new REST({ version: "10" }).setToken(TOKEN);

// ---------------- DEPLOY ----------------
(async () => {
  try {
    console.log("🚀 Deploying RoByte slash commands...");

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Commands successfully deployed.");
  } catch (error) {
    console.error("❌ Failed to deploy commands:", error);
  }
})();