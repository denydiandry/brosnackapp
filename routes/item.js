const express = require('express');
const router = express.Router();

module.exports = (db) => {

  // GET ALL ITEM
  router.get('/', (req, res) => {
    db.all(`SELECT * FROM item ORDER BY kode`, [], (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    });
  });

  // ADD ITEM
  router.post('/', (req, res) => {
    const { kode, nama, harga_beli, harga_jual, stok } = req.body;

    if (!kode || !nama) {
      return res.status(400).json({ message: 'Kode dan Nama wajib diisi' });
    }

    db.run(
      `INSERT INTO item (kode, nama, harga_beli, harga_jual, stok) VALUES (?, ?, ?, ?, ?)`,
      [
        kode.trim(), 
        nama, 
        Number(harga_beli) || 0, 
        Number(harga_jual) || 0, 
        Number(stok) || 0
      ],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ message: 'Kode item sudah ada' });
          }
          return res.status(500).json({ message: err.message });
        }
        res.json({ message: 'Item berhasil ditambahkan' });
      }
    );
  });

  // UPDATE ITEM
  router.put('/:kode', (req, res) => {
    const kode = decodeURIComponent(req.params.kode);
    const { nama, harga_beli, harga_jual, stok } = req.body;

    db.run(
      `UPDATE item SET nama = ?, harga_beli = ?, harga_jual = ?, stok = ? WHERE kode = ?`,
      [
        nama, 
        Number(harga_beli), 
        Number(harga_jual), 
        Number(stok), 
        kode.trim()
      ],
      function (err) {
        if (err) return res.status(500).json(err);
        if (this.changes === 0) return res.status(404).json({ message: 'Item tidak ditemukan' });
        res.json({ message: 'Item berhasil diupdate' });
      }
    );
  });

  // DELETE ITEM
  router.delete('/:kode', (req, res) => {
    const kode = decodeURIComponent(req.params.kode);
    db.run(`DELETE FROM item WHERE kode = ?`, [kode], function (err) {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Item berhasil dihapus' });
    });
  });

  return router;
};