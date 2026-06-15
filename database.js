const Database = require("better-sqlite3");
const db = new Database("data.db");

// USERS
db.prepare(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  balance INTEGER DEFAULT 0
)
`).run();

// JOBS
db.prepare(`
CREATE TABLE IF NOT EXISTS user_jobs (
  id TEXT PRIMARY KEY,
  job TEXT
)
`).run();

// SETTINGS (maintenance)
db.prepare(`
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  maintenance INTEGER DEFAULT 0
)
`).run();

function getUser(id) {
  let user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);

  if (!user) {
    db.prepare("INSERT INTO users (id, balance) VALUES (?, 0)").run(id);
    user = { id, balance: 0 };
  }

  return user;
}

function addBalance(id, amount) {
  getUser(id);
  db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?")
    .run(amount, id);
}

function getTopUsers(limit = 10) {
  return db.prepare(`
    SELECT id, balance
    FROM users
    ORDER BY balance DESC
    LIMIT ?
  `).all(limit);
}

// JOBS
function setJob(id, job) {
  db.prepare(`
    INSERT INTO user_jobs (id, job)
    VALUES (?, ?)
    ON CONFLICT(id) DO UPDATE SET job = excluded.job
  `).run(id, job);
}

function getJob(id) {
  return db.prepare("SELECT job FROM user_jobs WHERE id = ?").get(id);
}

// MAINTENANCE
function setMaintenance(state) {
  db.prepare(`
    INSERT INTO settings (id, maintenance)
    VALUES ('global', ?)
    ON CONFLICT(id) DO UPDATE SET maintenance = excluded.maintenance
  `).run(state ? 1 : 0);
}

function isMaintenance() {
  return db.prepare(`
    SELECT maintenance FROM settings WHERE id = 'global'
  `).get()?.maintenance === 1;
}

module.exports = {
  getUser,
  addBalance,
  getTopUsers,
  setJob,
  getJob,
  setMaintenance,
  isMaintenance
};