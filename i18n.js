let translations = {};
let currentLang = localStorage.getItem('bizTrackLang') || 'en';

async function loadLanguage(lang) {
  try {
    const res = await fetch(`locales/${lang}.json`);
    translations = await res.json();
    currentLang = lang;
    localStorage.setItem('bizTrackLang', lang);
    document.documentElement.lang = lang;
  } catch (e) {
    console.error('Failed to load language:', e);
  }
}

function t(key) {
  if (translations[key] !== undefined) {
    return translations[key];
  }

  const parts = key.split('.');
  let val = translations;
  for (const part of parts) {
    val = val?.[part];
    if (val === undefined) return key;
  }
  return val;
}

function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val !== undefined) {
      if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
        el.placeholder = val;
      } else if (el.tagName === 'OPTGROUP') {
        el.label = val;
      } else {
        el.textContent = val;
      }
    }
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const val = t(key);
    if (val !== undefined) el.title = val;
  });
}

function reRenderDynamicContent() {
  if (typeof renderProducts === 'function' && typeof products !== 'undefined') renderProducts(products);
  if (typeof renderOrders === 'function' && typeof orders !== 'undefined') renderOrders(orders);
  if (typeof renderTransactions === 'function' && typeof transactions !== 'undefined') renderTransactions(transactions);
  if (typeof renderSummaryCards === 'function') renderSummaryCards();
  if (typeof initializeChart === 'function') initializeChart();
  if (typeof displayRevenue === 'function') displayRevenue();
  if (typeof displayExpenses === 'function') displayExpenses();
}

function selectLanguage(lang) {
  loadLanguage(lang).then(() => {
    translatePage();
    reRenderDynamicContent();
    closeAllLanguageDropdowns();
  });
}

function toggleLanguageDropdown(event) {
  event.preventDefault();
  event.stopPropagation();
  const switcher = event.currentTarget.closest('.language-switcher');
  const dropdown = switcher.querySelector('.language-dropdown');
  const isOpen = dropdown.style.display === 'block';

  closeAllLanguageDropdowns();

  if (!isOpen) {
    dropdown.style.display = 'block';
    switcher.classList.add('open');
  }
}

function closeAllLanguageDropdowns() {
  document.querySelectorAll('.language-dropdown').forEach(d => {
    d.style.display = 'none';
  });
  document.querySelectorAll('.language-switcher').forEach(s => {
    s.classList.remove('open');
  });
}

document.addEventListener('click', function(event) {
  if (!event.target.closest('.language-switcher')) {
    closeAllLanguageDropdowns();
  }
});

function switchLanguage() {
  const newLang = currentLang === 'en' ? 'zh' : 'en';
  selectLanguage(newLang);
}

window.addEventListener('load', async () => {
  await loadLanguage(currentLang);
  translatePage();
  reRenderDynamicContent();
});
