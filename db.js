const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Lokasi file database
const dbPath = path.join(__dirname, '..', 'database.db');

// Koneksi database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("Gagal konek database:", err);
    else console.log("Database connected:", dbPath);
});

// ======== BUAT TABEL ========
db.serialize(() => {

    // USERS
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    `);

    // Insert user default
    db.get(`SELECT COUNT(*) AS count FROM users`, (err, row) => {
        if (row.count === 0) {
            db.run(`INSERT INTO users (username, password) VALUES ('admin', 'admin')`);
            console.log("Default user dibuat: admin / admin");
        }
    });

    // ITEMS (Master barang)
    db.run(`
        CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kode TEXT UNIQUE,
    nama TEXT,
    harga REAL,
    stok REAL DEFAULT 0

    )
    `);

    // PURCHASES
    db.run(`
        CREATE TABLE IF NOT EXISTS purchases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tanggal TEXT,
            item_id INTEGER,
            qty REAL,
            harga REAL,
            total REAL,
            FOREIGN KEY(item_id) REFERENCES items(id)
        )
    `);

    // SALES
    db.run(`
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tanggal TEXT,
            item_id INTEGER,
            qty REAL,
            harga REAL,
            total REAL,
            FOREIGN KEY(item_id) REFERENCES items(id)
        )
    `);
});

module.exports = db;
