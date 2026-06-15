const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kiss")
    .setDescription("Kiss someone")
    .addUserOption(o => o.setName("user").setDescription("User").setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    await interaction.reply(`${interaction.user} kissed ${user}!`);
  }
};