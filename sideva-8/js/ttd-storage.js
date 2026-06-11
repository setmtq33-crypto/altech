// ============================================
// SUPABASE STORAGE UNTUK TTD & CAP
// ============================================

// Upload file ke bucket 'ttd_cap'
async function uploadToStorage(file, subfolder = 'ttd') {
  if (!file) return null;
  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = `${subfolder}/${fileName}`;
  const { data, error } = await supabaseClient.storage
    .from('ttd_cap')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data: publicUrl } = supabaseClient.storage.from('ttd_cap').getPublicUrl(filePath);
  return publicUrl.publicUrl;
}

// Hapus file dari storage berdasarkan URL
async function deleteFromStorage(url) {
  if (!url || !url.includes('/ttd_cap/')) return;
  const path = url.split('/ttd_cap/')[1];
  if (!path) return;
  await supabaseClient.storage.from('ttd_cap').remove([path]);
}

// Migrasi: ubah Base64 ke File lalu upload (opsional untuk data lama)
async function migrateBase64ToStorage(base64, filename) {
  if (!base64 || base64.startsWith('http')) return base64; // sudah URL
  try {
    const response = await fetch(base64);
    const blob = await response.blob();
    const file = new File([blob], filename, { type: blob.type });
    return await uploadToStorage(file, 'migrated');
  } catch(e) {
    console.warn('Migrasi Base64 gagal', e);
    return base64; // tetap pakai Base64
  }
}
