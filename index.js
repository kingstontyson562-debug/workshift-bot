const {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
  REST,
  Routes
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ---------------- ENV ----------------
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// ---------------- CLIENT ----------------
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ---------------- COMMAND COLLECTION ----------------
client.commands = new Collection();

// ---------------- LOAD COMMANDS ----------------
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

const slashCommands = [];

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));

  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    slashCommands.push(command.data.toJSON());
  }
}

// ---------------- SETTINGS ----------------
const settingsPath = path.join(__dirname, "data", "settings.json");

function getSettings() {
  try {
    return JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  } catch {
    const fallback = { maintenance: false };
    fs.writeFileSync(settingsPath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

// ---------------- READY ----------------
client.once(Events.ClientReady, async () => {
  console.log(`✅ RoByte logged in as ${client.user.tag}`);

  // ---------------- AUTO DEPLOY COMMANDS ----------------
  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    console.log("🚀 Deploying slash commands...");

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: slashCommands }
    );

    console.log("✅ Slash commands deployed.");
  } catch (err) {
    console.error("❌ Failed to deploy commands:", err);
  }
});

// ---------------- BUTTON HANDLER ----------------
async function handleButtons(interaction) {
  for (const cmd of client.commands.values()) {
    if (cmd.buttonHandler) {
      await cmd.buttonHandler(interaction, client);
    }
  }
}

// ---------------- INTERACTIONS ----------------
client.on(Events.InteractionCreate, async interaction => {

  // ---------------- SLASH COMMANDS ----------------
  if (interaction.isChatInputCommand()) {

    const settings = getSettings();

    // 🔒 MAINTENANCE BLOCK
    if (settings.maintenance) {
      return interaction.reply({
        content:
          "🚧 RoByte is currently under maintenance.\nPlease try again later.\n\nIf no announcement was made, this is likely a reboot.",
        ephemeral: true
      });
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error(err);

      const msg = { content: "❌ An error occurred.", ephemeral: true };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(msg);
      } else {
        await interaction.reply(msg);
      }
    }
  }

  // ---------------- BUTTONS ----------------
  if (interaction.isButton()) {
    await handleButtons(interaction);
  }
});

// ---------------- LOGIN ----------------
client.login(TOKEN);