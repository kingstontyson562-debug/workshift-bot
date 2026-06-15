const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hideandseek")
    .setDescription("Play hide and seek")
    .addUserOption(o => o.setName("user").setDescription("User").setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");

    const winner = Math.random() < 0.5 ? interaction.user : user;

    await interaction.reply(
      `${interaction.user} played hide and seek with ${user}! ${winner} won!`
    );
  }
};