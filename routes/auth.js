const express = require('express');

module.exports = function (db) {
  const router = express.Router();

  // LOGIN
  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get(
      `SELECT * FROM users WHERE username = ? AND password = ?`,
      [username, password],
      (err, row) => {
        if (err) {
          console.log("DB ERROR:", err);
          return res.status(500).json({ message: 'Server error' });
        }
        if (!row) {
          return res.status(401).json({ message: "Username atau password salah" });
        }
        res.json({
          message: "Login berhasil",
          role: row.role,
          user: {
            id: row.id,
            username: row.username,
            role: row.role
          }
        });
      }
    );
  });

  // DAFTAR KASIR BARU
  router.post('/register', (req, res) => {
    const { username, password } = req.body;
    const role = 'kasir'; // SET OTOMATIS JADI KASIR

    db.run(
      `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
      [username, password, role],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.status(400).json({ message: "Username sudah terpakai!" });
          }
          return res.status(500).json({ message: "Gagal daftar" });
        }
        res.json({ message: "Berhasil daftar kasir!" });
      }
    );
  });

  // --- TAMBAHAN BARU: AMBIL DAFTAR SEMUA USER ---
  router.get('/users', (req, res) => {
    // Kita ambil id, username, dan role saja. Password jangan dikirim ke frontend!
    db.all(`SELECT id, username, role FROM users`, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Gagal mengambil data user" });
      }
      res.json(rows);
    });
  });

  // --- TAMBAHAN BARU: HAPUS USER ---
 router.delete('/users/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
        if (err) {
            return res.status(500).json({ message: "Gagal menghapus dari database" });
        }
        res.json({ message: "User dihapus" });
    });
});

  return router;
};