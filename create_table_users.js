const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// BUAT TABEL USERS
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )
`, (err) => {
    if (err) {
        console.error("ERROR CREATE TABLE:", err.message);
    } else {
        console.log("Tabel users berhasil dibuat!");
    }
});

// INSERT USER ADMIN
db.run(`
    INSERT INTO users (username, password)
    VALUES ('admin', '123')
`, (err) => {
    if (err) {
        console.error("Gagal buat user:", err.message);
    } else {
        console.log("User admin berhasil dibuat!");
    }
});

db.close();
