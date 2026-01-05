const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // 1. GET ALL (Riwayat)
    router.get('/', (req, res) => {
        db.all(`SELECT * FROM purchases ORDER BY id DESC`, [], (err, rows) => {
            if (err) return res.status(500).json(err);
            res.json(rows);
        });
    });

    // 2. SIMPAN PEMBELIAN (POST)
    router.post('/', (req, res) => {
        const { tanggal, kode_item, nama_item, qty, harga_beli } = req.body;
        const total = Number(qty) * Number(harga_beli);

        db.serialize(() => {
            db.run(`INSERT INTO purchases (tanggal, kode_item, nama_item, qty, harga_beli, total) VALUES (?,?,?,?,?,?)`,
                [tanggal, kode_item, nama_item, qty, harga_beli, total]);
            db.run(`UPDATE item SET stok = stok + ? WHERE kode = ?`, [qty, kode_item], (err) => {
                if (err) return res.status(500).json(err);
                res.json({ message: 'Berhasil' });
            });
        });
    });

    // 3. HAPUS PEMBELIAN (DELETE)
    router.delete('/:id', (req, res) => {
        const { id } = req.params;
        // Ambil data lama dulu untuk tahu berapa stok yang harus dikurangi balik
        db.get(`SELECT kode_item, qty FROM purchases WHERE id = ?`, [id], (err, row) => {
            if (row) {
                db.serialize(() => {
                    db.run(`UPDATE item SET stok = stok - ? WHERE kode = ?`, [row.qty, row.kode_item]);
                    db.run(`DELETE FROM purchases WHERE id = ?`, [id], (err) => {
                        if (err) return res.status(500).json(err);
                        res.json({ message: 'Pembelian dihapus & stok disesuaikan' });
                    });
                });
            }
        });
    });

    return router;
};