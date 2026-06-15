const {
  Client,
  GatewayIntentBits,
  Collection,
  Events
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ---------------- ENV ----------------
const TOKEN = process.env.TOKEN;

// ---------------- CLIENT ----------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ---------------- COMMAND COLLECTION ----------------
client.commands = new Collection();

// ---------------- LOAD COMMANDS ----------------
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));

  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

// ---------------- SETTINGS (MAINTENANCE) ----------------
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
client.once(Events.ClientReady, () => {
  console.log(`✅ RoByte logged in as ${client.user.tag}`);
});

// ---------------- BUTTON HANDLER ----------------
async function handleButtons(interaction) {
  for (const command of client.commands.values()) {
    if (command.buttonHandler) {
      await command.buttonHandler(interaction, client);
    }
  }
}

// ---------------- INTERACTION HANDLER ----------------
client.on(Events.InteractionCreate, async interaction => {

  // ---------------- SLASH COMMANDS ----------------
  if (interaction.isChatInputCommand()) {

    // 🔒 MAINTENANCE CHECK (GLOBAL BLOCK)
    const settings = getSettings();

    if (settings.maintenance) {
      return interaction.reply({
        content:
          "🚧 RoByte is currently under maintenance.\nPlease try again later.\n\nIf no announcement was made, this is likely a bug fix.",
        ephemeral: true
      });
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error("Command error:", err);

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