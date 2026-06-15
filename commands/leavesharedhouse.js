const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder } = require("discord.js");

const file = path.join(__dirname, "../data/houses.json");

function load() {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function save(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leavesharedhouse")
    .setDescription("Leave your shared house with someone")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("User you live with")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const data = load();

    const a = interaction.user.id;
    const b = user.id;

    if (data[a] !== b) {
      return interaction.reply({
        content: "❌ You are not living with this user.",
        ephemeral: true
      });
    }

    delete data[a];
    delete data[b];
    save(data);

    await interaction.reply(`${interaction.user} is no longer living with ${user}.`);
  }
};