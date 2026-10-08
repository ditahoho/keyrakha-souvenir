/* V18 public-only localization; CMS-entered product content is never auto-translated. */
(() => {
  const dict = {
    'Beranda':'Home','Produk':'Products','Tentang Kami':'About Us','Kontak':'Contact','Konsultasi':'Consultation',
    'Lihat Semua Produk':'View All Products','Lihat Semua':'View All','Produk Pilihan':'Featured Products',
    'Lihat Produk':'Browse Products','Hubungi Kami':'Contact Us','Katalog Produk':'Product Catalog',
    'Cari Produk':'Search Products','Cari produk...':'Search products...',
    'Kategori':'Category','Semua Kategori':'All Categories','Semua Produk':'All Products',
    'Produk Terbaru':'Latest Products','Produk Unggulan':'Featured Products','Produk Baru':'New Arrivals',
    'Best Seller':'Best Seller','Baru':'New','Pilihan':'Featured','Promo':'Sale',
    'Mulai dari':'Starting at','Tentang Keyrakha':'About Keyrakha','Kirim Pesan':'Send Message',
    'Nama':'Name','Email':'Email','Pesan':'Message','Alamat':'Address',
    'Hubungi Kami Sekarang':'Contact Us Now','Selengkapnya':'Learn More',
    'Produk akan segera hadir.':'Products coming soon.',
    'Produk belum dapat dimuat. Silakan coba lagi.':'Products could not be loaded. Please try again.',
    'Katalog belum terhubung. Silakan coba lagi nanti.':'Catalog is not connected. Please try again later.',
    'Kembali ke Produk':'Back to Products','Kembali':'Back','Jumlah Minimum':'Minimum Order',
    'Semua':'All','Harga':'Price','Urutkan':'Sort by','Cari':'Search',
    'Lihat Detail':'View Details','Min.':'Min.'
  };
  const original = new WeakMap();
  const exclude = 'script,style,noscript,textarea,[contenteditable],.product-info h3,.product-category,[data-setting-hero-title],[data-setting-hero-description],[data-setting-about],.product-detail-section [data-product-name]';
  function translate(root=document) {
    const lang = document.documentElement.lang === 'en' ? 'en' : 'id';
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      const parent=node.parentElement;
      if(!parent || parent.closest(exclude))return;
      if(!original.has(node))original.set(node,node.nodeValue);
      const raw=original.get(node), trimmed=raw.trim();
      if(!dict[trimmed])return;
      node.nodeValue=lang==='en'?raw.replace(trimmed,dict[trimmed]):raw;
    });
    document.querySelectorAll('[data-lang-choice]').forEach(btn=>btn.setAttribute('aria-current',String(btn.dataset.langChoice===lang)));
  }
  const toggle=document.querySelector('.language-toggle'), options=document.querySelector('.language-options');
  function close(){if(options)options.hidden=true;toggle?.setAttribute('aria-expanded','false')}
  toggle?.addEventListener('click',()=>{options.hidden=!options.hidden;toggle.setAttribute('aria-expanded',String(!options.hidden))});
  document.querySelectorAll('[data-lang-choice]').forEach(button=>button.addEventListener('click',()=>{
    const lang=button.dataset.langChoice;
    document.documentElement.lang=lang;
    try{localStorage.setItem('keyrakha-language',lang)}catch(e){}
    document.querySelector('.language-flag').textContent=lang==='en'?'🇬🇧':'🇮🇩';
    document.querySelector('.language-code').textContent=lang.toUpperCase();
    translate();close();
  }));
  document.addEventListener('click',e=>{if(!e.target.closest('.language-menu'))close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  const lang=document.documentElement.lang==='en'?'en':'id';
  const flag=document.querySelector('.language-flag'),code=document.querySelector('.language-code');
  if(flag)flag.textContent=lang==='en'?'🇬🇧':'🇮🇩';if(code)code.textContent=lang.toUpperCase();
  const themeButton=document.querySelector('.appearance-toggle');
  function updateThemeLabel(){if(themeButton)themeButton.setAttribute('aria-label',document.documentElement.dataset.appearance==='dark'?'Aktifkan mode terang':'Aktifkan mode gelap')}
  themeButton?.addEventListener('click',()=>{
    const mode=document.documentElement.dataset.appearance==='dark'?'light':'dark';
    document.documentElement.dataset.appearance=mode;
    try{localStorage.setItem('keyrakha-appearance',mode)}catch(e){}
    updateThemeLabel();
  });
  updateThemeLabel();translate();
  document.addEventListener('keyrakha:products-rendered',()=>translate(document.querySelector('#homepageProductGrid')||document));
})();
