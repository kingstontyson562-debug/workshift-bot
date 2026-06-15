const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const file = path.join(__dirname, "../data/houses.json");

function load() {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function save(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("livewith")
    .setDescription("Ask someone to live with you")
    .addUserOption(o =>
      o.setName("user").setDescription("User").setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`live_yes_${interaction.user.id}_${user.id}`)
        .setLabel("Yes")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`live_no_${interaction.user.id}_${user.id}`)
        .setLabel("No")
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      content: `${user}, do you want to live with ${interaction.user}?`,
      components: [row]
    });
  },

  async buttonHandler(interaction) {
    if (!interaction.customId.startsWith("live_")) return;

    const [_, answer, requesterId, targetId] = interaction.customId.split("_");

    if (interaction.user.id !== targetId) {
      return interaction.reply({ content: "Only you can answer this.", ephemeral: true });
    }

    const file = path.join(__dirname, "../data/houses.json");
    const data = JSON.parse(fs.readFileSync(file, "utf8"));

    if (answer === "yes") {
      data[requesterId] = targetId;
      data[targetId] = requesterId;

      fs.writeFileSync(file, JSON.stringify(data, null, 2));

      return interaction.update({
        content: `<@${requesterId}> is now living with <@${targetId}>!`,
        components: []
      });
    } else {
      return interaction.update({
        content: `<@${targetId}> declined to live with <@${requesterId}>.`,
        components: []
      });
    }
  }
};