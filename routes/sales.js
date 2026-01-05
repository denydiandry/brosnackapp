const express = require('express');
const router = express.Router();

module.exports = (db) => {

    // 1. LAPORAN PROFIT (DENGAN FILTER)
    router.get('/profit-report', (req, res) => {
        const { start, end } = req.query;
        
        let query = `
            SELECT 
                ii.nama_item,
                ii.qty,
                ii.harga as harga_jual,
                i.harga_beli,
                (ii.harga - i.harga_beli) * ii.qty as profit,
                inv.tanggal
            FROM invoice_items ii
            JOIN item i ON ii.kode_item = i.kode
            JOIN invoice inv ON ii.invoice_id = inv.id
        `;

        let params = [];
        if (start && end) {
            query += ` WHERE inv.tanggal BETWEEN ? AND ? `;
            params = [start, end];
        }

        query += ` ORDER BY inv.tanggal DESC`;

        db.all(query, params, (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Gagal ambil data profit" });
            }
            res.json(rows);
        });
    });

    // 2. LAPORAN TERLARIS
    router.get('/best-seller', (req, res) => {
        const query = `
            SELECT nama_item, SUM(qty) as total_qty 
            FROM invoice_items 
            GROUP BY nama_item 
            ORDER BY total_qty DESC 
            LIMIT 5
        `;

        db.all(query, [], (err, rows) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json(rows); // Mengirim data ke Dashboard
        });
    });
    // ------------------------------------------

    // ... kode router lainnya (seperti simpan transaksi) ...

    return router;
};