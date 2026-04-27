// Filter kategori dropdown berdasarkan tipe transaksi
document.addEventListener('DOMContentLoaded', function() {
  const tipeMasuk = document.getElementById('tipe-masuk');
  const tipeKeluar = document.getElementById('tipe-keluar');
  const kategoriSelect = document.getElementById('kategori-select');

  if (tipeMasuk && tipeKeluar && kategoriSelect) {
    function filterKategori() {
      const selectedTipe = document.querySelector('input[name="tipe"]:checked');
      if (!selectedTipe) return;

      const tipe = selectedTipe.value;
      const options = kategoriSelect.querySelectorAll('option[data-tipe]');
      let hasSelected = false;

      options.forEach(opt => {
        if (opt.dataset.tipe === tipe) {
          opt.style.display = '';
          if (opt.selected) hasSelected = true;
        } else {
          opt.style.display = 'none';
          if (opt.selected) {
            opt.selected = false;
          }
        }
      });

      // Reset ke pilihan default jika kategori terpilih tidak cocok
      if (!hasSelected) {
        kategoriSelect.value = '';
      }
    }

    tipeMasuk.addEventListener('change', filterKategori);
    tipeKeluar.addEventListener('change', filterKategori);

    // Filter saat halaman dimuat
    filterKategori();
  }

  // Auto-dismiss alerts
  document.querySelectorAll('.alert').forEach(alert => {
    setTimeout(() => {
      alert.style.opacity = '0';
      alert.style.transition = 'opacity 0.5s';
      setTimeout(() => alert.remove(), 500);
    }, 3000);
  });
});
