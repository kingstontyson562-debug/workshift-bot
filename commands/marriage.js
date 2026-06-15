const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const file = path.join(__dirname, "../data/marriages.json");

function load() {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function save(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("marriage")
    .setDescription("Propose marriage")
    .addUserOption(o => o.setName("user").setDescription("User").setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`marry_yes_${interaction.user.id}_${user.id}`)
        .setLabel("Yes")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`marry_no_${interaction.user.id}_${user.id}`)
        .setLabel("No")
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({
      content: `${user}, will you take ${interaction.user} hand in marriage?`,
      components: [row]
    });
  },

  async buttonHandler(interaction) {
    if (!interaction.customId.startsWith("marry_")) return;

    const [_, answer, requesterId, targetId] = interaction.customId.split("_");

    if (interaction.user.id !== targetId) {
      return interaction.reply({ content: "Only the requested user can respond.", ephemeral: true });
    }

    const data = load();

    const requester = requesterId;
    const target = targetId;

    if (answer === "yes") {
      data[requester] = target;
      data[target] = requester;
      save(data);

      return interaction.update({
        content: `<@${requester}> is now married to <@${target}>!`,
        components: []
      });
    } else {
      return interaction.update({
        content: `<@${target}> has declined the marriage.`,
        components: []
      });
    }
  }
};