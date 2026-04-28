# Keuangan Keluarga (KeluargaKu)

Aplikasi pencatatan keuangan sederhana untuk keluarga. Mencatat pemasukan, pengeluaran, anggaran bulanan, dan laporan keuangan dengan visualisasi chart.

## Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js v5
- **Database:** PostgreSQL (v14+)
- **Template Engine:** EJS
- **Chart:** Chart.js (CDN)

## Prerequisites

Pastikan sudah terinstall di mesin lokal:

- [Node.js](https://nodejs.org/) v18 atau lebih baru
- [PostgreSQL](https://www.postgresql.org/) v14 atau lebih baru
- npm (sudah termasuk di Node.js)

## Setup

### 1. Clone & Install Dependencies

```bash
git clone <repo-url>
cd tes
npm install
```

### 2. Buat Database PostgreSQL

```bash
createdb -U postgres keuangan_keluarga
```

### 3. Konfigurasi Koneksi Database

Edit file `config/db.js` sesuai environment kamu:

```js
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '<password_kamu>',
  database: '<nama_database_kamu>'
});
```

### 4. Jalankan Schema & Seed Data

```bash
psql -U postgres -d <nama_database> -f db/init.sql
```

File `init.sql` akan membuat tabel dan mengisi kategori default.

Opsional — untuk data contoh (transaksi 4 bulan):

```bash
psql -U postgres -d <nama_database> -f db/seed-story.sql
```

### 5. Jalankan Aplikasi

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Buka **http://localhost:3000** di browser.

## Struktur Project

```
├── app.js                 # Entry point Express server
├── config/db.js           # Koneksi PostgreSQL
├── db/
│   ├── init.sql           # Schema tabel + seed kategori
│   └── seed-story.sql     # Data contoh (opsional)
├── routes/
│   ├── index.js           # Dashboard
│   ├── transaksi.js       # CRUD transaksi
│   ├── kategori.js        # CRUD kategori
│   ├── anggaran.js        # Anggaran bulanan
│   └── laporan.js         # Laporan & chart
├── views/                 # EJS templates
├── public/
│   ├── css/style.css      # Dark green theme
│   └── js/app.js          # Client-side JS
└── package.json
```

## Database Schema

| Tabel | Deskripsi |
|-------|-----------|
| `kategori` | Kategori pemasukan & pengeluaran |
| `transaksi` | Data transaksi harian |
| `anggaran` | Budget bulanan per kategori |

## Fitur

- Dashboard ringkasan saldo & transaksi terakhir
- CRUD transaksi (pemasukan & pengeluaran)
- Manajemen kategori
- Anggaran bulanan dengan progress bar
- Laporan bulanan dengan pie chart & bar chart
- Filter per bulan/tahun
- Responsive design (mobile-friendly)

## Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm start` | Jalankan server |
| `npm run dev` | Jalankan dengan nodemon (auto-restart) |

## Port Default

| Service | Port |
|---------|------|
| App | 3000 |
| PostgreSQL | 5432 |
