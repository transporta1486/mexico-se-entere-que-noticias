const LOGO_SVG = `<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" stroke="url(#lg)" stroke-width="1.5"/><path d="M10 16h12M16 10v12" stroke="url(#lg)" stroke-width="1.5" stroke-linecap="round"/><defs><linearGradient id="lg" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#7dd3fc"/><stop offset="1" stop-color="#c4b5fd"/></linearGradient></defs></svg>`;

const NAV_ITEMS = [
    { href: 'index.html', label: 'Inicio', key: 'inicio' },
    { href: 'atizapan.html', label: 'Atizapán', key: 'atizapan' },
    { href: 'tlalnepantla.html', label: 'Tlalnepantla', key: 'tlalnepantla' },
    { href: 'naucalpan.html', label: 'Naucalpan', key: 'naucalpan' },
    { href: 'nicolas-romero.html', label: 'N. Romero', key: 'nicolas-romero' },
    { href: 'cuatitlan-izcalli.html', label: 'Izcalli', key: 'cuatitlan-izcalli' }
];

function buildNav(activeKey) {
    return NAV_ITEMS.map(item =>
        `<li><a href="${item.href}" class="nav-link${item.key === activeKey ? ' active' : ''}">${item.label}</a></li>`
    ).join('');
}

function buildSiteHeader(activeKey, searchPlaceholder) {
    return `
    <header class="site-header">
      <a href="index.html" class="logo">
        <span class="logo-mark" aria-hidden="true">${LOGO_SVG}</span>
        <div class="logo-text">
          <span class="logo-tag">Noticias · Edomex</span>
          <h1>México Se Enteré Qué</h1>
        </div>
      </a>
      <button class="menu-toggle" aria-label="Abrir menú" onclick="toggleMenu()">
        <span></span><span></span><span></span>
      </button>
      <nav id="nav-menu">
        <ul>${buildNav(activeKey)}</ul>
      </nav>
      <div class="search-bar">
        <button class="search-toggle" aria-label="Mostrar búsqueda" onclick="toggleSearch()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </button>
        <div class="search-input" id="search-input">
          <input type="text" id="search" placeholder="${searchPlaceholder}" />
          <button onclick="searchNews()">Buscar</button>
        </div>
      </div>
    </header>`;
}

function buildTicker(cityLabel) {
    return `
    <div class="ticker-bar">
      <span class="live-dot"></span>
      <span class="ticker-label">En vivo · ${cityLabel}</span>
      <div class="ticker-track">
        <span>Atizapán · Naucalpan · Tlalnepantla · Nicolás Romero · Cuautitlán Izcalli</span>
        <span>Atizapán · Naucalpan · Tlalnepantla · Nicolás Romero · Cuautitlán Izcalli</span>
      </div>
    </div>`;
}

function buildSiteFooter() {
    return `
    <footer class="site-footer">
      <div class="footer-brand">
        <span class="logo-mark small" aria-hidden="true">${LOGO_SVG.replace('id="lg"', 'id="lgf"')}</span>
        <p>&copy; 2026 México Se Enteré Qué</p>
      </div>
      <p class="admin-link"><a href="admin/">Panel de redacción</a></p>
      <div class="social-links">
        <a href="#">Facebook</a>
        <a href="#">Twitter</a>
        <a href="#">Instagram</a>
      </div>
      <div class="legal-links">
        <a href="privacidad.html">Privacidad</a>
        <a href="terminos.html">Términos</a>
        <a href="cookies.html">Cookies</a>
      </div>
    </footer>`;
}

function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    const searchInputContainer = document.getElementById('search-input');
    if (navMenu && menuToggle) {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        if (window.innerWidth < 768 && searchInputContainer) {
            searchInputContainer.classList.remove('active');
        }
    }
}

function toggleSearch() {
    const searchInputContainer = document.getElementById('search-input');
    const navMenu = document.getElementById('nav-menu');
    if (searchInputContainer) {
        searchInputContainer.classList.toggle('active');
        if (navMenu) navMenu.classList.remove('active');
        const searchInput = document.getElementById('search');
        if (searchInputContainer.classList.contains('active') && searchInput) {
            searchInput.focus();
        }
    }
}

function shareArticle(title) {
    const url = window.location.href;
    const text = `¡Mira esta noticia en México Se Enteré Qué!: ${title}`;
    if (navigator.share) {
        navigator.share({ title, text, url }).catch(() => {});
    } else {
        alert(`Comparte este enlace: ${url}`);
    }
}

window.toggleMenu = toggleMenu;
window.toggleSearch = toggleSearch;
window.shareArticle = shareArticle;
window.buildSiteHeader = buildSiteHeader;
window.buildTicker = buildTicker;
window.buildSiteFooter = buildSiteFooter;

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    if (searchInput && typeof searchNews === 'function') {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') searchNews();
        });
    }
});
