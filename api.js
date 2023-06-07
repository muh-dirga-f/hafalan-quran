const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();
const path = require('path');

// Buat koneksi ke database SQLite3
const dbPath = path.resolve(__dirname, 'mydb.sqlite3');
const db = new sqlite3.Database(dbPath);

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Cek username dan password siswa di database
  try {
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Failed to login' });
      } else if (row) {
        res.json({ message: 'Login berhasil', user: row });
      } else {
        res.status(401).json({ error: 'Username atau Password salah' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

router.get('/surah', (req, res) => {
  try {
    db.all('SELECT * FROM surah', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Failed to fetch surah data' });
      } else {
        res.json(rows);
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch surah data' });
  }
});

router.post('/surah/:action', (req, res) => {
  const action = req.params.action;
  const surahId = req.body.surahId;

  if (action === 'save') {
    // Simpan surah
    // ...
  } else if (action === 'delete') {
    // Hapus surah
    // ...
  } else {
    res.status(400).json({ error: 'Invalid action' });
  }
});

router.get('/hafalan_guru/:user_id', (req, res) => {
  const user_id = req.params.user_id
  try {
    db.all('SELECT * FROM hafalan where id_pengajar = "' + user_id + '" GROUP BY id_siswa;', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Failed to fetch hafalan data' });
      } else {
        res.json(rows);
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hafalan data' });
  }
});

router.get('/hafalan_siswa_guru', (req, res) => {
  const siswa_id = req.query.siswa;
  const guru_id = req.query.guru;
  try {
    db.all('SELECT * FROM hafalan where id_pengajar = "' + guru_id + '" AND id_siswa = "' + siswa_id + '";', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Failed to fetch hafalan data' });
      } else {
        res.json(rows);
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hafalan data' });
  }
});

router.get('/hafalan/', (req, res) => {
  try {
    db.all('SELECT * FROM hafalan', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Failed to fetch hafalan data' });
      } else {
        res.json(rows);
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hafalan data' });
  }
});

router.get('/hafalan/:user_id', (req, res) => {
  const user_id = req.params.user_id
  try {
    db.all('SELECT * FROM hafalan where id_siswa = "' + user_id + '";', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Failed to fetch hafalan data' });
      } else {
        res.json(rows);
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hafalan data' });
  }
});

router.post('/hafalan/:action', (req, res) => {
  const action = req.params.action; // Aksi yang akan dilakukan (tambah/edit/hapus)

  if (action === 'tambah') {
    const { id_siswa, id_pengajar, id_surah } = req.body;

    const query = 'INSERT INTO hafalan (id_siswa, id_pengajar, id_surah) VALUES (?, ?, ?)';
    db.run(query, [id_siswa, id_pengajar, id_surah], (err) => {
      if (err) {
        console.error('Error adding hafalan:', err);
        // Kirim respons gagal
        res.status(500).json({ success: false, message: 'Gagal menambahkan hafalan' });
      } else {
        // Kirim respons sukses
        res.json({ success: true, message: 'Hafalan berhasil ditambahkan' });
      }
    });
  } else if (action === 'edit') {
    const { id, id_siswa, id_pengajar, id_surah } = req.body;

    const query = 'UPDATE hafalan SET id_siswa = ?, id_pengajar = ?, id_surah = ? WHERE id = ?';
    db.run(query, [id_siswa, id_pengajar, id_surah, id], (err) => {
      if (err) {
        console.error('Error updating hafalan:', err);
        // Kirim respons gagal
        res.status(500).json({ success: false, message: 'Gagal memperbarui hafalan' });
      } else {
        // Kirim respons sukses
        res.json({ success: true, message: 'Hafalan berhasil diperbarui' });
      }
    });
  } else if (action === 'hapus') {
    const hafalanId = req.body.id;

    const query = 'DELETE FROM hafalan WHERE id = ?';
    db.run(query, [hafalanId], (err) => {
      if (err) {
        console.error('Error deleting hafalan:', err);
        // Kirim respons gagal
        res.status(500).json({ success: false, message: 'Gagal menghapus hafalan' });
      } else {
        // Kirim respons sukses
        res.json({ success: true, message: 'Hafalan berhasil dihapus' });
      }
    });
  } else {
    // Jika aksi tidak valid
    res.status(400).json({ success: false, message: 'Aksi tidak valid' });
  }
});

router.get('/setor_hafalan', (req, res) => {
  try {
    db.all('SELECT * FROM setor_hafalan', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Failed to fetch setor_hafalan data' });
      } else {
        res.json(rows);
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch setor_hafalan data' });
  }
});

router.get('/setor_hafalan/:id', (req, res) => {
  try {
    const id = req.params.id;
    db.all('SELECT * FROM setor_hafalan where id_hafalan = "' + id + '"', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Failed to fetch setor_hafalan data' });
      } else {
        res.json(rows);
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch setor_hafalan data' });
  }
});

router.post('/setor_hafalan/:action', (req, res) => {
  const action = req.params.action; // Aksi yang akan dilakukan (tambah/edit/hapus)

  if (action === 'tambah') {
    const { id_hafalan, tanggal, ayatMulai, ayatSelesai, hasilSetoran, catatan, paraf } = req.body;

    console.log(id_hafalan, tanggal, ayatMulai, ayatSelesai, hasilSetoran, catatan, paraf);
    const query = 'INSERT INTO setor_hafalan (id_hafalan, tanggal, ayatMulai, ayatSelesai, hasilSetoran, catatan, paraf) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.run(query, [id_hafalan, tanggal, ayatMulai, ayatSelesai, hasilSetoran, catatan, paraf], (err) => {
      if (err) {
        console.error('Error adding setor_hafalan:', err);
        // Kirim respons gagal
        res.status(500).json({ success: false, message: 'Gagal menambahkan Setor Hafalan' });
      } else {
        // Kirim respons sukses
        res.json({ success: true, message: 'Setor Hafalan berhasil ditambahkan' });
      }
    });
  } else if (action === 'edit') {
    console.log(req.body);
    const { id, id_hafalan, tanggal, ayatMulai, ayatSelesai, hasilSetoran, catatan, paraf } = req.body;

    const query = 'UPDATE setor_hafalan SET id_hafalan = ?, tanggal = ?, ayatMulai = ?, ayatSelesai = ?, hasilSetoran = ?, catatan = ?, paraf = ? WHERE id = ?';
    db.run(query, [id_hafalan, tanggal, ayatMulai, ayatSelesai, hasilSetoran, catatan, paraf, id], (err) => {
      if (err) {
        console.error('Error updating setor_hafalan:', err);
        // Kirim respons gagal
        res.status(500).json({ success: false, message: 'Gagal memperbarui Setor Hafalan' });
      } else {
        // Kirim respons sukses
        res.json({ success: true, message: 'Setor Hafalan berhasil diperbarui' });
      }
    });
  } else if (action === 'hapus') {
    const setor_hafalanId = req.body.id;

    const query = 'DELETE FROM setor_hafalan WHERE id = ?';
    db.run(query, [setor_hafalanId], (err) => {
      if (err) {
        console.error('Error deleting setor_hafalan:', err);
        // Kirim respons gagal
        res.status(500).json({ success: false, message: 'Gagal menghapus Setor Hafalan' });
      } else {
        // Kirim respons sukses
        res.json({ success: true, message: 'Setor Hafalan berhasil dihapus' });
      }
    });
  } else {
    // Jika aksi tidak valid
    res.status(400).json({ success: false, message: 'Aksi tidak valid' });
  }
});

router.get('/users', (req, res) => {
  try {
    db.all('SELECT id, username, level, email FROM users', (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Failed to fetch users data' });
      } else {
        res.json(rows);
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users data' });
  }
});

router.get('/biodata/:id', (req, res) => {
  const id = req.params.id; // Aksi yang akan dilakukan (tambah/edit/hapus)
  try {
    db.get('SELECT * FROM biodata WHERE user_id = ?', [id], (err, row) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Failed to fetch biodata data' });
      } else {
        if (row) {
          // Jika ada data biodata, kirimkan data sebagai respons
          res.json(row);
        } else {
          // Jika tidak ada data biodata, kirimkan respons kosong
          res.json({});
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch biodata data' });
  }
});

router.post('/biodata/:id', (req, res) => {
  const post_id = req.params.id; // ID dari permintaan

  const { user_id, nama_lengkap, ttl, umur, nama_wali, alamat, no_telp, email_wali, cita_cita } = req.body;

  // Periksa apakah ada biodata dengan user_id = post_id
  const checkQuery = 'SELECT * FROM biodata WHERE user_id = ?';
  db.get(checkQuery, [post_id], (err, row) => {
    if (err) {
      console.error('Error checking biodata:', err);
      // Kirim respons gagal
      res.status(500).json({ success: false, message: 'Gagal memeriksa biodata' });
    } else {
      if (row) {
        // Jika biodata ditemukan, lakukan update data
        const updateQuery = 'UPDATE biodata SET nama_lengkap = ?, ttl = ?, umur = ?, nama_wali = ?, alamat = ?, no_telp = ?, email_wali = ?, cita_cita = ? WHERE user_id = ?';
        db.run(updateQuery, [nama_lengkap, ttl, umur, nama_wali, alamat, no_telp, email_wali, cita_cita, post_id], (err) => {
          if (err) {
            console.error('Error updating biodata:', err);
            // Kirim respons gagal
            res.status(500).json({ success: false, message: 'Gagal memperbarui biodata' });
          } else {
            // Kirim respons sukses
            res.json({ success: true, message: 'Biodata berhasil diperbarui' });
          }
        });
      } else {
        // Jika biodata tidak ditemukan, lakukan insert query
        const insertQuery = 'INSERT INTO biodata (user_id, nama_lengkap, ttl, umur, nama_wali, alamat, no_telp, email_wali, cita_cita) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.run(insertQuery, [post_id, nama_lengkap, ttl, umur, nama_wali, alamat, no_telp, email_wali, cita_cita], (err) => {
          if (err) {
            console.error('Error adding biodata:', err);
            // Kirim respons gagal
            res.status(500).json({ success: false, message: 'Gagal menambahkan biodata' });
          } else {
            // Kirim respons sukses
            res.json({ success: true, message: 'Biodata berhasil ditambahkan' });
          }
        });
      }
    }
  });
});

module.exports = router;
