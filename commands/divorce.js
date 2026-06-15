const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder } = require("discord.js");

const file = path.join(__dirname, "../data/marriages.json");

function load() {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function save(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("divorce")
    .setDescription("Divorce your partner")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("Your partner")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const data = load();

    const a = interaction.user.id;
    const b = user.id;

    if (data[a] !== b) {
      return interaction.reply({
        content: "❌ You are not married to this user.",
        ephemeral: true
      });
    }

    delete data[a];
    delete data[b];
    save(data);

    await interaction.reply(`${interaction.user} got divorced with ${user}.`);
  }
};