// ============================================================
// Performance Optimization for SI-DEVA (FIXED)
// ============================================================
(function() {
  // 1. Lazy loading gambar
  const images = document.querySelectorAll('img[data-src]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });
    images.forEach(img => observer.observe(img));
  }
  
  // BAGIAN CONSOLE LOG DIHAPUS UNTUK MENGHINDARI ERROR PADA SUPABASE & DEVTOOLS
})();
