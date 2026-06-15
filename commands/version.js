const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("version")
    .setDescription("Bot version info"),

  async execute(interaction) {
    await interaction.reply(
      "RoByte is in beta stage. More commands will be added soon!"
    );
  }
};