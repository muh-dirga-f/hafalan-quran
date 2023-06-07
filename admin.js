const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();
const path = require('path');

// Buat koneksi ke database SQLite3
const dbPath = path.resolve(__dirname, 'mydb.sqlite3');
const db = new sqlite3.Database(dbPath);

router.get('/', (req, res) => {
  if (req.session.level === 'admin') {
    res.render('admin/dashboard');
  } else {
    res.redirect('/');
  }
});

router.get('/users', (req, res) => {
  if (req.session.level === 'admin') {
    const query = 'SELECT * FROM users';
    db.all(query, (err, rows) => {
      if (err) {
        console.error('Error fetching users:', err);
        res.render('admin/users', { users: [] });
      } else {
        res.render('admin/users', { users: rows });
      }
    });
  } else {
    res.redirect('/');
  }
});

router.post('/users/:action', (req, res) => {
  const action = req.params.action;

  if (action === 'tambah') {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const level = req.body.level;

    const query = 'INSERT INTO users (username, email, password, level) VALUES (?, ?, ?, ?)';
    db.run(query, [username, email, password, level], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: "User berhasil ditambahkan" });
      }
    });
  } else if (action === 'edit') {
    const id = req.body.id;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const level = req.body.level;

    const query = 'UPDATE users SET username = ?, email = ?, password = ?, level = ? WHERE id = ?';
    db.run(query, [username, email, password, level, id], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: "Data user berhasil diperbarui" });
      }
    });
  } else if (action === 'hapus') {
    const id = req.body.id;

    const query = 'DELETE FROM users WHERE id = ?';
    db.run(query, [id], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: "User berhasil dihapus" });
      }
    });
  } else {
    res.send('Aksi tidak valid');
  }
});

router.get('/surah', (req, res) => {
  if (req.session.level === 'admin') {
    const query = 'SELECT * FROM surah';
    db.all(query, (err, rows) => {
      if (err) {
        console.error('Error fetching surahs:', err);
        res.render('admin/surah', { surahs: [] });
      } else {
        res.render('admin/surah', { surahs: rows });
      }
    });
  } else {
    res.redirect('/');
  }
});

router.post('/surah/:action', (req, res) => {
  const action = req.params.action;

  if (action === 'tambah') {
    const name = req.body.name;
    const verseCount = req.body.verseCount;

    const query = 'INSERT INTO surah (name, verseCount) VALUES (?, ?)';
    db.run(query, [name, verseCount], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: "Surah berhasil ditambahkan" });
      }
    });
  } else if (action === 'edit') {
    const id = req.body.id;
    const name = req.body.name;
    const verseCount = req.body.verseCount;

    const query = 'UPDATE surah SET name = ?, verseCount = ? WHERE id = ?';
    db.run(query, [name, verseCount, id], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: "Data surah berhasil diperbarui" });
      }
    });
  } else if (action === 'hapus') {
    const id = req.body.id;

    const query = 'DELETE FROM surah WHERE id = ?';
    db.run(query, [id], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: "Surah berhasil dihapus" });
      }
    });
  } else {
    res.send('Aksi tidak valid');
  }
});

router.get('/hafalan', (req, res) => {
  // Cek apakah ada sesi yang aktif dan level pengguna adalah admin
  if (req.session.level === 'admin') {
    try {
      // Ambil data hafalan dari database SQLite
      db.all('SELECT * FROM hafalan', (err, hafalans) => {
        if (err) {
          console.error('Error fetching hafalans:', err);
          res.render('admin/hafalan', { hafalans: [], surahs: [], users: [] });
        } else {
          // Ambil data surah dari database SQLite
          db.all('SELECT * FROM surah', (err, surahs) => {
            if (err) {
              console.error('Error fetching surahs:', err);
              res.render('admin/hafalan', { hafalans: [], surahs: [], users: [] });
            } else {
              // Ambil data siswa dari database SQLite
              db.all('SELECT * FROM users', (err, users) => {
                if (err) {
                  console.error('Error fetching users:', err);
                  res.render('admin/hafalan', { hafalans: [], surahs: [], users: [] });
                } else {
                  res.render('admin/hafalan', { hafalans, surahs, users });
                }
              });
            }
          });
        }
      });
    } catch (error) {
      console.error('Error fetching hafalans:', error);
      res.render('admin/hafalan', { hafalans: [], surahs: [], siswas: [] });
    }
  } else {
    // Jika tidak, arahkan pengguna ke halaman login
    res.redirect('/');
  }
});

router.post('/hafalan/:action', (req, res) => {
  const action = req.params.action; // Aksi yang akan dilakukan (tambah/edit/hapus)

  // Cek apakah ada sesi yang aktif dan level pengguna adalah admin
  if (req.session.level === 'admin') {

    if (action === 'tambah') {
      const id_siswa = req.body.id_siswa;
      const id_pengajar = req.body.id_pengajar;
      const id_surah = req.body.id_surah;

      const query = 'INSERT INTO hafalan (id_siswa, id_pengajar, id_surah) VALUES (?, ?, ?)';
      db.run(query, [id_siswa, id_pengajar, id_surah], (err) => {
        if (err) {
          console.error('Error adding hafalan:', err);
          // Kirim respons gagal
          res.json({ success: false, message: 'Gagal menambahkan hafalan' });
        } else {
          // Kirim respons sukses
          res.json({ success: true, message: 'Hafalan berhasil ditambahkan' });
        }
      });
    } else if (action === 'edit') {
      const hafalanId = req.body.id;
      const id_siswa = req.body.id_siswa;
      const id_pengajar = req.body.id_pengajar;
      const id_surah = req.body.id_surah;

      const query = 'UPDATE hafalan SET id_siswa = ?, id_pengajar = ?, id_surah = ? WHERE id = ?';
      db.run(query, [id_siswa, id_pengajar, id_surah, hafalanId], (err) => {
        if (err) {
          console.error('Error updating hafalan:', err);
          // Kirim respons gagal
          res.json({ success: false, message: 'Gagal memperbarui hafalan' });
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
          res.json({ success: false, message: 'Gagal menghapus hafalan' });
        } else {
          // Kirim respons sukses
          res.json({ success: true, message: 'Hafalan berhasil dihapus' });
        }
      });
    } else {
      // Jika aksi tidak valid
      res.json({ success: false, message: 'Aksi tidak valid' });
    }
  } else {
    // Jika tidak, arahkan pengguna ke halaman login
    res.redirect('/');
  }
});

router.get('/setor_hafalan', (req, res) => {
  // Cek apakah ada sesi yang aktif dan level pengguna adalah admin
  if (req.session.level === 'admin') {
    try {
      // Ambil data setor_hafalan dari database SQLite
      db.all('SELECT * FROM setor_hafalan', (err, setor_hafalans) => {
        if (err) {
          console.error('Error fetching setor_hafalans:', err);
          res.render('admin/setor_hafalan', { setor_hafalans: [], surahs: [], users: [] });
        } else {
          // Ambil data surah dari database SQLite
          db.all('SELECT * FROM surah', (err, surahs) => {
            if (err) {
              console.error('Error fetching surahs:', err);
              res.render('admin/setor_hafalan', { setor_hafalans: [], surahs: [], users: [] });
            } else {
              // Ambil data siswa dari database SQLite
              db.all('SELECT * FROM users', (err, siswas) => {
                if (err) {
                  console.error('Error fetching users:', err);
                  res.render('admin/setor_hafalan', { setor_hafalans: [], surahs: [], users: [] });
                } else {
                  res.render('admin/setor_hafalan', { setor_hafalans, surahs, siswas });
                }
              });
            }
          });
        }
      });
    } catch (error) {
      console.error('Error fetching setor_hafalans:', error);
      res.render('admin/setor_hafalan', { setor_hafalans: [], surahs: [], siswas: [] });
    }
  } else {
    // Jika tidak, arahkan pengguna ke halaman login
    res.redirect('/');
  }
});

router.post('/setor_hafalan/:action', (req, res) => {
  const action = req.params.action; // Aksi yang akan dilakukan (tambah/edit/hapus)

  // Cek apakah ada sesi yang aktif dan level pengguna adalah admin
  if (req.session.level === 'admin') {

    if (action === 'tambah') {
      const siswa = req.body.siswa;
      const tanggal = req.body.tanggal;
      const surah = req.body.surah;
      const ayatMulai = req.body.ayatMulai;
      const ayatSelesai = req.body.ayatSelesai;
      const hasilSetoran = req.body.hasilSetoran;
      const catatan = req.body.catatan;
      const paraf = req.body.paraf;

      const query = 'INSERT INTO setor_hafalan (siswa, tanggal, surah, ayatMulai, ayatSelesai, hasilSetoran, catatan, paraf) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      db.run(query, [siswa, tanggal, surah, ayatMulai, ayatSelesai, hasilSetoran, catatan, paraf], (err) => {
        if (err) {
          console.error('Error adding setor_hafalan:', err);
          // Kirim respons gagal
          res.json({ success: false, message: 'Gagal menambahkan setor_hafalan' });
        } else {
          // Kirim respons sukses
          res.json({ success: true, message: 'setor_hafalan berhasil ditambahkan' });
        }
      });
    } else if (action === 'edit') {
      const setor_hafalanId = req.body.id;
      const siswa = req.body.siswa;
      const tanggal = req.body.tanggal;
      const surah = req.body.surah;
      const ayatMulai = req.body.ayatMulai;
      const ayatSelesai = req.body.ayatSelesai;
      const hasilSetoran = req.body.hasilSetoran;
      const catatan = req.body.catatan;
      const paraf = req.body.paraf;

      const query = 'UPDATE setor_hafalan SET siswa = ?, tanggal = ?, surah = ?, ayatMulai = ?, ayatSelesai = ?, hasilSetoran = ?, catatan = ?, paraf = ? WHERE id = ?';
      db.run(query, [siswa, tanggal, surah, ayatMulai, ayatSelesai, hasilSetoran, catatan, paraf, setor_hafalanId], (err) => {
        if (err) {
          console.error('Error updating setor_hafalan:', err);
          // Kirim respons gagal
          res.json({ success: false, message: 'Gagal memperbarui setor_hafalan' });
        } else {
          // Kirim respons sukses
          res.json({ success: true, message: 'setor_Hafalan berhasil diperbarui' });
        }
      });
    } else if (action === 'hapus') {
      const setor_hafalanId = req.body.id;

      const query = 'DELETE FROM setor_hafalan WHERE id = ?';
      db.run(query, [setor_hafalanId], (err) => {
        if (err) {
          console.error('Error deleting setor_hafalan:', err);
          // Kirim respons gagal
          res.json({ success: false, message: 'Gagal menghapus setor_hafalan' });
        } else {
          // Kirim respons sukses
          res.json({ success: true, message: 'setor_Hafalan berhasil dihapus' });
        }
      });
    } else {
      // Jika aksi tidak valid
      res.json({ success: false, message: 'Aksi tidak valid' });
    }
  } else {
    // Jika tidak, arahkan pengguna ke halaman login
    res.redirect('/');
  }
});

module.exports = router;
