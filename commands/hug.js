const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hug")
    .setDescription("Hug someone")
    .addUserOption(o => o.setName("user").setDescription("User").setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    await interaction.reply(`${interaction.user} has hugged ${user}!`);
  }
};