-- Tabel Kategori
CREATE TABLE IF NOT EXISTS kategori (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  tipe VARCHAR(12) NOT NULL CHECK (tipe IN ('pemasukan', 'pengeluaran')),
  ikon VARCHAR(50) DEFAULT '📁',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel Transaksi
CREATE TABLE IF NOT EXISTS transaksi (
  id SERIAL PRIMARY KEY,
  tanggal DATE NOT NULL,
  tipe VARCHAR(12) NOT NULL CHECK (tipe IN ('pemasukan', 'pengeluaran')),
  kategori_id INT REFERENCES kategori(id) ON DELETE SET NULL,
  jumlah DECIMAL(15,2) NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel Anggaran (Budget Bulanan)
CREATE TABLE IF NOT EXISTS anggaran (
  id SERIAL PRIMARY KEY,
  kategori_id INT REFERENCES kategori(id) ON DELETE CASCADE,
  bulan INT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
  tahun INT NOT NULL,
  jumlah DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(kategori_id, bulan, tahun)
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_transaksi_tanggal ON transaksi(tanggal);
CREATE INDEX IF NOT EXISTS idx_transaksi_tipe ON transaksi(tipe);
CREATE INDEX IF NOT EXISTS idx_anggaran_bulan_tahun ON anggaran(bulan, tahun);

-- Seed Data Kategori
INSERT INTO kategori (nama, tipe, ikon) VALUES
  ('Gaji', 'pemasukan', '💰'),
  ('Freelance', 'pemasukan', '💻'),
  ('Investasi', 'pemasukan', '📈'),
  ('Bonus', 'pemasukan', '🎁'),
  ('Lainnya', 'pemasukan', '📥'),
  ('Makanan & Minuman', 'pengeluaran', '🍔'),
  ('Transportasi', 'pengeluaran', '🚗'),
  ('Listrik & Air', 'pengeluaran', '💡'),
  ('Internet & Telpon', 'pengeluaran', '📱'),
  ('Pendidikan', 'pengeluaran', '📚'),
  ('Kesehatan', 'pengeluaran', '🏥'),
  ('Hiburan', 'pengeluaran', '🎬'),
  ('Belanja', 'pengeluaran', '🛒'),
  ('Tabungan', 'pengeluaran', '🏦'),
  ('Lainnya', 'pengeluaran', '📤')
ON CONFLICT DO NOTHING;
