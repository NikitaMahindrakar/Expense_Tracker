const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("expenses.db");

db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      amount_paise INTEGER NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      idempotency_key TEXT UNIQUE
    )
  `);
});

module.exports = db;