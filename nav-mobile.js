/**
 * Menú móvil — panel lateral fuera del header solo en celular
 */
const MOBILE_NAV_MQ = window.matchMedia('(max-width: 767px)');

function isMobileNav() {
    return MOBILE_NAV_MQ.matches;
}

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

function moveNavToHeader() {
    const nav = document.getElementById('nav-menu');
    const header = document.querySelector('.site-header');
    const searchBar = header?.querySelector('.search-bar');
    if (!nav || !header || nav.parentElement === header) return;

    if (searchBar) {
        header.insertBefore(nav, searchBar);
    } else {
        const toggle = header.querySelector('.menu-toggle');
        if (toggle?.nextElementSibling !== nav) {
            toggle?.insertAdjacentElement('afterend', nav);
        }
    }
}

function moveNavToBody() {
    const nav = document.getElementById('nav-menu');
    if (!nav || nav.parentElement === document.body) return;
    document.body.appendChild(nav);
}

function updateNavPlacement() {
    if (isMobileNav()) {
        moveNavToBody();
    } else {
        setMenuOpen(false);
        moveNavToHeader();
    }
}

function enhanceMobileNav() {
    const nav = document.getElementById('nav-menu');
    if (!nav) return;

    if (!nav.querySelector('.nav-drawer-head')) {
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
    }

    nav.querySelectorAll('.nav-link').forEach(link => {
        if (link.dataset.bound === '1') return;
        link.dataset.bound = '1';
        link.addEventListener('click', () => {
            if (isMobileNav()) setMenuOpen(false);
        });
    });
}

function bindMenuToggle() {
    document.querySelectorAll('.menu-toggle').forEach(btn => {
        if (btn.dataset.bound === '1') return;
        btn.dataset.bound = '1';
        btn.setAttribute('type', 'button');
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
    });
}

function setMenuOpen(open) {
    const nav = document.getElementById('nav-menu');
    const toggle = document.querySelector('.menu-toggle');
    const backdrop = document.getElementById('nav-backdrop');

    if (!isMobileNav()) {
        nav?.classList.remove('active');
        toggle?.classList.remove('active');
        backdrop?.classList.remove('active');
        document.body.classList.remove('nav-open');
        return;
    }

    ensureNavBackdrop();
    const bd = document.getElementById('nav-backdrop');
    const searchInput = document.getElementById('search-input');

    if (nav) nav.classList.toggle('active', open);
    if (toggle) {
        toggle.classList.toggle('active', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    }
    if (bd) {
        bd.classList.toggle('active', open);
        bd.setAttribute('aria-hidden', open ? 'false' : 'true');
    }
    document.body.classList.toggle('nav-open', open);

    if (open && searchInput) searchInput.classList.remove('active');
}

function toggleMenu() {
    if (!isMobileNav()) return;
    const nav = document.getElementById('nav-menu');
    setMenuOpen(!nav?.classList.contains('active'));
}

function initMobileNav() {
    updateNavPlacement();
    enhanceMobileNav();
    bindMenuToggle();
}

window.toggleMenu = toggleMenu;
window.setMenuOpen = setMenuOpen;

document.addEventListener('DOMContentLoaded', initMobileNav);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenuOpen(false);
});

MOBILE_NAV_MQ.addEventListener('change', updateNavPlacement);
window.addEventListener('resize', updateNavPlacement);
