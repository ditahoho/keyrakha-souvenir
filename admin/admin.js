const config = window.KEYRAKHA_SUPABASE || {};
const configured = config.url && config.publishableKey && !config.url.includes('TEMPEL_') && !config.publishableKey.includes('TEMPEL_');
const db = configured && window.supabase?.createClient ? window.supabase.createClient(config.url, config.publishableKey) : null;
const $ = (s) => document.querySelector(s);
const esc = (v='') => String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
const rupiah = (v) => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(v||0));
const slugify = (v) => String(v||'').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

function toast(message,type='success') {
  const host=$('#toastHost'); if(!host)return;
  const el=document.createElement('div'); el.className=`admin-toast ${type}`; el.textContent=message; host.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('show'));
  setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),220);},3200);
}
function setBusy(btn,busy,busyText,normalText){
  btn.disabled=busy; btn.classList.toggle('is-loading',busy);
  btn.innerHTML=busy?`<span class="admin-spinner" aria-hidden="true"></span>${busyText}`:normalText;
}
function askConfirm({title='Konfirmasi',message,confirmText='Lanjutkan',danger=false}){
  return new Promise(resolve=>{
    const d=$('#confirmDialog'),t=$('#confirmTitle'),m=$('#confirmMessage'),yes=$('#confirmYes'),no=$('#confirmNo');
    t.textContent=title;m.textContent=message;yes.textContent=confirmText;yes.classList.toggle('danger',danger);
    const done=(value)=>{yes.onclick=null;no.onclick=null;d.oncancel=null;if(d.open)d.close();resolve(value);};
    yes.onclick=()=>done(true);no.onclick=()=>done(false);d.oncancel=(e)=>{e.preventDefault();done(false)};d.showModal();
  });
}

async function sessionOrRedirect() {
  if (!db) return null;
  const { data } = await db.auth.getSession();
  if (!data.session && !location.pathname.endsWith('/login.html')) location.href = 'login.html';
  if (data.session && location.pathname.endsWith('/login.html')) location.href = 'index.html';
  return data.session;
}

async function initLogin() {
  if (!$('#loginForm')) return;
  if (!db) { $('#loginMessage').textContent = 'Supabase belum dikonfigurasi di js/supabase-config.js.'; return; }
  await sessionOrRedirect();
  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn=$('#loginButton'), msg=$('#loginMessage');
    btn.disabled=true; btn.textContent='Memeriksa akun...'; msg.textContent='';
    const { error } = await db.auth.signInWithPassword({email:$('#email').value.trim(),password:$('#password').value});
    if (error) { msg.textContent = 'Login gagal: ' + error.message; msg.classList.add('error'); btn.disabled=false; btn.innerHTML='Masuk ke Dashboard <span>↗</span>'; return; }
    location.href='index.html';
  });
}

let categories=[];
let products=[];
let settings=null;

async function initDashboard() {
  if (!$('#productRows')) return;
  if (!db) { $('#productRows').innerHTML='<tr><td colspan="6">Supabase belum dikonfigurasi.</td></tr>'; return; }
  const session=await sessionOrRedirect(); if (!session) return;
  $('#adminEmail').textContent=session.user.email;
  $('#logoutButton').addEventListener('click',async()=>{await db.auth.signOut();location.href='login.html';});

  $('#addProductButton').addEventListener('click',()=>openProductForm());
  $('#closeDialog').addEventListener('click',closeProductForm);
  $('#cancelProduct').addEventListener('click',closeProductForm);
  $('#productForm').addEventListener('submit',saveProduct);
  $('#productImage').addEventListener('change',previewFile);
  $('#productGallery').addEventListener('change',previewGalleryFiles);
  $('#productPromo').addEventListener('change',togglePromoFields);

  $('#addCategoryButton').addEventListener('click',()=>openCategoryForm());
  $('#closeCategoryDialog').addEventListener('click',closeCategoryForm);
  $('#cancelCategory').addEventListener('click',closeCategoryForm);
  $('#categoryForm').addEventListener('submit',saveCategory);
  $('#categoryName').addEventListener('input',()=>{
    if (!$('#categoryId').value || $('#categorySlug').dataset.auto !== 'off') $('#categorySlug').value=slugify($('#categoryName').value);
  });
  $('#categorySlug').addEventListener('input',()=>{$('#categorySlug').dataset.auto='off';});

  $('#settingsForm').addEventListener('submit',saveSettings);
  initThemeManager();
  initAdminNavigation();
  await loadAll();
}

function initAdminNavigation(){
  const links=[...document.querySelectorAll('#adminNav a[href^="#"]')];
  links.forEach(link=>link.addEventListener('click',()=>{
    links.forEach(l=>l.classList.remove('active')); link.classList.add('active');
  }));
  const sections=[...document.querySelectorAll('.admin-scroll-section')];
  if ('IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries=>{
      const active=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!active)return;
      links.forEach(l=>l.classList.toggle('active',l.getAttribute('href')===`#${active.target.id}`));
    },{rootMargin:'-20% 0px -65% 0px',threshold:[0,.15,.4]});
    sections.forEach(s=>observer.observe(s));
  }
}

async function loadAll(){
  const [c,p,s]=await Promise.all([
    db.from('categories').select('*').order('name'),
    db.from('products').select('*,categories(name,slug)').order('created_at',{ascending:false}),
    db.from('settings').select('*').order('id',{ascending:true}).limit(1).maybeSingle()
  ]);
  const error=c.error||p.error||s.error;
  if(error){
    $('#productRows').innerHTML=`<tr><td colspan="6">Gagal memuat data: ${esc(error.message)}</td></tr>`;
    $('#categoryRows').innerHTML=`<tr><td colspan="4">Gagal memuat data: ${esc(error.message)}</td></tr>`;
    toast('Gagal memuat data admin: '+error.message,'error');
    return;
  }
  categories=c.data||[]; products=p.data||[]; settings=s.data||null;
  renderCategories(); renderProducts(); renderCategoryRows(); renderStats(); renderSettings();
}

function renderCategories(){
  $('#productCategory').innerHTML='<option value="">Pilih kategori</option>'+categories.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
}
function renderStats(){
  $('#statTotal').textContent=products.length;
  $('#statActive').textContent=products.filter(p=>p.active).length;
  $('#statFeatured').textContent=products.filter(p=>p.featured).length;
  $('#statCategories').textContent=categories.length;
}
function renderProducts(){
  if(!products.length){$('#productRows').innerHTML='<tr><td colspan="6" class="admin-empty">Belum ada produk. Klik <strong>Tambah Produk</strong> untuk membuat produk pertama.</td></tr>';return;}
  $('#productRows').innerHTML=products.map(p=>{
    const labels=[p.featured?'Pilihan':'',p.best_seller?'Best Seller':'',p.is_new?'Baru':'',p.promo_enabled?'Promo':''].filter(Boolean);
    const priceText=p.promo_enabled&&p.promo_price?`<span class="admin-price-old">${rupiah(p.price)}</span><strong>${rupiah(p.promo_price)}</strong>`:rupiah(p.price);
    return `<tr><td><div class="admin-product-cell">${p.image_url?`<img src="${esc(p.image_url)}" alt="">`:'<span class="admin-thumb-placeholder">K</span>'}<div><strong>${esc(p.name)}</strong><small>Min. ${Number(p.minimum_order||1)} pcs</small></div></div></td><td>${esc(p.categories?.name||'—')}</td><td>${priceText}</td><td><span class="admin-pill ${p.active?'on':'off'}">${p.active?'Aktif':'Nonaktif'}</span></td><td><div class="admin-label-list">${labels.length?labels.map(x=>`<span>${x}</span>`).join(''):'—'}</div></td><td><div class="admin-actions"><button data-edit="${p.id}">Edit</button><button class="danger" data-delete="${p.id}">Hapus</button></div></td></tr>`;
  }).join('');
  document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openProductForm(products.find(p=>String(p.id)===b.dataset.edit)));
  document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>deleteProduct(products.find(p=>String(p.id)===b.dataset.delete)));
}
function renderCategoryRows(){
  if(!categories.length){$('#categoryRows').innerHTML='<tr><td colspan="4" class="admin-empty">Belum ada kategori.</td></tr>';return;}
  $('#categoryRows').innerHTML=categories.map(c=>{
    const count=products.filter(p=>Number(p.category_id)===Number(c.id)).length;
    return `<tr><td><strong>${esc(c.name)}</strong></td><td><code>${esc(c.slug)}</code></td><td>${count} produk</td><td><div class="admin-actions"><button data-cat-edit="${c.id}">Edit</button><button class="danger" data-cat-delete="${c.id}">Hapus</button></div></td></tr>`;
  }).join('');
  document.querySelectorAll('[data-cat-edit]').forEach(b=>b.onclick=()=>openCategoryForm(categories.find(c=>String(c.id)===b.dataset.catEdit)));
  document.querySelectorAll('[data-cat-delete]').forEach(b=>b.onclick=()=>deleteCategory(categories.find(c=>String(c.id)===b.dataset.catDelete)));
}

function openProductForm(p=null){
  $('#productForm').reset(); $('#productId').value=p?.id||''; $('#existingImageUrl').value=p?.image_url||''; $('#existingGalleryUrls').value=JSON.stringify(Array.isArray(p?.gallery_urls)?p.gallery_urls:[]); $('#formTitle').textContent=p?'Edit Produk':'Tambah Produk';
  $('#productName').value=p?.name||''; $('#productCategory').value=p?.category_id||''; $('#productPrice').value=p?.price??''; $('#productMinimum').value=p?.minimum_order||1; $('#productDescription').value=p?.description||''; $('#productActive').checked=p?p.active:true; $('#productFeatured').checked=Boolean(p?.featured); $('#productBestSeller').checked=Boolean(p?.best_seller); $('#productNew').checked=Boolean(p?.is_new); $('#productPromo').checked=Boolean(p?.promo_enabled); $('#productPromoPrice').value=p?.promo_price??''; $('#productPromoStart').value=p?.promo_start||''; $('#productPromoEnd').value=p?.promo_end||''; togglePromoFields(); $('#formMessage').textContent=''; $('#formMessage').className='admin-message';
  if(p?.image_url){$('#imagePreview').src=p.image_url;$('#imagePreviewWrap').hidden=false;}else{$('#imagePreviewWrap').hidden=true;$('#imagePreview').removeAttribute('src');}
  renderGalleryPreview(Array.isArray(p?.gallery_urls)?p.gallery_urls:[]);
  $('#productDialog').showModal();
}
function closeProductForm(){ $('#productDialog').close(); }
function togglePromoFields(){ const on=$('#productPromo').checked; $('#promoFields').hidden=!on; $('#productPromoPrice').required=on; }
function previewFile(){ const f=$('#productImage').files[0]; if(!f)return; if(f.size>5*1024*1024){toast('Foto maksimal 5 MB.','error');$('#productImage').value='';return;} const ok=['image/jpeg','image/png','image/webp'].includes(f.type); if(!ok){toast('Gunakan JPG, PNG, atau WebP.','error');$('#productImage').value='';return;} $('#imagePreview').src=URL.createObjectURL(f);$('#imagePreviewWrap').hidden=false; }
function validateImageFile(file){
  if(file.size>5*1024*1024) throw new Error(`${file.name}: ukuran foto maksimal 5 MB.`);
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error(`${file.name}: gunakan JPG, PNG, atau WebP.`);
}
function renderGalleryPreview(urls=[]){
  const wrap=$('#galleryPreviewWrap'); if(!wrap)return;
  wrap.innerHTML=urls.map((url,i)=>`<figure><img src="${esc(url)}" alt="Galeri ${i+1}"><figcaption>${String(i+1).padStart(2,'0')}</figcaption></figure>`).join('');
  wrap.hidden=!urls.length;
}
function previewGalleryFiles(){
  const files=[...$('#productGallery').files];
  if(files.length>5){toast('Maksimal 5 foto galeri.','error');$('#productGallery').value='';renderGalleryPreview(JSON.parse($('#existingGalleryUrls').value||'[]'));return;}
  try{files.forEach(validateImageFile);}catch(err){toast(err.message,'error');$('#productGallery').value='';return;}
  renderGalleryPreview(files.map(file=>URL.createObjectURL(file)));
}
async function uploadGallery(files, productName){
  if(!files?.length) return JSON.parse($('#existingGalleryUrls').value||'[]');
  const urls=[];
  for(let i=0;i<files.length;i++){
    const file=files[i]; validateImageFile(file);
    const ext=(file.name.split('.').pop()||'jpg').toLowerCase();
    const path=`${Date.now()}-${i+1}-${slugify(productName)||'produk'}.${ext}`;
    const {error}=await db.storage.from('products').upload(path,file,{cacheControl:'3600',upsert:false}); if(error) throw error;
    urls.push(db.storage.from('products').getPublicUrl(path).data.publicUrl);
  }
  return urls;
}
async function uploadImage(file, productName){
  if(!file) return $('#existingImageUrl').value||null;
  if(file.size>5*1024*1024) throw new Error('Ukuran foto maksimal 5 MB.');
  const ext=(file.name.split('.').pop()||'jpg').toLowerCase(); const path=`${Date.now()}-${slugify(productName)||'produk'}.${ext}`;
  const {error}=await db.storage.from('products').upload(path,file,{cacheControl:'3600',upsert:false}); if(error) throw error;
  return db.storage.from('products').getPublicUrl(path).data.publicUrl;
}
async function saveProduct(e){
  e.preventDefault(); const btn=$('#saveProduct'),msg=$('#formMessage'); setBusy(btn,true,'Menyimpan...','Simpan Produk');msg.textContent='';msg.className='admin-message';
  try{
    const name=$('#productName').value.trim(); if(!name) throw new Error('Nama produk wajib diisi.');
    const normalPrice=Number($('#productPrice').value); if(!Number.isFinite(normalPrice)||normalPrice<0) throw new Error('Harga normal tidak valid.');
    const promoEnabled=$('#productPromo').checked; const promoPrice=$('#productPromoPrice').value?Number($('#productPromoPrice').value):null;
    const promoStart=$('#productPromoStart').value||null, promoEnd=$('#productPromoEnd').value||null;
    if(promoEnabled && (!promoPrice || promoPrice>=normalPrice)) throw new Error('Harga promo harus lebih rendah dari harga normal.');
    if(promoEnabled && promoStart && promoEnd && promoEnd<promoStart) throw new Error('Tanggal berakhir promo tidak boleh lebih awal dari tanggal mulai.');
    const imageUrl=await uploadImage($('#productImage').files[0],name);
    const galleryUrls=await uploadGallery([...$('#productGallery').files],name);
    const payload={name,slug:slugify(name),category_id:Number($('#productCategory').value),price:normalPrice,minimum_order:Number($('#productMinimum').value||1),description:$('#productDescription').value.trim(),image_url:imageUrl,gallery_urls:galleryUrls,active:$('#productActive').checked,featured:$('#productFeatured').checked,best_seller:$('#productBestSeller').checked,is_new:$('#productNew').checked,promo_enabled:promoEnabled,promo_price:promoEnabled?promoPrice:null,promo_start:promoEnabled?promoStart:null,promo_end:promoEnabled?promoEnd:null};
    const id=$('#productId').value; const q=id?db.from('products').update(payload).eq('id',id):db.from('products').insert(payload); const {error}=await q; if(error) throw error;
    closeProductForm(); await loadAll(); toast(id?'Produk berhasil diperbarui.':'Produk berhasil ditambahkan.');
  }catch(err){msg.textContent='Gagal menyimpan: '+err.message;msg.classList.add('error');toast(err.message,'error');}
  finally{setBusy(btn,false,'Menyimpan...','Simpan Produk');}
}
async function deleteProduct(p){
  if(!p)return; const ok=await askConfirm({title:'Hapus produk?',message:`Produk “${p.name}” akan dihapus permanen dan tidak dapat dikembalikan.`,confirmText:'Hapus Produk',danger:true}); if(!ok)return;
  const {error}=await db.from('products').delete().eq('id',p.id); if(error){toast('Gagal menghapus: '+error.message,'error');return;} await loadAll();toast('Produk berhasil dihapus.');
}

function openCategoryForm(c=null){
  $('#categoryForm').reset(); $('#categoryId').value=c?.id||''; $('#categoryFormTitle').textContent=c?'Edit Kategori':'Tambah Kategori';
  $('#categoryName').value=c?.name||''; $('#categorySlug').value=c?.slug||''; $('#categorySlug').dataset.auto=c?'off':'on';
  $('#categoryMessage').textContent=''; $('#categoryMessage').className='admin-message'; $('#categoryDialog').showModal();
}
function closeCategoryForm(){ $('#categoryDialog').close(); }
async function saveCategory(e){
  e.preventDefault(); const btn=$('#saveCategory'),msg=$('#categoryMessage'); setBusy(btn,true,'Menyimpan...','Simpan Kategori'); msg.textContent=''; msg.className='admin-message';
  try{
    const payload={name:$('#categoryName').value.trim(),slug:slugify($('#categorySlug').value||$('#categoryName').value)}; const id=$('#categoryId').value;
    const q=id?db.from('categories').update(payload).eq('id',id):db.from('categories').insert(payload); const {error}=await q; if(error) throw error;
    closeCategoryForm(); await loadAll(); toast(id?'Kategori berhasil diperbarui.':'Kategori berhasil ditambahkan.');
  }catch(err){msg.textContent='Gagal menyimpan: '+err.message;msg.classList.add('error');}
  finally{setBusy(btn,false,'Menyimpan...','Simpan Kategori');}
}
async function deleteCategory(c){
  if(!c)return; const count=products.filter(p=>Number(p.category_id)===Number(c.id)).length;
  const warning=count?`Kategori “${c.name}” dipakai oleh ${count} produk. Produk tersebut akan menjadi tanpa kategori.`:`Kategori “${c.name}” akan dihapus permanen.`;
  const ok=await askConfirm({title:'Hapus kategori?',message:warning,confirmText:'Hapus Kategori',danger:true}); if(!ok)return;
  const {error}=await db.from('categories').delete().eq('id',c.id); if(error){toast('Gagal menghapus kategori: '+error.message,'error');return;} await loadAll();toast('Kategori berhasil dihapus.');
}

function renderSettings(){
  const s=settings||{};
  $('#settingBusinessName').value=s.business_name||'Keyrakha Souvenir';
  $('#settingHeroTitle').value=s.hero_title||'';
  $('#settingHeroDescription').value=s.hero_description||'';
  $('#settingAbout').value=s.about||'';
  $('#settingWhatsapp').value=s.whatsapp||'';
  $('#settingWhatsappMessage').value=s.whatsapp_message||'';
  $('#settingEmail').value=s.email||'';
  $('#settingAddress').value=s.address||'';
  $('#settingInstagram').value=s.instagram||'';
  $('#settingTiktok').value=s.tiktok||'';
  $('#settingFacebook').value=s.facebook||'';
  renderThemeSettings(s);
}

function validHex(value){ return /^#[0-9a-fA-F]{6}$/.test(String(value||'').trim()); }
function themeApi(){ return window.KEYRAKHA_THEMES || null; }
function themeIds(){ return ['Primary','Secondary','Accent','Background','Surface','Text','Muted']; }
function themeKey(id){ return id.charAt(0).toLowerCase()+id.slice(1); }
function setThemeInputs(palette){
  themeIds().forEach(id=>{
    const key=themeKey(id), value=palette?.[key] || '#000000';
    const text=$(`#theme${id}`), picker=$(`#theme${id}Picker`);
    if(text) text.value=value.toUpperCase(); if(picker) picker.value=value;
  });
}
function getCustomTheme(){
  const out={name:'Custom'};
  themeIds().forEach(id=>{
    const key=themeKey(id), value=$(`#theme${id}`)?.value.trim();
    if(!validHex(value)) throw new Error(`${id} harus berupa warna HEX, contoh #A85F38.`);
    out[key]=value.toUpperCase();
  });
  return out;
}
function currentThemePalette(){
  const api=themeApi(); if(!api) return null;
  const preset=$('#settingThemePreset')?.value || 'earth-tone';
  if(preset==='custom') return {preset:'custom',...getCustomTheme()};
  const base=api.themes[preset] || api.themes['earth-tone'];
  return {preset,...base};
}
function toggleCustomThemeFields(){
  const custom=$('#settingThemePreset')?.value==='custom';
  const fields=$('#customThemeFields'); if(fields) fields.hidden=!custom;
}
function setThemePreviewStatus(saved=false){
  const el=$('#themePreviewStatus'); if(!el)return;
  el.textContent=saved?'Tema tersimpan':'Preview — belum disimpan';
  el.className=saved?'theme-unsaved theme-preview-status saved':'theme-unsaved theme-preview-status';
}
function renderThemePreview(palette,saved=false){
  const api=themeApi(), preview=$('#themePreview'); if(!api||!preview||!palette)return;
  api.applyThemeToElement(preview,palette);
  const sw=$('#themeSwatches');
  if(sw) sw.innerHTML=['primary','secondary','accent','background','surface','text','muted'].map(k=>`<span class="theme-swatch" title="${k}: ${esc(palette[k])}" style="background:${esc(palette[k])}"></span>`).join('');
  setThemePreviewStatus(saved);
}
function renderThemeSettings(s){
  const api=themeApi(); if(!api)return;
  const preset=s.theme_preset || 'earth-tone';
  $('#settingThemePreset').value=(preset==='custom'||api.themes[preset])?preset:'earth-tone';
  const resolved=api.resolveTheme(s);
  setThemeInputs(resolved);
  toggleCustomThemeFields();
  renderThemePreview(resolved,true);
}
function initThemeManager(){
  const select=$('#settingThemePreset'); if(!select)return;
  select.addEventListener('change',()=>{
    toggleCustomThemeFields();
    if(select.value==='custom'){
      const api=themeApi(); const base=api?.resolveTheme(settings||{}); if(base) setThemeInputs(base);
    }
    setThemePreviewStatus(false);
  });
  $('#previewThemeButton')?.addEventListener('click',()=>{
    try{ renderThemePreview(currentThemePalette(),false); }catch(err){ toast(err.message,'error'); }
  });
  themeIds().forEach(id=>{
    const text=$(`#theme${id}`), picker=$(`#theme${id}Picker`);
    text?.addEventListener('input',()=>{ if(validHex(text.value)) picker.value=text.value; setThemePreviewStatus(false); });
    picker?.addEventListener('input',()=>{ text.value=picker.value.toUpperCase(); setThemePreviewStatus(false); });
  });
}
async function saveSettings(e){
  e.preventDefault(); const btn=$('#saveSettings'),msg=$('#settingsMessage'); setBusy(btn,true,'Menyimpan...','Simpan Pengaturan'); msg.textContent=''; msg.className='admin-message';
  let selectedTheme;
  try { selectedTheme=currentThemePalette(); } catch(err) { msg.textContent=err.message; msg.classList.add('error'); toast(err.message,'error'); setBusy(btn,false,'Menyimpan...','Simpan Pengaturan'); return; }
  const payload={
    business_name:$('#settingBusinessName').value.trim(), hero_title:$('#settingHeroTitle').value.trim(), hero_description:$('#settingHeroDescription').value.trim(), about:$('#settingAbout').value.trim(), whatsapp:$('#settingWhatsapp').value.replace(/\D/g,''), whatsapp_message:$('#settingWhatsappMessage').value.trim(), email:$('#settingEmail').value.trim()||null, address:$('#settingAddress').value.trim(), instagram:$('#settingInstagram').value.trim()||null, tiktok:$('#settingTiktok').value.trim()||null, facebook:$('#settingFacebook').value.trim()||null,
    theme_preset:selectedTheme?.preset||'earth-tone', theme_primary:selectedTheme?.primary||null, theme_secondary:selectedTheme?.secondary||null, theme_accent:selectedTheme?.accent||null, theme_background:selectedTheme?.background||null, theme_surface:selectedTheme?.surface||null, theme_text:selectedTheme?.text||null, theme_muted:selectedTheme?.muted||null
  };
  try{
    const q=settings?.id?db.from('settings').update(payload).eq('id',settings.id):db.from('settings').insert(payload).select().single();
    const {data,error}=await q; if(error) throw error; if(data) settings=data; else settings={...(settings||{}),...payload};
    msg.textContent='Pengaturan berhasil disimpan. Website publik akan memakai data terbaru.'; settings={...(settings||{}),...payload}; renderThemePreview(selectedTheme,true); toast('Pengaturan website berhasil disimpan.');
  }catch(err){msg.textContent='Gagal menyimpan pengaturan: '+err.message;msg.classList.add('error');toast(err.message,'error');}
  finally{setBusy(btn,false,'Menyimpan...','Simpan Pengaturan');}
}

initLogin(); initDashboard();
