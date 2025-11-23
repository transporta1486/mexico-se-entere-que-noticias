// Funciones para escapar caracteres especiales de una cadena HTML
function escapeHtml(text) {
    if (typeof text !== 'string') return ''; // Manejar valores no string
    return text.replace(/[&<>"']/g, function(match) {
        switch (match) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#039;';
            default: return match; // Debería cubrir todos los casos
        }
    });
}

// --- Variables Globales (Para Carrusel) ---
let currentIndex = 0;
let autoSlide;

// --- Funciones de Utilidad ---

/**
 * Función auxiliar para mostrar un mensaje temporal al usuario sin usar alert().
 */
function alertMessage(message) {
    console.warn("Mensaje para el usuario:", message);
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = 'position: fixed; bottom: 50px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 10px 20px; border-radius: 5px; z-index: 2000; box-shadow: 0 4px 8px rgba(0,0,0,0.2); opacity: 0; transition: opacity 0.3s;';
    tempDiv.textContent = message;
    document.body.appendChild(tempDiv);
    
    // Animación de entrada
    setTimeout(() => {
        tempDiv.style.opacity = 1;
    }, 10);
    
    // Animación de salida después de 3 segundos
    setTimeout(() => {
        tempDiv.style.opacity = 0;
        setTimeout(() => {
            document.body.removeChild(tempDiv);
        }, 300);
    }, 3000);
}

// --- Carga de JSON y Renderizado ---

async function getNewsData() {
    try {
        const response = await fetch('noticias.json');
        if (!response.ok) throw new Error('No se encontró noticias.json');
        const data = await response.json();
        return data.noticias_list || [];
    } catch (e) {
        console.error('Error cargando noticias:', e);
        return [];
    }
}

function renderNews(newsList, containerId) {
    const newsContainer = document.getElementById(containerId);
    if (!newsContainer) return;

    if (!newsList.length) {
        newsContainer.innerHTML = '<p>No hay noticias disponibles.</p>';
        return;
    }

    newsContainer.innerHTML = '';
    newsList.forEach(news => {
        const safeTitle = escapeHtml(news.titulo || 'Noticia');
        const isCarousel = containerId === 'carousel-inner';
        const logoUrl = isCarousel ? (news.logo_horizontal || 'https://via.placeholder.com/50x50?text=Logo') : (news.logo_cuadrado || 'https://via.placeholder.com/50x50?text=Logo');

        const articleContent = isCarousel ? `
            <img src="${news.imagen || 'https://via.placeholder.com/800x400?text=Imagen+No+Disponible'}" alt="${safeTitle}">
            <div class="carousel-content">
                <h3>${safeTitle}</h3>
                <p>${escapeHtml(news.resumen)}</p>
                <div class="author-info">
                    <img src="${logoUrl}" alt="Logo del autor" class="author-logo-horizontal">
                    <span>Por: ${escapeHtml(news.autor || 'Redacción')}</span>
                </div>
                <button class="share-btn" onclick="shareArticle('${safeTitle}')">Compartir</button>
            </div>
        ` : `
            <img src="${news.imagen || 'https://via.placeholder.com/800x400?text=Imagen+No+Disponible'}" alt="${safeTitle}">
            <h4>${safeTitle}</h4>
            <p>${escapeHtml(news.resumen)}</p>
            <div class="author-info">
                <img src="${logoUrl}" alt="Logo del autor" class="author-logo">
                <span>Por: ${escapeHtml(news.autor || 'Redacción')}</span>
            </div>
            <button class="share-btn" onclick="shareArticle('${safeTitle}')">Compartir</button>
        `;

        const tag = isCarousel ? 'div' : 'article';
        const classNames = isCarousel ? 'carousel-item' : '';

        newsContainer.innerHTML += `<${tag} class="${classNames}">${articleContent}</${tag}>`;
    });
}

async function loadNews() {
    const noticias = await getNewsData();
    renderNews(noticias.slice(0, 6), 'news-container');
}

async function loadCarousel() {
    const noticias = await getNewsData();
    const destacadas = noticias.filter(n => n.destacada);
    const lista = destacadas.length ? destacadas : noticias.slice(0, 3);
    
    renderNews(lista, 'carousel-inner');

    // Muestra el primer elemento y habilita el carrusel
    const firstItem = document.querySelector('.carousel-item');
    if (firstItem) {
        firstItem.classList.add('active');
    }

    if (lista.length > 1) {
        clearInterval(autoSlide);
        autoSlide = setInterval(() => moveCarousel(1), 5000);
    }
}

// --- Carrusel Control ---

function moveCarousel(direction) {
    const items = document.querySelectorAll('.carousel-item');
    if (items.length <= 1) return;
    
    // Quita 'active' del elemento actual
    items[currentIndex].classList.remove('active');

    // Calcula el nuevo índice
    currentIndex = (currentIndex + direction + items.length) % items.length;
    
    // Mueve la vista con CSS (si usas translateX) o añade 'active'
    const carouselInner = document.querySelector('.carousel-inner');
    if (carouselInner) {
        carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    
    // Añade 'active' al nuevo elemento
    items[currentIndex].classList.add('active');
}
window.moveCarousel = moveCarousel; // Hacer accesible globalmente

// --- Búsqueda ---

async function searchNews() {
    const searchInput = document.getElementById('search');
    const newsContainer = document.getElementById('news-container');
    const query = (searchInput.value || '').toLowerCase();
    
    if (!newsContainer) return;
    
    const noticias = await getNewsData();
    
    const filteredNews = noticias
        .filter(n => (n.titulo || '').toLowerCase().includes(query) || (n.resumen || '').toLowerCase().includes(query));
    
    if (filteredNews.length === 0) {
        newsContainer.innerHTML = `<p>No se encontraron resultados para "${escapeHtml(query)}".</p>`;
        return;
    }
    
    renderNews(filteredNews.slice(0, 6), 'news-container');
    alertMessage(`Resultados de búsqueda cargados para: ${escapeHtml(query)}`);
}
window.searchNews = searchNews; // Hacer accesible globalmente

// --- Compartir ---
function shareArticle(title) {
    const url = window.location.href;
    const text = `¡Mira esta noticia en México Se Enteré Qué!: ${title}`;
    if (navigator.share) {
        navigator.share({ title, text, url }).catch(() => {});
    } else {
        alertMessage(`Comparte este enlace: ${url}`);
    }
}
window.shareArticle = shareArticle; // Hacer accesible globalmente

// --- Menú / Búsqueda (UI) ---

function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    if (navMenu && menuToggle) {
        navMenu.classList.toggle('active'); // Usar 'active' en lugar de 'open' para consistencia con el código original
        menuToggle.classList.toggle('active');
        
        // Cierra la búsqueda si el menú se abre (limpieza de UI en móvil)
        const searchInputContainer = document.getElementById('search-input');
        if (window.innerWidth < 768 && searchInputContainer) {
            searchInputContainer.classList.remove('active'); // Usar 'active' en lugar de 'visible'
        }
    }
}
window.toggleMenu = toggleMenu; // Hacer accesible globalmente

function toggleSearch() {
    const searchInputContainer = document.getElementById('search-input');
    if (searchInputContainer) {
        searchInputContainer.classList.toggle('active'); // Usar 'active' en lugar de 'visible'
        
        // Cierra el menú si la búsqueda se abre
        const navMenu = document.getElementById('nav-menu');
        if (navMenu) {
            navMenu.classList.remove('active');
        }
        
        // Enfoca el input de búsqueda si se hace visible
        const searchInput = document.getElementById('search');
        if (searchInputContainer.classList.contains('active') && searchInput) {
            searchInput.focus();
        }
    }
}
window.toggleSearch = toggleSearch; // Hacer accesible globalmente

// --- Cookies y AdSense ---

function openCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'block';
}

function hideCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'none';
}

function loadAdSense() {
    if (document.getElementById('adsbygoogle-js')) return;
    const s = document.createElement('script');
    s.id = 'adsbygoogle-js';
    s.async = true;
    // **RECUERDA CAMBIAR ESTO POR TU ID DE ADSENSE REAL**
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX';
    s.crossOrigin = 'anonymous';
    s.onload = () => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) { console.warn('No se pudo inicializar anuncios:', e); }
    };
    document.head.appendChild(s);
}

// --- Modal de la App ---
function showAppModal() {
    const appModal = document.getElementById('app-modal');
    if (appModal && !localStorage.getItem('app-modal-seen')) {
        setTimeout(() => {
            appModal.style.display = 'flex';
            // Para fines de prueba, puedes comentar la siguiente línea
            localStorage.setItem('app-modal-seen', 'true'); 
        }, 2000);
    }
}

function hideAppModal() {
    const appModal = document.getElementById('app-modal');
    if (appModal) appModal.style.display = 'none';
}
window.hideAppModal = hideAppModal; // Hacer accesible globalmente para el botón de cerrar

// --- Evento Principal (Unificado) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Carga de Contenido
    loadNews();
    loadCarousel();

    // 2. Lógica de Cookies
    const consent = localStorage.getItem('cookies-consent');
    const acceptBtn = document.getElementById('accept-cookies');
    const rejectBtn = document.getElementById('reject-cookies');

    if (!consent) {
        openCookieBanner();
    } else {
        if (consent === 'accepted') {
            loadAdSense();
        }
        showAppModal();
    }

    // 3. Manejadores de eventos de botones de Cookies
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookies-consent', 'accepted');
            hideCookieBanner();
            loadAdSense();
            showAppModal();
            alertMessage('Cookies aceptadas. ¡Gracias!');
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            localStorage.setItem('cookies-consent', 'rejected');
            hideCookieBanner();
            showAppModal();
            alertMessage('Cookies rechazadas.');
        });
    }
    
    // 4. Manejador de Evento para el botón de búsqueda
    const searchButton = document.getElementById('search-button'); 
    if (searchButton) {
        searchButton.addEventListener('click', searchNews);
    }
});
