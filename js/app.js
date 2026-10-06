const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 10);
});

menuToggle?.addEventListener('click', () => {
  const isOpen = nav?.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
});

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

const DEFAULT_SETTINGS = {
  business_name: 'Keyrakha Souvenir',
  whatsapp: '628561239555',
  instagram: '',
  email: '',
  address: 'Jl. Herbras, Rw. Buntu, Kec. Serpong, Kota Tangerang Selatan, Banten 15318',
  about: 'Keyrakha Souvenir menyediakan berbagai pilihan souvenir dan merchandise custom untuk kebutuhan personal, perusahaan, seminar, wedding, event, dan berbagai acara lainnya.',
  hero_title: 'Hadiah kecil, kesan yang tinggal.',
  hero_description: 'Temukan souvenir dan merchandise custom untuk corporate, wedding, seminar, event, dan momen spesial lainnya.',
  whatsapp_message: 'Halo Keyrakha Souvenir, saya ingin bertanya mengenai produk souvenir.',
  facebook: '',
  tiktok: ''
};

let siteSettings = { ...DEFAULT_SETTINGS };
let supabaseClient = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  const config = window.KEYRAKHA_SUPABASE || {};
  const isPlaceholder = !config.url || !config.publishableKey || config.url.includes('TEMPEL_') || config.publishableKey.includes('TEMPEL_');

  if (isPlaceholder) {
    console.warn('Supabase belum dikonfigurasi. Isi js/supabase-config.js terlebih dahulu.');
    return null;
  }

  if (!window.supabase?.createClient) {
    console.error('Supabase JS gagal dimuat.');
    return null;
  }

  supabaseClient = window.supabase.createClient(config.url, config.publishableKey);
  return supabaseClient;
}

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function formatPhoneDisplay(value) {
  const raw = String(value || '').replace(/\D/g, '');
  if (raw === '628561239555') return '0856-1239-555';
  if (raw.startsWith('62')) return `0${raw.slice(2)}`;
  return value || '';
}

function whatsappUrl(message) {
  const number = String(siteSettings.whatsapp || DEFAULT_SETTINGS.whatsapp).replace(/\D/g, '');
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

function applySettings(settings) {
  siteSettings = { ...DEFAULT_SETTINGS, ...(settings || {}) };

  document.querySelectorAll('[data-wa-link]').forEach(link => {
    const message = link.dataset.waMessage || siteSettings.whatsapp_message || DEFAULT_SETTINGS.whatsapp_message;
    link.href = whatsappUrl(message);
  });

  document.querySelectorAll('[data-wa-number]').forEach(el => {
    el.textContent = formatPhoneDisplay(siteSettings.whatsapp);
  });

  document.querySelectorAll('[data-setting-address]').forEach(el => {
    el.textContent = siteSettings.address || DEFAULT_SETTINGS.address;
  });

  document.querySelectorAll('[data-setting-business-name]').forEach(el => {
    el.textContent = siteSettings.business_name || DEFAULT_SETTINGS.business_name;
  });

  document.querySelectorAll('[data-setting-about]').forEach(el => {
    if (siteSettings.about) el.textContent = siteSettings.about;
  });

  document.querySelectorAll('[data-setting-hero-title]').forEach(el => {
    if (siteSettings.hero_title) el.textContent = siteSettings.hero_title;
  });

  document.querySelectorAll('[data-setting-hero-description]').forEach(el => {
    if (siteSettings.hero_description) el.textContent = siteSettings.hero_description;
  });

  document.querySelectorAll('[data-setting-map]').forEach(el => {
    if (siteSettings.address && el.tagName === 'IFRAME') {
      el.src = `https://www.google.com/maps?q=${encodeURIComponent(siteSettings.address)}&output=embed`;
    }
  });

  document.querySelectorAll('[data-setting-email]').forEach(el => {
    if (siteSettings.email) {
      el.textContent = siteSettings.email;
      if (el.tagName === 'A') el.href = `mailto:${siteSettings.email}`;
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  });

  document.querySelectorAll('[data-setting-instagram]').forEach(el => {
    if (siteSettings.instagram) {
      const raw = siteSettings.instagram.trim();
      const handle = raw.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/\/$/, '');
      el.textContent = `@${handle}`;
      if (el.tagName === 'A') el.href = raw.startsWith('http') ? raw : `https://instagram.com/${handle}`;
      el.hidden = false;
    } else { el.hidden = true; }
  });

  document.querySelectorAll('[data-setting-tiktok]').forEach(el => {
    if (siteSettings.tiktok) {
      const raw = siteSettings.tiktok.trim();
      const handle = raw.replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/i, '').replace(/^@/, '').replace(/\/$/, '');
      el.textContent = `@${handle}`;
      if (el.tagName === 'A') el.href = raw.startsWith('http') ? raw : `https://www.tiktok.com/@${handle}`;
      el.hidden = false;
    } else { el.hidden = true; }
  });

  document.querySelectorAll('[data-setting-facebook]').forEach(el => {
    if (siteSettings.facebook) {
      const raw = siteSettings.facebook.trim();
      el.textContent = raw.startsWith('http') ? 'Facebook' : raw;
      if (el.tagName === 'A') el.href = raw.startsWith('http') ? raw : `https://www.facebook.com/${encodeURIComponent(raw)}`;
      el.hidden = false;
    } else { el.hidden = true; }
  });
}

async function loadSettings() {
  const client = getSupabaseClient();
  if (!client) {
    applySettings(DEFAULT_SETTINGS);
    return;
  }

  const { data, error } = await client
    .from('settings')
    .select('*')
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Gagal memuat settings:', error.message);
    applySettings(DEFAULT_SETTINGS);
    return;
  }

  applySettings(data || DEFAULT_SETTINGS);
}

function productMeta(product) {
  const category = product.categories || {};
  const slug = category.slug || 'lainnya';
  const label = category.name || 'Lainnya';
  const artMap = {
    tumbler: ['tumbler-mock', 'bg-olive', '<span>K</span>'],
    mug: ['mug-mock', 'bg-cream', '<span>K</span>'],
    tas: ['bag-mock', 'bg-clay', '<span>KEYRAKHA</span>'],
    'gift-set': ['gift-mock', 'bg-stone', '<span>FOR YOU</span>'],
    atk: ['notebook-mock', 'bg-gold', '<span>K</span>'],
    lainnya: ['gift-mock', 'bg-smoke', '<span>K</span>']
  };
  const [art, bg, artContent] = artMap[slug] || artMap.lainnya;
  return { slug, label, art, bg, artContent };
}

function isPromoActive(product) {
  if (!product?.promo_enabled || !product?.promo_price) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  if (product.promo_start) { const start = new Date(`${product.promo_start}T00:00:00`); if (today < start) return false; }
  if (product.promo_end) { const end = new Date(`${product.promo_end}T23:59:59`); if (today > end) return false; }
  return true;
}

function productBadges(product) {
  const badges = [];
  if (isPromoActive(product)) badges.push('<span class="product-badge promo">Promo</span>');
  if (product.best_seller) badges.push('<span class="product-badge bestseller">Best Seller</span>');
  if (product.is_new) badges.push('<span class="product-badge new">Baru</span>');
  if (product.featured) badges.push('<span class="product-badge featured">Pilihan</span>');
  return badges.length ? `<div class="product-badge-stack">${badges.join('')}</div>` : '';
}

function productCard(product) {
  const meta = productMeta(product);
  const image = product.image_url
    ? `<img class="real-product-image" src="${product.image_url}" alt="${escapeHtml(product.name)}" loading="lazy">`
    : `<div class="mock-product ${meta.art}">${meta.artContent}</div>`;

  const promo = isPromoActive(product);
  const priceHtml = promo
    ? `<p>Mulai dari <span class="catalog-original-price">${formatRupiah(product.price)}</span> <strong>${formatRupiah(product.promo_price)}</strong></p>`
    : `<p>Mulai dari <strong>${formatRupiah(product.price)}</strong></p>`;
  return `
    <article class="product-card">
      <a class="product-image ${meta.bg}" href="product.html?id=${product.id}" aria-label="Lihat ${escapeHtml(product.name)}">
        ${productBadges(product)}
        ${image}
      </a>
      <div class="product-info">
        <span class="product-category">${escapeHtml(meta.label)}</span>
        <h3><a href="product.html?id=${product.id}">${escapeHtml(product.name)}</a></h3>
        <div class="product-price-row">
          ${priceHtml}
          <span class="product-minimum">Min. ${Number(product.minimum_order || 1)} pcs</span>
        </div>
      </div>
    </article>`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function loadCatalog() {
  const catalogGrid = document.querySelector('#catalogGrid');
  if (!catalogGrid) return;

  const client = getSupabaseClient();
  const searchInput = document.querySelector('#productSearch');
  const sortSelect = document.querySelector('#productSort');
  const chips = [...document.querySelectorAll('.filter-chip')];
  const productCount = document.querySelector('#productCount');
  const emptyState = document.querySelector('#catalogEmpty');
  const resetButton = document.querySelector('#resetCatalog');
  const statusText = document.querySelector('#catalogStatus');

  if (!client) {
    catalogGrid.innerHTML = '<div class="data-notice"><strong>Supabase belum terhubung.</strong><span>Isi Project URL dan Publishable Key di <code>js/supabase-config.js</code>.</span></div>';
    if (productCount) productCount.textContent = '0';
    return;
  }

  if (statusText) statusText.textContent = 'Memuat produk...';

  const [{ data: products, error: productError }, { data: categories, error: categoryError }] = await Promise.all([
    client.from('products').select('id,name,slug,description,price,minimum_order,image_url,featured,best_seller,is_new,promo_enabled,promo_price,promo_start,promo_end,active,created_at,category_id,categories(name,slug)').eq('active', true),
    client.from('categories').select('id,name,slug').order('name')
  ]);

  if (productError || categoryError) {
    console.error(productError || categoryError);
    catalogGrid.innerHTML = '<div class="data-notice error"><strong>Produk belum bisa dimuat.</strong><span>Periksa koneksi Supabase, Data API, dan RLS.</span></div>';
    if (statusText) statusText.textContent = 'Gagal memuat produk.';
    return;
  }

  let catalogProducts = products || [];

  if (categories?.length) {
    chips.filter(chip => chip.dataset.category !== 'all').forEach(chip => chip.remove());
    categories.forEach(category => {
      const button = document.createElement('button');
      button.className = 'filter-chip';
      button.type = 'button';
      button.dataset.category = category.slug;
      button.textContent = category.name;
      document.querySelector('.filter-chips')?.appendChild(button);
      chips.push(button);
    });
  }

  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get('category') || 'all';
  let activeCategory = chips.some(chip => chip.dataset.category === initialCategory) ? initialCategory : 'all';

  const renderProducts = () => {
    const query = searchInput?.value.trim().toLowerCase() || '';
    let visible = catalogProducts.filter(product => {
      const meta = productMeta(product);
      const matchesCategory = activeCategory === 'all' || meta.slug === activeCategory;
      const haystack = `${product.name} ${meta.label} ${product.description || ''}`.toLowerCase();
      return matchesCategory && haystack.includes(query);
    });

    const sort = sortSelect?.value || 'featured';
    visible = [...visible].sort((a, b) => {
      if (sort === 'price-asc') return Number(a.price || 0) - Number(b.price || 0);
      if (sort === 'price-desc') return Number(b.price || 0) - Number(a.price || 0);
      if (sort === 'name') return a.name.localeCompare(b.name, 'id');
      if (sort === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sort === 'bestseller') return Number(Boolean(b.best_seller)) - Number(Boolean(a.best_seller));
      if (sort === 'promo') return Number(isPromoActive(b)) - Number(isPromoActive(a));
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });

    catalogGrid.innerHTML = visible.map(productCard).join('');
    if (productCount) productCount.textContent = visible.length;
    if (emptyState) emptyState.hidden = visible.length !== 0;
    catalogGrid.hidden = visible.length === 0;
    if (statusText) statusText.textContent = '';
  };

  const activateChip = category => {
    activeCategory = category;
    chips.forEach(chip => chip.classList.toggle('active', chip.dataset.category === category));
    const url = new URL(window.location.href);
    if (category === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', category);
    window.history.replaceState({}, '', url);
    renderProducts();
  };

  chips.forEach(chip => chip.addEventListener('click', () => activateChip(chip.dataset.category)));
  searchInput?.addEventListener('input', renderProducts);
  sortSelect?.addEventListener('change', renderProducts);
  resetButton?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'featured';
    activateChip('all');
  });

  activateChip(activeCategory);
}

async function loadHomepageProducts() {
  const grid = document.querySelector('#homepageProductGrid');
  if (!grid) return;
  const client = getSupabaseClient();
  if (!client) return;

  const { data, error } = await client
    .from('products')
    .select('id,name,price,minimum_order,image_url,featured,best_seller,is_new,promo_enabled,promo_price,promo_start,promo_end,category_id,categories(name,slug)')
    .eq('active', true)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(4);

  if (error) {
    console.error('Gagal memuat produk pilihan:', error.message);
    return;
  }

  if (data?.length) grid.innerHTML = data.map(productCard).join('');
}

async function loadProductDetail() {
  const detailRoot = document.querySelector('.product-detail-section');
  if (!detailRoot) return;

  const client = getSupabaseClient();
  if (!client) return;

  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) {
    detailRoot.innerHTML = '<div class="container"><div class="data-notice error"><strong>Produk tidak ditemukan.</strong><span>Kembali ke katalog untuk memilih produk.</span></div></div>';
    return;
  }

  const { data: product, error } = await client
    .from('products')
    .select('id,name,slug,description,price,minimum_order,image_url,featured,best_seller,is_new,promo_enabled,promo_price,promo_start,promo_end,category_id,categories(name,slug)')
    .eq('id', id)
    .eq('active', true)
    .maybeSingle();

  if (error || !product) {
    console.error(error);
    detailRoot.innerHTML = '<div class="container"><div class="data-notice error"><strong>Produk tidak ditemukan.</strong><span>Produk mungkin sedang tidak aktif atau sudah dihapus.</span><a class="text-link" href="products.html">Kembali ke katalog →</a></div></div>';
    return;
  }

  const meta = productMeta(product);
  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  };

  setText('#breadcrumbProduct', product.name);
  setText('#detailCategory', meta.label.toUpperCase());
  setText('#detailName', product.name);
  const promoActive=isPromoActive(product);
  setText('#detailPrice', formatRupiah(promoActive?product.promo_price:product.price));
  const originalPrice=document.querySelector('#detailOriginalPrice');
  if(originalPrice){ originalPrice.hidden=!promoActive; originalPrice.textContent=formatRupiah(product.price); }
  setText('#detailMinimum', `${Number(product.minimum_order || 1)} pcs`);
  setText('#detailDescription', product.description || 'Hubungi Keyrakha untuk informasi detail produk dan opsi custom.');
  setText('#specCategory', meta.label);
  setText('#specMinimum', `${Number(product.minimum_order || 1)} pcs`);
  document.title = `${product.name} — Keyrakha Souvenir`;

  const visual = document.querySelector('#detailVisual');
  if (visual) {
    visual.className = `detail-visual ${meta.bg}`;
    if (product.image_url) {
      visual.innerHTML = `${productBadges(product)}<img class="detail-real-image" src="${product.image_url}" alt="${escapeHtml(product.name)}">`;
    } else {
      visual.innerHTML = `${productBadges(product)}<div class="mock-product ${meta.art}">${meta.artContent}</div>`;
    }
  }

  const wa = document.querySelector('#detailWhatsapp');
  if (wa) {
    wa.href = whatsappUrl(`Halo Keyrakha Souvenir, saya tertarik dengan ${product.name}. Boleh minta informasi lebih lanjut?`);
  }

  const relatedGrid = document.querySelector('#relatedGrid');
  if (relatedGrid && product.category_id) {
    const { data: related } = await client
      .from('products')
      .select('id,name,price,minimum_order,image_url,featured,best_seller,is_new,promo_enabled,promo_price,promo_start,promo_end,category_id,categories(name,slug)')
      .eq('active', true)
      .eq('category_id', product.category_id)
      .neq('id', product.id)
      .limit(3);
    relatedGrid.innerHTML = related?.length ? related.map(productCard).join('') : '<p class="catalog-hint">Belum ada produk terkait pada kategori ini.</p>';
  }
}

async function initializeSite() {
  await loadSettings();
  await Promise.all([
    loadCatalog(),
    loadHomepageProducts(),
    loadProductDetail()
  ]);
}

document.addEventListener('DOMContentLoaded', initializeSite);
