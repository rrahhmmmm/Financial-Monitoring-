const express = require('express');
const router = express.Router();
const db = require('../config/db');

// List anggaran bulan tertentu
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const bulan = parseInt(req.query.bulan) || (now.getMonth() + 1);
    const tahun = parseInt(req.query.tahun) || now.getFullYear();

    const result = await db.query(`
      SELECT a.id, k.nama, k.ikon, a.jumlah AS anggaran,
        COALESCE(SUM(t.jumlah), 0) AS terpakai
      FROM anggaran a
      JOIN kategori k ON a.kategori_id = k.id
      LEFT JOIN transaksi t ON t.kategori_id = a.kategori_id
        AND EXTRACT(MONTH FROM t.tanggal) = a.bulan
        AND EXTRACT(YEAR FROM t.tanggal) = a.tahun
        AND t.tipe = 'pengeluaran'
      WHERE a.bulan = $1 AND a.tahun = $2
      GROUP BY a.id, k.nama, k.ikon, a.jumlah
      ORDER BY k.nama
    `, [bulan, tahun]);

    const anggaranList = result.rows.map(row => ({
      ...row,
      anggaran: parseFloat(row.anggaran),
      terpakai: parseFloat(row.terpakai),
      sisa: parseFloat(row.anggaran) - parseFloat(row.terpakai),
      persen: parseFloat(row.anggaran) > 0
        ? Math.round((parseFloat(row.terpakai) / parseFloat(row.anggaran)) * 100)
        : 0
    }));

    const totalAnggaran = anggaranList.reduce((s, a) => s + a.anggaran, 0);
    const totalTerpakai = anggaranList.reduce((s, a) => s + a.terpakai, 0);

    res.render('anggaran/index', {
      anggaranList,
      bulan,
      tahun,
      totalAnggaran,
      totalTerpakai
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat anggaran');
    res.redirect('/');
  }
});

// Form atur anggaran
router.get('/atur', async (req, res) => {
  try {
    const now = new Date();
    const bulan = parseInt(req.query.bulan) || (now.getMonth() + 1);
    const tahun = parseInt(req.query.tahun) || now.getFullYear();

    // Ambil semua kategori pengeluaran
    const kategoriResult = await db.query(
      "SELECT * FROM kategori WHERE tipe = 'pengeluaran' ORDER BY nama"
    );

    // Ambil anggaran yang sudah ada
    const anggaranResult = await db.query(
      'SELECT kategori_id, jumlah FROM anggaran WHERE bulan = $1 AND tahun = $2',
      [bulan, tahun]
    );

    const anggaranMap = {};
    anggaranResult.rows.forEach(a => {
      anggaranMap[a.kategori_id] = parseFloat(a.jumlah);
    });

    res.render('anggaran/form', {
      kategori: kategoriResult.rows,
      anggaranMap,
      bulan,
      tahun
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal memuat form anggaran');
    res.redirect('/anggaran');
  }
});

// Simpan anggaran (upsert)
router.post('/', async (req, res) => {
  try {
    const { bulan, tahun, anggaran } = req.body;

    // anggaran is an object: { kategori_id: jumlah, ... }
    for (const [kategoriId, jumlah] of Object.entries(anggaran)) {
      const amount = parseFloat(jumlah);
      if (amount > 0) {
        await db.query(`
          INSERT INTO anggaran (kategori_id, bulan, tahun, jumlah)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (kategori_id, bulan, tahun)
          DO UPDATE SET jumlah = $4
        `, [kategoriId, bulan, tahun, amount]);
      } else {
        // Hapus anggaran jika 0
        await db.query(
          'DELETE FROM anggaran WHERE kategori_id = $1 AND bulan = $2 AND tahun = $3',
          [kategoriId, bulan, tahun]
        );
      }
    }

    req.flash('success', 'Anggaran berhasil disimpan');
    res.redirect(`/anggaran?bulan=${bulan}&tahun=${tahun}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Gagal menyimpan anggaran');
    res.redirect('/anggaran');
  }
});

module.exports = router;
