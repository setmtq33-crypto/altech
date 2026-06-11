// ============================================================
// SI-DEVA Mobile Camera Upload v8
// Fitur: Tombol "Foto Langsung", auto-compress, preview
// Cara pakai: tambahkan <script src="mobile-camera-upload.js"></script>
// setelah branding-patch.js
// ============================================================
(function(){
  function compressImage(file, maxWidth = 1280, quality = 0.75) {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = e => {
        img.src = e.target.result;
      };
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxWidth) {
          h = Math.round(h * maxWidth / w);
          w = maxWidth;
        }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(blob => {
          resolve(new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {type:'image/jpeg'}));
        }, 'image/jpeg', quality);
      };
      reader.readAsDataURL(file);
    });
  }

  function addCameraButton(input) {
    if (input.dataset.cameraEnhanced) return;
    input.dataset.cameraEnhanced = '1';

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.gap = '8px';
    wrapper.style.alignItems = 'center';
    wrapper.style.marginTop = '6px';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-ghost';
    btn.innerHTML = '📷 Foto Langsung';
    btn.style.flexShrink = '0';

    const preview = document.createElement('img');
    preview.style.maxWidth = '80px';
    preview.style.maxHeight = '60px';
    preview.style.borderRadius = '6px';
    preview.style.display = 'none';
    preview.style.border = '1px solid var(--border)';

    btn.onclick = () => {
      const camInput = document.createElement('input');
      camInput.type = 'file';
      camInput.accept = 'image/*';
      camInput.capture = 'environment'; // kamera belakang
      camInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        btn.disabled = true;
        btn.textContent = 'Mengompres...';
        const compressed = await compressImage(file);
        // buat FileList baru untuk input asli
        const dt = new DataTransfer();
        dt.items.add(compressed);
        input.files = dt.files;
        // preview
        preview.src = URL.createObjectURL(compressed);
        preview.style.display = 'block';
        btn.textContent = '📷 Ganti Foto';
        btn.disabled = false;
        // trigger change event untuk kode lama kamu
        input.dispatchEvent(new Event('change', {bubbles:true}));
      };
      camInput.click();
    };

    input.parentNode.insertBefore(wrapper, input.nextSibling);
    wrapper.appendChild(btn);
    wrapper.appendChild(preview);

    // jika user pilih file biasa, tetap tampilkan preview
    input.addEventListener('change', () => {
      const f = input.files[0];
      if (f && f.type.startsWith('image/')) {
        preview.src = URL.createObjectURL(f);
        preview.style.display = 'block';
      }
    });
  }

  function init() {
    document.querySelectorAll('input[type="file"][accept*="image"]').forEach(addCameraButton);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // untuk modal yang dibuka dinamis
  const observer = new MutationObserver(init);
  observer.observe(document.body, {childList:true, subtree:true});
})();
