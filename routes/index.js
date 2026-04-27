const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    // Saldo total
    const saldoResult = await db.query(`
      SELECT
        COALESCE(SUM(CASE WHEN tipe='pemasukan' THEN jumlah ELSE 0 END), 0) AS total_masuk,
        COALESCE(SUM(CASE WHEN tipe='pengeluaran' THEN jumlah ELSE 0 END), 0) AS total_keluar
      FROM transaksi
    `);
    const totalMasuk = parseFloat(saldoResult.rows[0].total_masuk);
    const totalKeluar = parseFloat(saldoResult.rows[0].total_keluar);
    const saldo = totalMasuk - totalKeluar;

    // Ringkasan bulan ini
    const now = new Date();
    const bulan = now.getMonth() + 1;
    const tahun = now.getFullYear();

    const bulanIniResult = await db.query(`
      SELECT
        COALESCE(SUM(CASE WHEN tipe='pemasukan' THEN jumlah ELSE 0 END), 0) AS masuk,
        COALESCE(SUM(CASE WHEN tipe='pengeluaran' THEN jumlah ELSE 0 END), 0) AS keluar
      FROM transaksi
      WHERE EXTRACT(MONTH FROM tanggal) = $1 AND EXTRACT(YEAR FROM tanggal) = $2
    `, [bulan, tahun]);

    const bulanMasuk = parseFloat(bulanIniResult.rows[0].masuk);
    const bulanKeluar = parseFloat(bulanIniResult.rows[0].keluar);

    // 5 Transaksi terakhir
    const transaksiResult = await db.query(`
      SELECT t.*, k.nama AS kategori_nama, k.ikon
      FROM transaksi t
      LEFT JOIN kategori k ON t.kategori_id = k.id
      ORDER BY t.tanggal DESC, t.created_at DESC
      LIMIT 5
    `);

    res.render('index', {
      saldo,
      totalMasuk,
      totalKeluar,
      bulanMasuk,
      bulanKeluar,
      bulanNet: bulanMasuk - bulanKeluar,
      transaksi: transaksiResult.rows,
      bulan,
      tahun
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat dashboard');
    res.render('index', {
      saldo: 0, totalMasuk: 0, totalKeluar: 0,
      bulanMasuk: 0, bulanKeluar: 0, bulanNet: 0,
      transaksi: [], bulan: new Date().getMonth() + 1, tahun: new Date().getFullYear()
    });
  }
});

module.exports = router;
