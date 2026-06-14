const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const express = require("express");

// ================= CONFIG =================
const TOKEN = process.env.MTUxNTgzODc0OTkwNzYxNTc5NQ.Gw5SIG.LIAS-odbILye7wjTFlDcOJlAlBX1OI_SfjkCqw;
const CLIENT_ID = process.env.1515838749907615795;
const REQUIRED_ROLE = "Watch Your Steppest";

const DB_FILE = "./db.json";

// ================= EXPRESS (keep alive) =================
const app = express();
app.get("/", (req, res) => res.send("WorkShift bot is running"));
app.listen(3000, () => console.log("Web server online"));

// ================= DATABASE =================
let db = {};

if (fs.existsSync(DB_FILE)) {
    db = JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB() {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function getUser(id) {
    if (!db[id]) {
        db[id] = {
            cash: 0,
            job: "Dumpster Diver",
            jobs: ["Dumpster Diver"],
            lastWork: 0
        };
    }
    return db[id];
}

// ================= CLIENT =================
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ================= COMMANDS =================
const commands = [
    new SlashCommandBuilder().setName("work").setDescription("Work your job and earn money"),
    new SlashCommandBuilder().setName("balance").setDescription("Check your cash"),
    new SlashCommandBuilder().setName("shop").setDescription("View available jobs"),
    new SlashCommandBuilder()
        .setName("setjob")
        .setDescription("Change your job")
        .addStringOption(opt =>
            opt.setName("job")
                .setDescription("Job name")
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName("givecash")
        .setDescription("Admin give cash")
        .addUserOption(opt =>
            opt.setName("user").setRequired(true)
        )
        .addIntegerOption(opt =>
            opt.setName("amount").setRequired(true)
        )
];

// ================= REGISTER COMMANDS =================
const rest = new REST({ version: "10" }).setToken(TOKEN);

client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}`);

    await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands }
    );

    console.log("Slash commands registered");
});

// ================= INTERACTIONS =================
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const user = getUser(interaction.user.id);
    const now = Date.now();

    // ---------------- WORK ----------------
    if (interaction.commandName === "work") {
        if (now - user.lastWork < 15000) {
            return interaction.reply("⏳ Wait 15 seconds before working again!");
        }

        user.lastWork = now;

        let payout = 0;

        if (user.job === "Dumpster Diver") {
            payout = Math.floor(Math.random() * 15) + 1;
        } else {
            payout = Math.floor(Math.random() * 50) + 10;
        }

        user.cash += payout;
        saveDB();

        return interaction.reply(`💰 You worked as **${user.job}** and earned **$${payout}**`);
    }

    // ---------------- BALANCE ----------------
    if (interaction.commandName === "balance") {
        return interaction.reply(`💵 You have **$${user.cash}**`);
    }

    // ---------------- SHOP ----------------
    if (interaction.commandName === "shop") {
        return interaction.reply(
            "🛒 **Job Shop**\n" +
            "Dumpster Diver - FREE\n" +
            "Cashier - $100\n" +
            "Mechanic - $300\n" +
            "Hacker - $1000\n\n" +
            "Use /setjob to switch jobs"
        );
    }

    // ---------------- SET JOB ----------------
    if (interaction.commandName === "setjob") {
        const job = interaction.options.getString("job");

        const jobs = {
            "Dumpster Diver": 0,
            "Cashier": 100,
            "Mechanic": 300,
            "Hacker": 1000
        };

        if (!(job in jobs)) {
            return interaction.reply("❌ That job doesn't exist!");
        }

        user.job = job;
        user.jobs.push(job);
        saveDB();

        return interaction.reply(`✅ Your job is now **${job}**`);
    }

    // ---------------- GIVE CASH ----------------
    if (interaction.commandName === "givecash") {
        if (!interaction.member.roles.cache.some(r => r.name === REQUIRED_ROLE)) {
            return interaction.reply("❌ You don't have permission.");
        }

        const target = interaction.options.getUser("user");
        const amount = interaction.options.getInteger("amount");

        const tUser = getUser(target.id);
        tUser.cash += amount;

        saveDB();

        return interaction.reply(`💸 Gave $${amount} to ${target.username}`);
    }
});

// ================= LOGIN =================
client.login(TOKEN);