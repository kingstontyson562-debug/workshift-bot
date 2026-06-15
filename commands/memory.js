const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const games = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("memory")
    .setDescription("Memory game")
    .addStringOption(option =>
      option
        .setName("difficulty")
        .setDescription("Easy, Medium, Hard")
        .setRequired(true)
        .addChoices(
          { name: "Easy", value: "easy" },
          { name: "Medium", value: "medium" },
          { name: "Hard", value: "hard" }
        )
    ),

  async execute(interaction) {
    const difficulty = interaction.options.getString("difficulty");

    let length = 3;
    let speed = 2500;

    if (difficulty === "medium") {
      length = 5;
      speed = 1800;
    } else if (difficulty === "hard") {
      length = 8;
      speed = 1200;
    }

    const colors = ["🟥", "🟦", "🟩", "🟨"];
    const sequence = [];

    for (let i = 0; i < length; i++) {
      sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    }

    games.set(interaction.user.id, { sequence, index: 0 });

    await interaction.reply(`Memorize:\n\n${sequence.join(" ")}`);

    setTimeout(async () => {
      const row = new ActionRowBuilder().addComponents(
        colors.map(c =>
          new ButtonBuilder()
            .setCustomId(`mem_${c}_${interaction.user.id}`)
            .setLabel(c)
            .setStyle(ButtonStyle.Secondary)
        )
      );

      await interaction.editReply({
        content: "Repeat the sequence:",
        components: [row]
      });
    }, speed);
  },

  games
};