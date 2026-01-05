const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'secret-key-pos-app',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const db = new sqlite3.Database('./database.db', err => {
    if (!err) {
        db.run('PRAGMA foreign_keys = ON');
        db.serialize(() => {
            // Tabel Item
            db.run(`CREATE TABLE IF NOT EXISTS item (
                kode TEXT PRIMARY KEY,
                nama TEXT,
                harga_beli INTEGER,
                harga_jual INTEGER,
                stok INTEGER
            )`);

            // UPDATE: Tabel Users sekarang punya kolom ROLE
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT,
                role TEXT
            )`, () => {
                db.get("SELECT count(*) as count FROM users", (err, row) => {
                    if (row && row.count === 0) {
                        // Tambahkan Admin
                        db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ["admin", "admin123", "admin"]);
                        // Tambahkan Kasir
                        db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ["kasir", "kasir123", "kasir"]);
                        console.log("User default (admin & kasir) berhasil dibuat.");
                    }
                });
            });

            db.run(`CREATE TABLE IF NOT EXISTS invoice (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nomor TEXT UNIQUE,
                tanggal TEXT,
                total INTEGER
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS invoice_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_id INTEGER,
                kode_item TEXT,
                nama_item TEXT,
                qty INTEGER,
                harga INTEGER,
                subtotal INTEGER,
                FOREIGN KEY(invoice_id) REFERENCES invoice(id) ON DELETE CASCADE
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS purchases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tanggal TEXT,
                kode_item TEXT,
                nama_item TEXT,
                qty INTEGER,
                harga_beli INTEGER,
                total INTEGER,
                FOREIGN KEY(kode_item) REFERENCES item(kode)
            )`);
        });
    }
});

// Load Routes
const itemRoutes = require('./routes/item')(db);
const salesRoutes = require('./routes/sales')(db);
const authRoutes = require('./routes/auth')(db);
const invoiceRoutes = require('./routes/invoice')(db);
const purchaseRoutes = require('./routes/purchase')(db);

app.use('/api/item', itemRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/purchase', purchaseRoutes);

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));