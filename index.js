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

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const cooldowns = new Map();

// 💼 JOB SHOP
const shop = [
  { name: "dumpster diver", min: 5, max: 15, price: 0 },
  { name: "newspaper deliverer", min: 20, max: 60, price: 100 },
  { name: "fast food worker", min: 50, max: 120, price: 300 },
  { name: "retail cashier", min: 100, max: 250, price: 750 },
  { name: "construction worker", min: 200, max: 600, price: 2000 },
  { name: "truck driver", min: 500, max: 1200, price: 5000 },
  { name: "police officer", min: 1000, max: 2500, price: 15000 },
  { name: "doctor", min: 2000, max: 5000, price: 50000 },
  { name: "ceo", min: 5000, max: 15000, price: 250000 },
  { name: "billionaire investor", min: 20000, max: 50000, price: 1000000 }
];

// COMMANDS
const commands = [
  new SlashCommandBuilder().setName("balance").setDescription("Check money"),
  new SlashCommandBuilder().setName("work").setDescription("Work job"),

  new SlashCommandBuilder().setName("shop").setDescription("Job shop"),

  new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Buy a job")
    .addStringOption(o =>
      o.setName("job").setDescription("Job name").setRequired(true)
    ),

  new SlashCommandBuilder().setName("inventory").setDescription("Your job"),

  new SlashCommandBuilder().setName("leaderboard").setDescription("Rich list"),

  new SlashCommandBuilder()
    .setName("givecash")
    .setDescription("Admin give money")
    .addUserOption(o =>
      o.setName("user").setDescription("User").setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("amount").setDescription("Amount").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("maintenance")
    .setDescription("Toggle maintenance")
    .addStringOption(o =>
      o.setName("mode").setDescription("on/off").setRequired(true)
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

// INTERACTION HANDLER
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const id = interaction.user.id;

  // 🚧 GLOBAL MAINTENANCE BLOCK
  if (
    db.isMaintenance() &&
    interaction.commandName !== "maintenance"
  ) {
    return interaction.reply(
      "🚧 This bot is under maintenance, please try again later."
    );
  }

  // 💰 BALANCE
  if (interaction.commandName === "balance") {
    const user = db.getUser(id);
    return interaction.reply(`💰 ${user.balance}`);
  }

  // 🛠 WORK
  if (interaction.commandName === "work") {
    const last = cooldowns.get(id) || 0;
    if (Date.now() - last < 10000)
      return interaction.reply("⏳ cooldown");

    cooldowns.set(id, Date.now());

    const jobName = db.getJob(id)?.job || "dumpster diver";
    const job = shop.find(j => j.name === jobName);

    const earned =
      Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

    db.addBalance(id, earned);

    return interaction.reply(
      `🛠️ ${job.name} earned you ${earned}`
    );
  }

  // 🛒 SHOP
  if (interaction.commandName === "shop") {
    return interaction.reply(
      shop.map(j => `💼 ${j.name} - ${j.price}`).join("\n")
    );
  }

  // 💸 BUY JOB
  if (interaction.commandName === "buy") {
    const name = interaction.options.getString("job").toLowerCase();
    const job = shop.find(j => j.name === name);

    if (!job) return interaction.reply("❌ not found");

    const user = db.getUser(id);

    if (user.balance < job.price)
      return interaction.reply("❌ not enough money");

    db.addBalance(id, -job.price);
    db.setJob(id, job.name);

    return interaction.reply(`💼 now: ${job.name}`);
  }

  // 🎒 INVENTORY
  if (interaction.commandName === "inventory") {
    return interaction.reply(
      `🎒 job: ${db.getJob(id)?.job || "none"}`
    );
  }

  // 🏆 LEADERBOARD
  if (interaction.commandName === "leaderboard") {
    const top = db.getTopUsers(10);

    return interaction.reply(
      top
        .map((u, i) => `#${i + 1} <@${u.id}> - ${u.balance}`)
        .join("\n")
    );
  }

  // 💸 GIVECASH (ROLE LOCKED)
  if (interaction.commandName === "givecash") {
    const role = "Watch Your Steppest";

    if (
      !interaction.member.roles.cache.some(r => r.name === role)
    ) {
      return interaction.reply("❌ no permission");
    }

    const target = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    const sender = db.getUser(id);

    if (sender.balance < amount)
      return interaction.reply("❌ not enough money");

    db.addBalance(id, -amount);
    db.addBalance(target.id, amount);

    return interaction.reply(
      `💸 sent ${amount} to ${target.username}`
    );
  }

  // 🚧 MAINTENANCE TOGGLE
  if (interaction.commandName === "maintenance") {
    const role = "Watch Your Steppest";

    if (
      !interaction.member.roles.cache.some(r => r.name === role)
    ) {
      return interaction.reply("❌ no permission");
    }

    const mode = interaction.options.getString("mode");

    if (mode === "on") {
      db.setMaintenance(true);
      return interaction.reply("🔴 maintenance ON");
    }

    if (mode === "off") {
      db.setMaintenance(false);
      return interaction.reply("🟢 maintenance OFF");
    }

    return interaction.reply("use: on / off");
  }
});

client.login(TOKEN);