const express = require('express');
const router = express.Router();
const db = require('../config/db');

// List transaksi
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const bulan = parseInt(req.query.bulan) || (now.getMonth() + 1);
    const tahun = parseInt(req.query.tahun) || now.getFullYear();

    const result = await db.query(`
      SELECT t.*, k.nama AS kategori_nama, k.ikon
      FROM transaksi t
      LEFT JOIN kategori k ON t.kategori_id = k.id
      WHERE EXTRACT(MONTH FROM t.tanggal) = $1 AND EXTRACT(YEAR FROM t.tanggal) = $2
      ORDER BY t.tanggal DESC, t.created_at DESC
    `, [bulan, tahun]);

    // Total bulan ini
    const totalResult = await db.query(`
      SELECT
        COALESCE(SUM(CASE WHEN tipe='pemasukan' THEN jumlah ELSE 0 END), 0) AS masuk,
        COALESCE(SUM(CASE WHEN tipe='pengeluaran' THEN jumlah ELSE 0 END), 0) AS keluar
      FROM transaksi
      WHERE EXTRACT(MONTH FROM tanggal) = $1 AND EXTRACT(YEAR FROM tanggal) = $2
    `, [bulan, tahun]);

    res.render('transaksi/index', {
      transaksi: result.rows,
      bulan,
      tahun,
      totalMasuk: parseFloat(totalResult.rows[0].masuk),
      totalKeluar: parseFloat(totalResult.rows[0].keluar)
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat transaksi');
    res.redirect('/');
  }
});

// Form tambah transaksi
router.get('/tambah', async (req, res) => {
  try {
    const kategori = await db.query('SELECT * FROM kategori ORDER BY tipe, nama');
    res.render('transaksi/form', {
      transaksi: null,
      kategori: kategori.rows
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat form');
    res.redirect('/transaksi');
  }
});

// Simpan transaksi baru
router.post('/', async (req, res) => {
  try {
    const { tanggal, tipe, kategori_id, jumlah, keterangan } = req.body;
    await db.query(
      'INSERT INTO transaksi (tanggal, tipe, kategori_id, jumlah, keterangan) VALUES ($1, $2, $3, $4, $5)',
      [tanggal, tipe, kategori_id, jumlah, keterangan]
    );
    req.flash('success', 'Transaksi berhasil ditambahkan');
    res.redirect('/transaksi');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal menyimpan transaksi');
    res.redirect('/transaksi/tambah');
  }
});

// Form edit transaksi
router.get('/edit/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM transaksi WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      req.flash('error', 'Transaksi tidak ditemukan');
      return res.redirect('/transaksi');
    }
    const kategori = await db.query('SELECT * FROM kategori ORDER BY tipe, nama');
    res.render('transaksi/form', {
      transaksi: result.rows[0],
      kategori: kategori.rows
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat form edit');
    res.redirect('/transaksi');
  }
});

// Update transaksi
router.put('/:id', async (req, res) => {
  try {
    const { tanggal, tipe, kategori_id, jumlah, keterangan } = req.body;
    await db.query(
      'UPDATE transaksi SET tanggal=$1, tipe=$2, kategori_id=$3, jumlah=$4, keterangan=$5 WHERE id=$6',
      [tanggal, tipe, kategori_id, jumlah, keterangan, req.params.id]
    );
    req.flash('success', 'Transaksi berhasil diperbarui');
    res.redirect('/transaksi');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memperbarui transaksi');
    res.redirect('/transaksi');
  }
});

// Hapus transaksi
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM transaksi WHERE id = $1', [req.params.id]);
    req.flash('success', 'Transaksi berhasil dihapus');
    res.redirect('/transaksi');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal menghapus transaksi');
    res.redirect('/transaksi');
  }
});

module.exports = router;
