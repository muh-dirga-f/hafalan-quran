const express = require('express');
const cors = require('cors');
const session = require('express-session');
const apiRouter = require('./api');
const adminRouter = require('./admin');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Buat koneksi ke database SQLite3
const dbPath = path.resolve(__dirname, 'mydb.sqlite3');
const db = new sqlite3.Database(dbPath);

// Buat tabel 'users' jika belum ada
db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, email TEXT, level TEXT)');

// Buat tabel 'surah' jika belum ada
db.run('CREATE TABLE IF NOT EXISTS surah (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, verseCount INTEGER)');

// Buat tabel 'hafalan' jika belum ada
// db.run('DROP TABLE hafalan');
db.run('CREATE TABLE IF NOT EXISTS hafalan (id INTEGER PRIMARY KEY AUTOINCREMENT,siswa INTEGER,tanggal TEXT,surah INTEGER,ayatMulai TEXT,ayatSelesai TEXT,hasilSetoran TEXT,catatan TEXT,paraf TEXT)');

// Tambahkan data contoh ke tabel 'surah'
// db.run('INSERT OR IGNORE INTO surah(name, verseCount) VALUES("Al-Fatihah", 7)');
// db.run('INSERT OR IGNORE INTO surah(name, verseCount) VALUES("An-Nas", 6)');
// db.run('INSERT OR IGNORE INTO surah(name, verseCount) VALUES("Al-Baqarah", 286)');

const app = express();
const port = 3000;
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(express.static('public'));
app.use(cors({ origin: '*' }));

// Gunakan middleware sesi
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// Middleware untuk membuat variabel session dapat digunakan secara global
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

// Routing API
app.use('/api', apiRouter);

app.get('/', (req, res) => {
  // Cek apakah ada sesi yang aktif
  if (req.session.level === 'admin') {
    // Jika sesi dan level cocok, render halaman admin
    res.redirect('/admin');
  } else if (req.session.level === 'wali') {
    // Jika sesi dan level cocok, render halaman wali
    res.redirect('/wali');
  } else {
    // Jika tidak ada sesi aktif, arahkan pengguna ke halaman login
    const error = req.session.error; // Ambil pesan error dari sesi
    req.session.error = null; // Hapus pesan error dari sesi
    res.render('login', { error }); // Kirim pesan error ke halaman login
  }
});

app.get('/cari', (req, res) => {
  res.render('cari');
});

app.post('/cari', (req, res) => {
  const username = req.body.username;
  db.all('SELECT id, username, email, level FROM users WHERE username = ?', username, (err, dataUser) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Failed to fetch data' });
    } else {
      if (dataUser.length > 0) {
        const userId = dataUser[0].id;
        db.all('SELECT * FROM hafalan WHERE id_siswa = ?', userId, (err, dataHafalan) => {
          if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Failed to fetch data' });
          } else {
            if (dataHafalan.length > 0) {
              const hafalanIds = dataHafalan.map((hafalan) => hafalan.id);
              db.all('SELECT * FROM setor_hafalan WHERE id_hafalan IN (' + hafalanIds.join(',') + ')', (err, dataSetorHafalan) => {
                if (err) {
                  console.error('Error executing query:', err);
                  res.status(500).json({ error: 'Failed to fetch data' });
                } else {
                  const surahIds = dataHafalan.map((hafalan) => hafalan.id_surah);
                  db.all('SELECT * FROM surah WHERE id IN (' + surahIds.join(',') + ')', (err, dataSurah) => {
                    if (err) {
                      console.error('Error executing query:', err);
                      res.status(500).json({ error: 'Failed to fetch data' });
                    } else {
                      const pengajarIds = dataHafalan.map((hafalan) => hafalan.id_pengajar);
                      db.all('SELECT id, username, email, level FROM users WHERE id IN (' + pengajarIds.join(',') + ')', (err, dataPengajar) => {
                        if (err) {
                          console.error('Error executing query:', err);
                          res.status(500).json({ error: 'Failed to fetch data' });
                        } else {
                          const dataHafalanWithSetorHafalan = dataHafalan.map((hafalan) => {
                            const setorHafalan = dataSetorHafalan.filter((setor) => setor.id_hafalan === hafalan.id);
                            const surah = dataSurah.find((surah) => surah.id === hafalan.id_surah);
                            const pengajar = dataPengajar.find((pengajar) => pengajar.id === hafalan.id_pengajar);
                            return { ...hafalan, setorHafalan, surah, pengajar }; // Changed dataSetorHafalan to setorHafalan
                          });
                          res.json({ dataUser, dataHafalan: dataHafalanWithSetorHafalan });
                        }
                      });
                    }
                  });
                }
              });
            } else {
              res.json({ dataUser, dataHafalan: [] });
            }
          }
        });
      } else {
        res.json({ dataUser: [], dataHafalan: [] });
      }
    }
  });
});

app.use('/admin', adminRouter);

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Cek apakah pengguna dengan username yang diberikan ada dalam database
  db.get('SELECT * FROM users WHERE username = ?', [username], (error, row) => {
    if (error) {
      // Terjadi kesalahan saat mengakses database SQLite3
      res.render('login', { error: 'Kesalahan saat mengakses database. Silakan coba lagi.' });
    } else if (!row) {
      // Pengguna dengan username yang diberikan tidak ditemukan
      res.render('login', { error: 'Username tidak ditemukan. Silakan coba lagi.' });
    } else if (row.password !== password) {
      // Password salah
      res.render('login', { error: 'Password salah. Silakan coba lagi.' });
    } else {
      // Login berhasil, simpan informasi pengguna di sesi atau cookie jika diperlukan
      req.session.username = username;
      req.session.level = row.level;

      // Arahkan pengguna ke halaman sesuai dengan level pengguna
      if (row.level === "admin") {
        res.redirect('/admin');
      } else if (row.level === "pengajar") {
        res.redirect('/pengajar');
      } else if (row.level === "wali") {
        res.redirect('/wali');
      } else {
        // Level pengguna tidak valid
        res.send('Level pengguna tidak valid.');
      }
    }
  });
});

app.get('/logout', (req, res) => {
  // Hapus sesi pengguna
  req.session.destroy((error) => {
    if (error) {
      res.send(error.message);
    } else {
      // Redirect pengguna ke halaman login setelah logout berhasil
      res.redirect('/');
    }
  });
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
