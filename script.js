function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/[&<>"']/g, function(match) {
        switch (match) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#039;';
            default: return match;
        }
    });
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T12:00:00');
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getPlaceholderImage() {
    return 'https://via.placeholder.com/800x450/0c0e1a/7dd3fc?text=Noticias';
}

let currentIndex = 0;
let autoSlide;
let deferredPrompt;

function alertMessage(message) {
    const tempDiv = document.createElement('div');
    tempDiv.className = 'toast-message';
    tempDiv.textContent = message;
    document.body.appendChild(tempDiv);
    requestAnimationFrame(() => tempDiv.classList.add('visible'));
    setTimeout(() => {
        tempDiv.classList.remove('visible');
        setTimeout(() => tempDiv.remove(), 300);
    }, 3000);
}

async function getNewsData() {
    return fetchNoticias('noticias.json');
}

function buildNewsCard(news, isCarousel) {
    const safeTitle = escapeHtml(news.titulo || 'Noticia');
    const safeResumen = escapeHtml(news.resumen || '');
    const safeAutor = escapeHtml(news.autor || 'Redacción');
    const safeCategoria = escapeHtml((news.categoria || 'general').toUpperCase());
    const safeCiudad = escapeHtml(news.ciudad || '');
    const imgSrc = news.imagen || getPlaceholderImage();
    const fecha = formatDate(news.fecha);

    if (isCarousel) {
        return `
            <div class="carousel-item">
                <img src="${imgSrc}" alt="${safeTitle}" loading="lazy">
                <div class="carousel-overlay"></div>
                <div class="carousel-content">
                    <span class="news-badge">${safeCategoria}</span>
                    ${safeCiudad ? `<span class="news-location">${safeCiudad}</span>` : ''}
                    <h3>${safeTitle}</h3>
                    <p>${safeResumen}</p>
                    <div class="author-info">
                        <span>${fecha ? fecha + ' · ' : ''}Por: ${safeAutor}</span>
                    </div>
                </div>
            </div>`;
    }

    return `
        <div class="news-card">
            <article>
                <div class="news-card-image">
                    <img src="${imgSrc}" alt="${safeTitle}" loading="lazy">
                    <span class="news-badge">${safeCategoria}</span>
                </div>
                <div class="news-card-body">
                    ${fecha ? `<time class="news-date">${fecha}</time>` : ''}
                    <h4>${safeTitle}</h4>
                    <p>${safeResumen}</p>
                    <div class="news-meta">
                        ${safeCiudad ? `<span class="news-location">${safeCiudad}</span>` : ''}
                        <span class="author-info">Por: ${safeAutor}</span>
                    </div>
                    <button class="share-btn" data-title="${safeTitle}">Compartir ↗</button>
                </div>
            </article>
        </div>`;
}

function renderNews(newsList, containerId) {
    const newsContainer = document.getElementById(containerId);
    if (!newsContainer) return;

    if (!newsList.length) {
        newsContainer.innerHTML = '<p class="empty-state">No se encontraron noticias.</p>';
        return;
    }

    const isCarousel = containerId === 'carousel-inner';
    newsContainer.innerHTML = newsList.map(n => buildNewsCard(n, isCarousel)).join('');

    if (!isCarousel) {
        newsContainer.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', () => shareArticle(btn.dataset.title));
        });
    }
}

async function loadNews() {
    try {
        const noticias = await getNewsData();
        const sorted = [...noticias].sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
        renderNews(sorted.slice(0, 9), 'news-container');
    } catch (error) {
        console.error('Error cargando noticias:', error);
        const container = document.getElementById('news-container');
        if (container) container.innerHTML = '<p class="empty-state">Error al cargar noticias. Usa un servidor local.</p>';
    }
}

async function loadCarousel() {
    try {
        const noticias = await getNewsData();
        const destacadas = noticias.filter(n => n.destacada);
        const lista = (destacadas.length ? destacadas : noticias).slice(0, 5);

        renderNews(lista, 'carousel-inner');

        const items = document.querySelectorAll('.carousel-item');
        if (items.length > 0) {
            currentIndex = 0;
            items[0].classList.add('active');
            document.getElementById('carousel-inner').style.transform = 'translateX(0)';
        }

        if (lista.length > 1) {
            clearInterval(autoSlide);
            autoSlide = setInterval(() => moveCarousel(1), 6000);
        }
    } catch (error) {
        console.error('Error cargando carrusel:', error);
    }
}

function moveCarousel(direction) {
    const items = document.querySelectorAll('.carousel-item');
    if (items.length <= 1) return;

    items[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + direction + items.length) % items.length;

    const carouselInner = document.getElementById('carousel-inner');
    if (carouselInner) {
        carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    items[currentIndex].classList.add('active');
}
window.moveCarousel = moveCarousel;

async function searchNews() {
    const searchInput = document.getElementById('search');
    if (!searchInput) return;

    const query = (searchInput.value || '').toLowerCase().trim();
    const noticias = await getNewsData();

    const filtered = noticias.filter(n =>
        (n.titulo || '').toLowerCase().includes(query) ||
        (n.resumen || '').toLowerCase().includes(query) ||
        (n.categoria || '').toLowerCase().includes(query) ||
        (n.ciudad || '').toLowerCase().includes(query)
    );

    renderNews(filtered.slice(0, 12), 'news-container');
    if (query) alertMessage(`${filtered.length} resultado(s) para "${query}"`);
}
window.searchNews = searchNews;

function shareArticle(title) {
    const url = window.location.href;
    const text = `¡Mira esta noticia en México Se Enteré Qué!: ${title}`;
    if (navigator.share) {
        navigator.share({ title, text, url }).catch(() => {});
    } else {
        navigator.clipboard.writeText(url).then(() => {
            alertMessage('Enlace copiado al portapapeles');
        }).catch(() => alertMessage('Copia este enlace: ' + url));
    }
}
window.shareArticle = shareArticle;

function toggleMenu() {
    if (typeof setMenuOpen === 'function') {
        const nav = document.getElementById('nav-menu');
        setMenuOpen(!nav?.classList.contains('active'));
        return;
    }
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
window.toggleMenu = toggleMenu;

function toggleSearch() {
    const searchInputContainer = document.getElementById('search-input');
    const navMenu = document.getElementById('nav-menu');

    if (searchInputContainer) {
        searchInputContainer.classList.toggle('active');
        if (typeof setMenuOpen === 'function') {
            setMenuOpen(false);
        } else if (navMenu) {
            navMenu.classList.remove('active');
            document.querySelector('.menu-toggle')?.classList.remove('active');
        }

        const searchInput = document.getElementById('search');
        if (searchInputContainer.classList.contains('active') && searchInput) {
            searchInput.focus();
        }
    }
}
window.toggleSearch = toggleSearch;

function openCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'block';
}
window.openCookieBanner = openCookieBanner;

function hideCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'none';
}

function isPWAInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           window.matchMedia('(display-mode: minimal-ui)').matches;
}

function checkAppModalVisibility() {
    const appModal = document.getElementById('app-modal');
    if (!appModal) return;

    const dismissed = sessionStorage.getItem('app-modal-dismissed');
    if (isPWAInstalled() || dismissed) {
        appModal.style.display = 'none';
    } else {
        appModal.style.display = 'flex';
    }
}

function hideAppModal() {
    const appModal = document.getElementById('app-modal');
    if (appModal) {
        appModal.style.display = 'none';
        sessionStorage.setItem('app-modal-dismissed', '1');
    }
}
window.hideAppModal = hideAppModal;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

function installPWA(e) {
    e.preventDefault();
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            alertMessage(choiceResult.outcome === 'accepted' ? '¡Gracias por instalar la app!' : 'Instalación cancelada.');
            deferredPrompt = null;
            hideAppModal();
        });
    } else {
        alertMessage('Usa el menú del navegador → "Añadir a pantalla de inicio".');
    }
}
window.installPWA = installPWA;

document.addEventListener('DOMContentLoaded', () => {
    checkAppModalVisibility();
    loadNews();
    loadCarousel();

    const consent = localStorage.getItem('cookies-consent');
    const acceptBtn = document.getElementById('accept-cookies');
    const rejectBtn = document.getElementById('reject-cookies');

    if (!consent) {
        setTimeout(openCookieBanner, 1500);
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookies-consent', 'accepted');
            hideCookieBanner();
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            localStorage.setItem('cookies-consent', 'rejected');
            hideCookieBanner();
        });
    }

    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') searchNews();
        });
    }
});
