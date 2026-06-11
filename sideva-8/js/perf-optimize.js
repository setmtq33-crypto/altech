// ============================================================
// Performance Optimization for SI-DEVA
// ============================================================
(function() {
  // 1. Lazy loading gambar menggunakan IntersectionObserver
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
  } else {
    // Fallback untuk browser lama yang tidak mendukung IntersectionObserver
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }

  /**
   * CATATAN: 
   * Bagian penimpaan console.log (console.log = noop) dihapus.
   * Menimpa fungsi global console menyebabkan error pada internal 
   * metrics reporter Chrome DevTools.
   */
})();
