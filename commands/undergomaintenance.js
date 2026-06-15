const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder } = require("discord.js");

const file = path.join(__dirname, "../data/settings.json");

function load() {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    const fallback = { maintenance: false };
    fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

function save(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function hasRole(member, roleName) {
  return member.roles.cache.some(r => r.name === roleName);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("undergomaintenance")
    .setDescription("Turn maintenance mode on or off")
    .addStringOption(o =>
      o.setName("state")
        .setDescription("on or off")
        .setRequired(true)
        .addChoices(
          { name: "on", value: "on" },
          { name: "off", value: "off" }
        )
    ),

  async execute(interaction) {
    if (!hasRole(interaction.member, "RoByte Owner")) {
      return interaction.reply({
        content: "❌ You don't have permission to use this.",
        ephemeral: true
      });
    }

    const data = load();
    const state = interaction.options.getString("state");

    data.maintenance = state === "on";
    save(data);

    await interaction.reply(
      `🚧 Maintenance mode is now **${state.toUpperCase()}**`
    );
  }
};