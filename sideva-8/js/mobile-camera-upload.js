// ============================================================
// SI-DEVA Mobile Camera Upload v8.2
// ============================================================
(function(){

  function compressImage(file, maxWidth = 1280, quality = 0.75) {
    return new Promise((resolve, reject) => {

      const img = new Image();
      const reader = new FileReader();

      reader.onload = e => {
        img.src = e.target.result;
      };

      reader.onerror = reject;

      img.onload = () => {

        const canvas = document.createElement('canvas');

        let w = img.width;
        let h = img.height;

        if (w > maxWidth) {
          h = Math.round(h * maxWidth / w);
          w = maxWidth;
        }

        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob(blob => {

          if (!blob) {
            reject(new Error('Gagal mengompres gambar'));
            return;
          }

          resolve(
            new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '.jpg'),
              { type: 'image/jpeg' }
            )
          );

        }, 'image/jpeg', quality);

      };

      img.onerror = reject;

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
      camInput.capture = 'environment';

      camInput.onchange = async (e) => {

        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
          alert('File harus berupa gambar');
          return;
        }

        if (file.size > 15 * 1024 * 1024) {
          alert('Ukuran foto maksimal 15 MB');
          return;
        }

        btn.disabled = true;
        btn.textContent = 'Mengompres...';

        try {

          const compressed = await compressImage(file);

          const dt = new DataTransfer();

          dt.items.add(compressed);

          input.files = dt.files;

          const objUrl = URL.createObjectURL(compressed);

          preview.onload = () => {
            URL.revokeObjectURL(objUrl);
          };

          preview.src = objUrl;
          preview.style.display = 'block';

          btn.textContent = '📷 Ganti Foto';

          input.dispatchEvent(
            new Event('change', { bubbles: true })
          );

        } catch (err) {

          console.error(err);

          alert('Gagal memproses gambar');

        } finally {

          btn.disabled = false;

        }

      };

      camInput.click();

    };

    input.parentNode.insertBefore(
      wrapper,
      input.nextSibling
    );

    wrapper.appendChild(btn);
    wrapper.appendChild(preview);

    input.addEventListener('change', () => {

      const f = input.files[0];

      if (!f || !f.type.startsWith('image/')) return;

      const objUrl = URL.createObjectURL(f);

      preview.onload = () => {
        URL.revokeObjectURL(objUrl);
      };

      preview.src = objUrl;
      preview.style.display = 'block';

    });

  }

  function init() {

    document
      .querySelectorAll(
        'input[type="file"][accept*="image"]'
      )
      .forEach(addCameraButton);

  }

  if (document.readyState === 'loading') {

    document.addEventListener(
      'DOMContentLoaded',
      init
    );

  } else {

    init();

  }

  let observerTimer;

  const observer = new MutationObserver(() => {

    clearTimeout(observerTimer);

    observerTimer = setTimeout(() => {
      init();
    }, 300);

  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.mobileCameraUploadReady = true;

  document.dispatchEvent(
    new CustomEvent(
      'sideva:mobile-camera-upload-ready'
    )
  );

  console.log(
    '[SI-DEVA] Mobile Camera Upload v8.2 Ready'
  );

})();
