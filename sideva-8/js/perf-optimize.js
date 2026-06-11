// ============================================================
// Performance Optimization for SI-DEVA
// ============================================================
(function() {
  // 1. Cache fetch untuk data master (sudah di multi-opd-admin, tapi perkuat)
  // 2. Lazy loading gambar
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
  // 3. Hapus console.log yang tidak perlu di production
  if (window.location.hostname !== 'localhost') {
    const noop = () => {};
    console.log = noop;
    console.info = noop;
    console.debug = noop;
  }
})();
