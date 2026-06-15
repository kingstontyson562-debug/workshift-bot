const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("holdhands")
    .setDescription("Hold hands with someone")
    .addUserOption(o => o.setName("user").setDescription("User").setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    await interaction.reply(`${interaction.user} held hands with ${user}!`);
  }
};