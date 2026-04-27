const express = require('express');
const router = express.Router();
const db = require('../config/db');

// List kategori
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM kategori ORDER BY tipe, nama');
    const pemasukan = result.rows.filter(k => k.tipe === 'pemasukan');
    const pengeluaran = result.rows.filter(k => k.tipe === 'pengeluaran');
    res.render('kategori/index', { pemasukan, pengeluaran });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat kategori');
    res.redirect('/');
  }
});

// Tambah kategori
router.post('/', async (req, res) => {
  try {
    const { nama, tipe, ikon } = req.body;
    await db.query(
      'INSERT INTO kategori (nama, tipe, ikon) VALUES ($1, $2, $3)',
      [nama, tipe, ikon || '📁']
    );
    req.flash('success', 'Kategori berhasil ditambahkan');
    res.redirect('/kategori');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal menambah kategori');
    res.redirect('/kategori');
  }
});

// Hapus kategori
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM kategori WHERE id = $1', [req.params.id]);
    req.flash('success', 'Kategori berhasil dihapus');
    res.redirect('/kategori');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal menghapus kategori. Mungkin masih ada transaksi terkait.');
    res.redirect('/kategori');
  }
});

module.exports = router;
