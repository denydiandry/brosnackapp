const express = require("express");
const router = express.Router();
const db = require("../db");

// GET semua grup
router.get("/", (req, res) => {
    db.all("SELECT * FROM grup", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST tambah grup
router.post("/", (req, res) => {
    const { kode, nama } = req.body;

    db.run(
        `INSERT INTO grup (kode, nama) VALUES (?, ?)`,
        [kode, nama],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// PUT edit grup
router.put("/:kode", (req, res) => {
    const kodeLama = req.params.kode;
    const { kode, nama } = req.body;

    db.run(
        `UPDATE grup SET kode=?, nama=? WHERE kode=?`,
        [kode, nama, kodeLama],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// DELETE grup
router.delete("/:kode", (req, res) => {
    db.run(
        `DELETE FROM grup WHERE kode=?`,
        [req.params.kode],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

module.exports = router;
