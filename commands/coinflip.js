const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Flip a coin")
    .addStringOption(option =>
      option
        .setName("choice")
        .setDescription("Heads or Tails")
        .setRequired(true)
        .addChoices(
          { name: "Heads", value: "heads" },
          { name: "Tails", value: "tails" }
        )
    ),

  async execute(interaction) {
    const choice = interaction.options.getString("choice");
    const result = Math.random() < 0.5 ? "heads" : "tails";

    if (choice === result) {
      return interaction.reply(`🪙 It landed on **${result.toUpperCase()}**! You won Coinflip!`);
    } else {
      return interaction.reply(`🪙 It landed on **${result.toUpperCase()}**... Oof.. Better luck next time!`);
    }
  }
};