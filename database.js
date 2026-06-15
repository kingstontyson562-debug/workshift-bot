const Database = require("better-sqlite3");
const db = new Database("data.db");

// USERS TABLE
db.prepare(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  balance INTEGER DEFAULT 0
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

module.exports = {
  getUser,
  addBalance,
  getTopUsers
};