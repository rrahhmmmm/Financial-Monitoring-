const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const methodOverride = require('method-override');
const path = require('path');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session({
  secret: 'keuangan-keluarga-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

// Global template variables
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/transaksi', require('./routes/transaksi'));
app.use('/kategori', require('./routes/kategori'));
app.use('/anggaran', require('./routes/anggaran'));
app.use('/laporan', require('./routes/laporan'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
