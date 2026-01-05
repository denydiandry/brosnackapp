const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// Buat tabel users jika belum ada
db.run(`
  CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
  )
`);

// Tambah 1 user admin
db.run(
  `INSERT INTO users (username, password) VALUES ('admin', '123')`,
  (err) => {
    if (err) console.log("Error:", err.message);
    else console.log("User admin berhasil dibuat!");
  }
);
