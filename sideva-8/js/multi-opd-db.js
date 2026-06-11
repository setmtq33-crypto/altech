// Multi-OPD filter by nama_opd
window._currentOpdId=null; window._userOpdList=[]; const _origGetAll=window.dbGetAll; const _origPut=window.dbPut;
window.dbGetAll=async function(store){ const tbl=TABLE_MAP[store]||store; const f=FIELD_MAP[store]; const opdTables=['paket','rincian','harga','penyedia','bidang','rekening','ppk','pejabatPengadaan','ecatalog']; let q=`/rest/v1/${tbl}?select=*&order=id.asc`; if(opdTables.includes(store)&&!isSuperAdmin()&&window._userOpdName){ q+=`&opd=eq.${encodeURIComponent(window._userOpdName)}`; } const rows=await sbFetch(q,'GET'); return f?rows.map(f.from):rows; };
window.dbPut=async function(store,data){ const row={...data}; const opdTables=['paket','rincian','harga','penyedia','bidang','rekening','ppk','pejabatPengadaan','ecatalog']; if(opdTables.includes(store)&&!isSuperAdmin()&&window._userOpdName){ row.opd=window._userOpdName; } return _origPut.call(this,store,row); };
console.log('✅ Multi-OPD layer loaded');
