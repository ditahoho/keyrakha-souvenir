(function () {
  const themes = {
    'earth-tone': { name: 'Earth Tone', primary: '#55624A', secondary: '#7B6B57', accent: '#A85F38', background: '#FAF7F2', surface: '#E8E1D8', text: '#29201C', muted: '#766B61' },
    'neutral-tone': { name: 'Neutral Tone', primary: '#66635F', secondary: '#8C8984', accent: '#A39688', background: '#F7F6F3', surface: '#E8E6E1', text: '#292826', muted: '#74716C' },
    'warm-tone': { name: 'Warm Tone', primary: '#9B5B3F', secondary: '#C17F59', accent: '#D8A15D', background: '#FFF7EE', surface: '#F2E0D2', text: '#3A241B', muted: '#87685A' },
    'cool-tone': { name: 'Cool Tone', primary: '#466A78', secondary: '#6E8791', accent: '#7FA6B8', background: '#F3F8FA', surface: '#DCE8EC', text: '#20333B', muted: '#61747B' },
    'pastel': { name: 'Pastel', primary: '#9CAFC3', secondary: '#B8A6C9', accent: '#D9A6B0', background: '#FFF9FA', surface: '#F0E6EE', text: '#40383E', muted: '#837782' },
    'muted-tone': { name: 'Muted Tone', primary: '#69776C', secondary: '#8D8276', accent: '#A77D68', background: '#F5F2ED', surface: '#E5DED6', text: '#34312D', muted: '#77716B' },
    'jewel-tone': { name: 'Jewel Tone', primary: '#145A52', secondary: '#513B73', accent: '#A36720', background: '#F8F5F0', surface: '#E2DDD7', text: '#211B26', muted: '#6A606D' },
    'nude-tone': { name: 'Nude Tone', primary: '#A97C6B', secondary: '#C3A698', accent: '#D4B39C', background: '#FCF6F1', surface: '#EEE0D8', text: '#44332D', muted: '#8C766D' },
    'autumn-tone': { name: 'Autumn Tone', primary: '#6E5A35', secondary: '#8C5D3E', accent: '#B86D35', background: '#FBF4E8', surface: '#E8D7BC', text: '#352619', muted: '#786553' },
    'spring-tone': { name: 'Spring Tone', primary: '#648A5E', secondary: '#8EAD74', accent: '#E09D78', background: '#FBFFF8', surface: '#E3EED9', text: '#2D3A2B', muted: '#70806D' },
    'summer-tone': { name: 'Summer Tone', primary: '#5F8392', secondary: '#8BA7AE', accent: '#D9A0A7', background: '#F8FCFD', surface: '#E2EEF1', text: '#283A40', muted: '#71848A' },
    'winter-tone': { name: 'Winter Tone', primary: '#364A68', secondary: '#65758D', accent: '#9D3458', background: '#F7F9FC', surface: '#E2E7EF', text: '#1F2938', muted: '#687386' },
    'coastal': { name: 'Coastal', primary: '#3D7482', secondary: '#81A8AE', accent: '#D1A975', background: '#F7FCFC', surface: '#DFEEEE', text: '#253A3F', muted: '#668085' },
    'tropical': { name: 'Tropical', primary: '#18735F', secondary: '#54A46C', accent: '#E47A4B', background: '#F7FFF9', surface: '#DCEFE1', text: '#153C31', muted: '#5E7B70' },
    'vintage': { name: 'Vintage', primary: '#6F654B', secondary: '#9B7B61', accent: '#B86D55', background: '#F7F0E4', surface: '#E3D4BF', text: '#382F27', muted: '#776B60' },
    'retro': { name: 'Retro', primary: '#467B74', secondary: '#D38A3E', accent: '#C85B45', background: '#FFF7E1', surface: '#EFD8A7', text: '#3C3028', muted: '#7C695B' },
    'boho': { name: 'Boho', primary: '#6B6546', secondary: '#9B725C', accent: '#C7774F', background: '#FAF3E6', surface: '#E8D8C1', text: '#3B3027', muted: '#796B5E' },
    'scandinavian': { name: 'Scandinavian', primary: '#60716B', secondary: '#8B9692', accent: '#B88565', background: '#FBFBF8', surface: '#E9E9E3', text: '#292D2C', muted: '#727B78' },
    'dark-moody': { name: 'Dark / Moody', primary: '#7B8A72', secondary: '#9B8171', accent: '#C48A5A', background: '#1D1C1A', surface: '#302E2A', text: '#F4EFE8', muted: '#B2AAA0' },
    'luxury': { name: 'Luxury', primary: '#1F3B36', secondary: '#654B38', accent: '#C2A15F', background: '#FBF8F1', surface: '#E8E0D1', text: '#1B1916', muted: '#766D61' },
    'monochrome': { name: 'Monochrome', primary: '#2F2F2F', secondary: '#666666', accent: '#929292', background: '#FAFAFA', surface: '#E9E9E9', text: '#171717', muted: '#707070' },
    'sage': { name: 'Sage', primary: '#65725C', secondary: '#8C9A80', accent: '#B89A72', background: '#F8FAF4', surface: '#E2E8D9', text: '#2D332A', muted: '#747D6E' },
    'terracotta': { name: 'Terracotta', primary: '#8A5140', secondary: '#B76B50', accent: '#D79A6C', background: '#FFF7F1', surface: '#F0D9CC', text: '#3B2922', muted: '#856A5E' },
    'ocean': { name: 'Ocean', primary: '#185C70', secondary: '#3E8194', accent: '#D1A46F', background: '#F4FBFC', surface: '#DCECF0', text: '#173640', muted: '#5D7B83' },
    'forest': { name: 'Forest', primary: '#2F5B46', secondary: '#55725B', accent: '#A47B4B', background: '#F7FAF6', surface: '#DFE8DD', text: '#243429', muted: '#647568' },
    'desert': { name: 'Desert', primary: '#87664B', secondary: '#B28B68', accent: '#D39A5E', background: '#FCF5E8', surface: '#EAD9BD', text: '#3D3025', muted: '#806F60' },
    'rustic': { name: 'Rustic', primary: '#67563E', secondary: '#8B6B50', accent: '#A95F3E', background: '#F6EFE5', surface: '#E0D1BE', text: '#342A22', muted: '#74675B' },
    'romantic': { name: 'Romantic', primary: '#9A6774', secondary: '#BE8E98', accent: '#D2A18F', background: '#FFF8F9', surface: '#F0E0E4', text: '#452F36', muted: '#886D75' },
    'minimalist': { name: 'Minimalist', primary: '#454545', secondary: '#77736D', accent: '#A28870', background: '#FEFDFB', surface: '#EEECE8', text: '#202020', muted: '#77736D' },
    'candy': { name: 'Candy', primary: '#A9508E', secondary: '#5E9DC9', accent: '#EF8C70', background: '#FFF8FC', surface: '#F5E1EE', text: '#482A40', muted: '#886B82' },
    'neon': { name: 'Neon', primary: '#14A86B', secondary: '#5D45D9', accent: '#E53783', background: '#111318', surface: '#20232A', text: '#F5F7FA', muted: '#A8AFBB' },
    'metallic': { name: 'Metallic', primary: '#5F6469', secondary: '#8A7A68', accent: '#B89555', background: '#F7F7F5', surface: '#E1E2E2', text: '#282A2C', muted: '#74787C' },
    'floral': { name: 'Floral', primary: '#627858', secondary: '#9B6C7F', accent: '#D18C7F', background: '#FFF9F7', surface: '#EFE4E2', text: '#3D3033', muted: '#817176' },
    'sunset': { name: 'Sunset', primary: '#9B4C4C', secondary: '#D26B4D', accent: '#E6A24F', background: '#FFF7F0', surface: '#F4D8C7', text: '#462B28', muted: '#8C6A62' },
    'soft-tone': { name: 'Soft Tone', primary: '#7D8B86', secondary: '#A2949B', accent: '#B89582', background: '#FAF9F7', surface: '#EAE6E3', text: '#393638', muted: '#7D777A' },
    'dusty-tone': { name: 'Dusty Tone', primary: '#6F7D76', secondary: '#937E86', accent: '#A87969', background: '#F7F4F2', surface: '#E5DEDD', text: '#383334', muted: '#7A7073' },
    'creamy-tone': { name: 'Creamy Tone', primary: '#786852', secondary: '#A2927D', accent: '#C18B61', background: '#FFF9EE', surface: '#EEE3D2', text: '#3C3329', muted: '#807466' },
    'natural-tone': { name: 'Natural Tone', primary: '#5D6A50', secondary: '#82755E', accent: '#A7704C', background: '#F9F6EF', surface: '#E5DDCF', text: '#332F27', muted: '#746D61' },
    'bold-tone': { name: 'Bold Tone', primary: '#244E47', secondary: '#7A3558', accent: '#D36B3D', background: '#FFF9F4', surface: '#EDE1D9', text: '#261E20', muted: '#74666A' },
    'vibrant-tone': { name: 'Vibrant Tone', primary: '#0E7D6D', secondary: '#5963C5', accent: '#E46845', background: '#FFFBF6', surface: '#E8E4F1', text: '#242331', muted: '#706F7E' }
  };

  function resolveTheme(settings = {}) {
    const preset = settings.theme_preset || 'earth-tone';
    const base = themes[preset] || themes['earth-tone'];
    if (preset !== 'custom') return { preset, ...base };
    return {
      preset: 'custom',
      name: 'Custom',
      primary: settings.theme_primary || themes['earth-tone'].primary,
      secondary: settings.theme_secondary || themes['earth-tone'].secondary,
      accent: settings.theme_accent || themes['earth-tone'].accent,
      background: settings.theme_background || themes['earth-tone'].background,
      surface: settings.theme_surface || themes['earth-tone'].surface,
      text: settings.theme_text || themes['earth-tone'].text,
      muted: settings.theme_muted || themes['earth-tone'].muted
    };
  }

  function applyThemeToElement(el, palette) {
    if (!el || !palette) return;
    el.style.setProperty('--ink', palette.text);
    el.style.setProperty('--muted', palette.muted);
    el.style.setProperty('--paper', palette.background);
    el.style.setProperty('--paper-2', palette.surface);
    el.style.setProperty('--green', palette.primary);
    el.style.setProperty('--green-2', palette.secondary);
    el.style.setProperty('--accent', palette.accent);
    el.style.setProperty('--line', `color-mix(in srgb, ${palette.text} 14%, transparent)`);
  }

  window.KEYRAKHA_THEMES = { themes, resolveTheme, applyThemeToElement };
})();
