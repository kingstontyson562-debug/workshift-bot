const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const db = require("./database");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
  console.log("Missing TOKEN or CLIENT_ID");
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ⏱ cooldowns
const cooldowns = new Map();

// 🎲 weighted jobs
const jobs = [
  { name: "Dumpster Diver", min: 5, max: 15, weight: 50 },
  { name: "Newspaper Deliverer", min: 20, max: 60, weight: 25 },
  { name: "Fast Food Worker", min: 50, max: 120, weight: 15 },
  { name: "Retail Cashier", min: 100, max: 250, weight: 7 },
  { name: "Construction Worker", min: 200, max: 600, weight: 3 },
  { name: "Truck Driver", min: 500, max: 1200, weight: 1.5 },
  { name: "Police Officer", min: 1000, max: 2500, weight: 0.7 },
  { name: "Doctor", min: 2000, max: 5000, weight: 0.5 },
  { name: "CEO", min: 5000, max: 15000, weight: 0.2 },
  { name: "Billionaire Investor", min: 20000, max: 50000, weight: 0.05 }
];

// COMMANDS
const commands = [
  new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your money"),

  new SlashCommandBuilder()
    .setName("work")
    .setDescription("Work a random job"),

  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Top richest players"),

  new SlashCommandBuilder()
    .setName("givecash")
    .setDescription("Give money (role locked)")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("User")
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("amount")
        .setDescription("Amount")
        .setRequired(true)
    )
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

// REGISTER COMMANDS
client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  await rest.put(Routes.applicationCommands(CLIENT_ID), {
    body: commands
  });

  console.log("Commands registered");
});

// INTERACTIONS
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const id = interaction.user.id;

  // 💰 BALANCE
  if (interaction.commandName === "balance") {
    const user = db.getUser(id);
    return interaction.reply(`💰 Balance: ${user.balance}`);
  }

  // 🛠 WORK (weighted RNG)
  if (interaction.commandName === "work") {
    const last = cooldowns.get(id) || 0;

    if (Date.now() - last < 10000) {
      return interaction.reply("⏳ Wait before working again!");
    }

    cooldowns.set(id, Date.now());

    const totalWeight = jobs.reduce((a, b) => a + b.weight, 0);

    let rand = Math.random() * totalWeight;
    let job = jobs[0];

    for (const j of jobs) {
      if (rand < j.weight) {
        job = j;
        break;
      }
      rand -= j.weight;
    }

    const earned =
      Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

    db.addBalance(id, earned);

    return interaction.reply(
      `🛠️ You worked as **${job.name}** and earned **${earned} coins**`
    );
  }

  // 🏆 LEADERBOARD
  if (interaction.commandName === "leaderboard") {
    const top = db.getTopUsers(10);

    const text = top
      .map((u, i) => `#${i + 1} <@${u.id}> — 💰 ${u.balance}`)
      .join("\n");

    return interaction.reply(`🏆 **LEADERBOARD**\n\n${text}`);
  }

  // 💸 GIVECASH (ROLE LOCKED)
  if (interaction.commandName === "givecash") {
    const roleName = "Watch Your Steppest";

    const hasRole = interaction.member.roles.cache.some(
      r => r.name === roleName
    );

    if (!hasRole) {
      return interaction.reply("❌ You don't have permission.");
    }

    const target = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    if (amount <= 0) {
      return interaction.reply("❌ Invalid amount");
    }

    const sender = db.getUser(id);

    if (sender.balance < amount) {
      return interaction.reply("❌ Not enough money");
    }

    db.addBalance(id, -amount);
    db.addBalance(target.id, amount);

    return interaction.reply(
      `💸 You gave ${amount} coins to ${target.username}`
    );
  }
});

client.login(TOKEN);