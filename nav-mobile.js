/**
 * Menú móvil — panel lateral tecnológico con overlay
 */
function ensureNavBackdrop() {
    let backdrop = document.getElementById('nav-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'nav-backdrop';
        backdrop.className = 'nav-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');
        backdrop.addEventListener('click', () => setMenuOpen(false));
        document.body.appendChild(backdrop);
    }
    return backdrop;
}

function enhanceMobileNav() {
    const nav = document.getElementById('nav-menu');
    if (!nav || nav.querySelector('.nav-drawer-head')) return;

    const ciudad = document.body.dataset.ciudad || '';
    const head = document.createElement('div');
    head.className = 'nav-drawer-head';
    head.innerHTML = `
        <div class="nav-drawer-brand">
            <span class="pill">Navegación</span>
            <p class="nav-drawer-title">Municipios Edomex</p>
            ${ciudad ? `<p class="nav-drawer-sub">Estás en <strong>${ciudad}</strong></p>` : ''}
        </div>
        <button type="button" class="nav-close" aria-label="Cerrar menú">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>`;

    nav.insertBefore(head, nav.firstChild);
    head.querySelector('.nav-close')?.addEventListener('click', () => setMenuOpen(false));

    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) setMenuOpen(false);
        });
    });
}

function setMenuOpen(open) {
    const nav = document.getElementById('nav-menu');
    const toggle = document.querySelector('.menu-toggle');
    const backdrop = ensureNavBackdrop();
    const searchInput = document.getElementById('search-input');

    if (nav) nav.classList.toggle('active', open);
    if (toggle) {
        toggle.classList.toggle('active', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    backdrop.classList.toggle('active', open);
    backdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('nav-open', open);

    if (open && searchInput) searchInput.classList.remove('active');
}

function toggleMenu() {
    const nav = document.getElementById('nav-menu');
    setMenuOpen(!nav?.classList.contains('active'));
}

window.toggleMenu = toggleMenu;
window.setMenuOpen = setMenuOpen;

document.addEventListener('DOMContentLoaded', () => {
    ensureNavBackdrop();
    enhanceMobileNav();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenuOpen(false);
});
