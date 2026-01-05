const express = require('express');
const router = express.Router();

module.exports = (db) => {

    // 1. SIMPAN TRANSAKSI (POST)
    router.post('/', (req, res) => {
        const { tanggal, items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Keranjang belanja kosong!' });
        }

        const nomor = 'INV-' + Date.now();
        const total = items.reduce((s, i) => s + (Number(i.qty) * Number(i.harga)), 0);

        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            db.run(
                `INSERT INTO invoice (nomor, tanggal, total) VALUES (?, ?, ?)`,
                [nomor, tanggal, total],
                function (err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: err.message });
                    }

                    const invoiceId = this.lastID;

                    for (const i of items) {
                        const qty = Number(i.qty);
                        const harga = Number(i.harga);
                        const subtotal = qty * harga;

                        // Simpan ke detail item invoice
                        db.run(
                            `INSERT INTO invoice_items (invoice_id, kode_item, nama_item, qty, harga, subtotal)
                             VALUES (?, ?, ?, ?, ?, ?)`,
                            [invoiceId, i.kode_item, i.nama_item, qty, harga, subtotal]
                        );

                        // Potong stok di tabel item
                        db.run(
                            `UPDATE item SET stok = stok - ? WHERE kode = ?`,
                            [qty, i.kode_item]
                        );
                    }

                    db.run('COMMIT');
                    res.json({ nomor, message: "Transaksi Berhasil!" });
                }
            );
        });
    });

    // 2. AMBIL SEMUA RIWAYAT (GET)
    router.get('/', (req, res) => {
        db.all(
            `SELECT * FROM invoice ORDER BY id DESC`,
            [],
            (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(rows);
            }
        );
    });

    // 3. AMBIL DETAIL INVOICE (GET berdasarkan Nomor)
    router.get('/:nomor', (req, res) => {
        const nomor = req.params.nomor;
        
        db.get(`SELECT * FROM invoice WHERE nomor = ?`, [nomor], (err, invoice) => {
            if (err || !invoice) {
                return res.status(404).json({ message: 'Invoice tidak ditemukan' });
            }

            db.all(`SELECT * FROM invoice_items WHERE invoice_id = ?`, [invoice.id], (err, items) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ ...invoice, items });
            });
        });
    });

    // 4. HAPUS INVOICE & BALIKIN STOK (DELETE berdasarkan Nomor)
    router.delete('/:nomor', (req, res) => {
        const nomor = req.params.nomor;

        db.serialize(() => {
            // Cari ID-nya dulu berdasarkan nomor
            db.get(`SELECT id FROM invoice WHERE nomor = ?`, [nomor], (err, row) => {
                if (err || !row) return res.status(404).json({ message: 'Data tidak ditemukan' });

                const invoiceId = row.id;
                db.run('BEGIN TRANSACTION');

                // Langkah 1: Ambil semua item di invoice ini untuk dikembalikan stoknya
                db.all(`SELECT kode_item, qty FROM invoice_items WHERE invoice_id = ?`, [invoiceId], (err, items) => {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: err.message });
                    }

                    // Langkah 2: Update stok (tambah kembali) ke tabel item
                    for (const item of items) {
                        db.run(`UPDATE item SET stok = stok + ? WHERE kode = ?`, [item.qty, item.kode_item]);
                    }

                    // Langkah 3: Hapus detail dan header invoice
                    // (Karena ada FOREIGN KEY ON DELETE CASCADE, hapus induk saja sudah cukup)
                    db.run(`DELETE FROM invoice WHERE id = ?`, [invoiceId], function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: err.message });
                        }
                        db.run('COMMIT');
                        res.json({ message: 'Invoice berhasil dihapus dan stok telah dikembalikan' });
                    });
                });
            });
        });
    });

    return router;
};