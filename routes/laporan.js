const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const bulan = parseInt(req.query.bulan) || (now.getMonth() + 1);
    const tahun = parseInt(req.query.tahun) || now.getFullYear();

    // Total pemasukan & pengeluaran bulan ini
    const totalResult = await db.query(`
      SELECT
        COALESCE(SUM(CASE WHEN tipe='pemasukan' THEN jumlah ELSE 0 END), 0) AS masuk,
        COALESCE(SUM(CASE WHEN tipe='pengeluaran' THEN jumlah ELSE 0 END), 0) AS keluar
      FROM transaksi
      WHERE EXTRACT(MONTH FROM tanggal) = $1 AND EXTRACT(YEAR FROM tanggal) = $2
    `, [bulan, tahun]);

    const totalMasuk = parseFloat(totalResult.rows[0].masuk);
    const totalKeluar = parseFloat(totalResult.rows[0].keluar);

    // Pengeluaran per kategori (untuk pie chart)
    const perKategoriResult = await db.query(`
      SELECT k.nama, k.ikon, SUM(t.jumlah) AS total
      FROM transaksi t
      JOIN kategori k ON t.kategori_id = k.id
      WHERE t.tipe = 'pengeluaran'
        AND EXTRACT(MONTH FROM t.tanggal) = $1
        AND EXTRACT(YEAR FROM t.tanggal) = $2
      GROUP BY k.nama, k.ikon
      ORDER BY total DESC
    `, [bulan, tahun]);

    // Pemasukan per kategori
    const pemasukanKategoriResult = await db.query(`
      SELECT k.nama, k.ikon, SUM(t.jumlah) AS total
      FROM transaksi t
      JOIN kategori k ON t.kategori_id = k.id
      WHERE t.tipe = 'pemasukan'
        AND EXTRACT(MONTH FROM t.tanggal) = $1
        AND EXTRACT(YEAR FROM t.tanggal) = $2
      GROUP BY k.nama, k.ikon
      ORDER BY total DESC
    `, [bulan, tahun]);

    // Tren harian (untuk bar chart)
    const harianResult = await db.query(`
      SELECT
        EXTRACT(DAY FROM tanggal)::int AS hari,
        COALESCE(SUM(CASE WHEN tipe='pemasukan' THEN jumlah ELSE 0 END), 0) AS masuk,
        COALESCE(SUM(CASE WHEN tipe='pengeluaran' THEN jumlah ELSE 0 END), 0) AS keluar
      FROM transaksi
      WHERE EXTRACT(MONTH FROM tanggal) = $1 AND EXTRACT(YEAR FROM tanggal) = $2
      GROUP BY hari
      ORDER BY hari
    `, [bulan, tahun]);

    res.render('laporan/index', {
      bulan,
      tahun,
      totalMasuk,
      totalKeluar,
      selisih: totalMasuk - totalKeluar,
      pengeluaranKategori: perKategoriResult.rows,
      pemasukanKategori: pemasukanKategoriResult.rows,
      trenHarian: harianResult.rows
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat laporan');
    res.redirect('/');
  }
});

module.exports = router;
