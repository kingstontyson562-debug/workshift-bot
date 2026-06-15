const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("drinkwith")
    .setDescription("Drink with someone")
    .addUserOption(o =>
      o.setName("user").setDescription("User").setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    await interaction.reply(`${interaction.user} drank with ${user}, getting tipsy!`);
  }
};