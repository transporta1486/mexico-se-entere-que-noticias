// Funciones para escapar caracteres especiales de una cadena HTML (Seguridad XSS)
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

// --- Variables Globales ---
let currentIndex = 0;
let autoSlide;
let deferredPrompt; 

// --- Funciones de Utilidad (Alerta Temporal) ---

function alertMessage(message) {
    console.warn("Mensaje para el usuario:", message);
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = 'position: fixed; bottom: 50px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 10px 20px; border-radius: 5px; z-index: 2000; box-shadow: 0 4px 8px rgba(0,0,0,0.2); opacity: 0; transition: opacity 0.3s;';
    tempDiv.textContent = message;
    document.body.appendChild(tempDiv);
    
    setTimeout(() => { tempDiv.style.opacity = 1; }, 10);
    
    setTimeout(() => {
        tempDiv.style.opacity = 0;
        setTimeout(() => { document.body.removeChild(tempDiv); }, 300);
    }, 3000);
}

// --- Carga de JSON y Renderizado ---

async function getNewsData() {
    // **NOTA IMPORTANTE:**
    // ASEGÚRATE DE QUE TUS NOTICIAS REALES TENGAN UN 'id' ÚNICO Y EL CAMPO 'categoria'
    
    const newsJsonData = {
        "noticias_list": [
            // Ejemplos de noticias con IDs y categorías
            { "id": "2e3c0d60", "titulo": "Asesinan a Camilo Ochoa, 'El Alucín', en su domicilio en Temixco", "resumen": "El influencer Camilo Ochoa, conocido como 'El Alucín', fue asesinado a balazos...", "imagen": "https://i.postimg.cc/zfJ0KVJ4/FB-IMG-1755480044118.jpg", "categoria": "policía", "autor": "Javier Huerta Martinez", "destacada": false },
            { "id": "a9b8c7d6", "titulo": "Baches afectan casi el 80 % del Valle de México", "resumen": "Denuncias ciudadanas revelan que los baches se han convertido en un problema crítico y generalizado...", "imagen": "https://i.postimg.cc/xdr6Ct7j/FB-IMG-1755466516879.jpg", "categoria": "infraestructura", "autor": "Javier Huerta Martinez", "destacada": false },
            { "id": "1f2g3h4i", "titulo": "🚨 Detienen a ex-funcionario en Naucalpan por desvío de fondos", "resumen": "La Fiscalía anticorrupción ejecutó una orden de aprehensión contra el ex-titular de obras públicas.", "imagen": "https://i.postimg.cc/sX5dxMKq/f3eed-16-08-2025-bety-1.jpg", "categoria": "naucalpan", "autor": "Javier Huerta Martinez", "destacada": true },
            { "id": "c7d6e5f4", "titulo": "Tragedia en Atizapán: Fuerte choque en la Calzada San Mateo", "resumen": "Dos vehículos impactados dejan saldo de dos heridos graves y tráfico denso.", "imagen": "https://i.postimg.cc/d08j8525/telefericotorreonsl-312b03dd-focus-0-0-1200-600.webp", "categoria": "atizapan", "autor": "Redacción", "destacada": false },
            { "id": "b8c7d6e5", "titulo": "Nuevo parque ecológico inaugurado en Tlalnepantla", "resumen": "El gobierno municipal celebra la apertura de una nueva área verde en la zona poniente.", "imagen": "https://i.postimg.cc/J4nx9c8h/incendio-consume-nueve-locales-en-un-mercado-de-monterrey-2496html-incendio-nljpg-8123html-f0dbfbc7.webp", "categoria": "tlalnepantla", "autor": "Redacción", "destacada": false },
            { "id": "f9g0h1i2", "titulo": "Feria del empleo en Cuautitlán Izcalli con más de 50 empresas", "resumen": "Oportunidades de trabajo para jóvenes y adultos en la zona industrial de Izcalli.", "imagen": "https://placehold.co/600x338/26A69A/FFFFFF?text=Empleo+Izcalli", "categoria": "izcalli", "autor": "Redacción", "destacada": false },
            { "id": "j3k4l5m6", "titulo": "Vecinos de Nicolás Romero denuncian falta de agua por 4 días", "resumen": "Problemas con el suministro afectan a varias colonias; el ayuntamiento promete soluciones inmediatas.", "imagen": "https://placehold.co/600x338/546E7A/FFFFFF?text=Agua+NR", "categoria": "nicolas-romero", "autor": "Vecinos", "destacada": false }
        ]
    };
    
    return newsJsonData.noticias_list || [];
}

// **MODIFICADA: Ahora crea el enlace a noticia.html**
function renderNews(newsList, containerId) {
    const newsContainer = document.getElementById(containerId);
    if (!newsContainer) return;

    if (!newsList.length) {
        newsContainer.innerHTML = '<p class="no-news">No se encontraron noticias para esta sección.</p>';
        return;
    }

    newsContainer.innerHTML = '';
    newsList.forEach(news => {
        const safeTitle = escapeHtml(news.titulo || 'Noticia');
        const isCarousel = containerId === 'carousel-inner';
        
        // URL de la Noticia Individual
        const newsUrl = `noticia.html?id=${news.id}`; 
        
        const articleContent = isCarousel ? `
            <a href="${newsUrl}" class="carousel-link">
                <img src="${news.imagen || 'https://via.placeholder.com/800x400?text=Imagen+No+Disponible'}" alt="${safeTitle}">
                <div class="carousel-content">
                    <h3>${safeTitle}</h3>
                    <p>${escapeHtml(news.resumen)}</p>
                    <div class="author-info">
                        <span>Por: ${escapeHtml(news.autor || 'Redacción')}</span>
                    </div>
                </div>
            </a>
            <button class="share-btn" onclick="shareArticle('${safeTitle}')">Compartir</button>
        ` : `
            <article>
                <a href="${newsUrl}">
                    <img src="${news.imagen || 'https://via.placeholder.com/800x400?text=Imagen+No+Disponible'}" alt="${safeTitle}">
                    <h4>${safeTitle}</h4>
                    <p>${escapeHtml(news.resumen)}</p>
                </a>
                <div class="author-info">
                    <span>Por: ${escapeHtml(news.autor || 'Redacción')}</span>
                </div>
                <button class="share-btn" onclick="shareArticle('${safeTitle}')">Compartir</button>
            </article>
        `;

        const tag = isCarousel ? 'div' : 'span';
        const classNames = isCarousel ? 'carousel-item' : 'news-card'; 

        if (isCarousel) {
             newsContainer.innerHTML += `<${tag} class="${classNames}">${articleContent}</${tag}>`;
        } else {
             newsContainer.innerHTML += `<div class="${classNames}">${articleContent}</div>`;
        }
    });
}


// Función unificada para cargar noticias filtradas por categoría
async function loadFilteredNews(category, containerId) {
    const noticias = await getNewsData();
    let filteredNews = noticias;

    if (category) {
        filteredNews = noticias.filter(n => n.categoria && n.categoria.toLowerCase() === category.toLowerCase());
    }
    
    renderNews(filteredNews.slice(0, 6), containerId);
}

// Función unificada para cargar el carrusel filtrado por categoría
async function loadFilteredCarousel(category) {
    const noticias = await getNewsData();
    
    let destacadas = noticias;
    
    if (category) {
        destacadas = noticias.filter(n => n.destacada && n.categoria && n.categoria.toLowerCase() === category.toLowerCase());
        
        if (destacadas.length === 0) {
            destacadas = noticias.filter(n => n.categoria && n.categoria.toLowerCase() === category.toLowerCase());
        }
    } else {
        // Si no hay categoría (index.html), usar todas las destacadas
        destacadas = noticias.filter(n => n.destacada);
    }
    
    const lista = destacadas.length ? destacadas.slice(0, 3) : noticias.slice(0, 3);
    
    renderNews(lista, 'carousel-inner');

    const items = document.querySelectorAll('.carousel-item');
    if (items.length > 0) {
        items[0].classList.add('active');
    }

    if (lista.length > 1) {
        clearInterval(autoSlide);
        autoSlide = setInterval(() => moveCarousel(1), 5000);
    }
}

// Función para obtener un parámetro de la URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// **NUEVA LÓGICA DE CARGA DE ARTÍCULO ÚNICO**
async function loadSingleArticle(id) {
    const noticias = await getNewsData();
    const article = noticias.find(n => n.id === id);
    const container = document.getElementById('news-article-container');
    const titleElement = document.querySelector('title');

    if (!container) return;

    if (!article) {
        container.innerHTML = '<h2>🚨 Error 404: Noticia No Encontrada</h2><p>Lo sentimos, el artículo solicitado no existe o fue eliminado.</p>';
        titleElement.textContent = 'Error 404 | México Se Enteré Qué';
        return;
    }

    const safeTitle = escapeHtml(article.titulo);
    titleElement.textContent = safeTitle + ' | México Se Enteré Qué'; // Actualiza el título de la pestaña

    container.innerHTML = `
        <h1>${safeTitle}</h1>
        <div class="article-meta">
            <span>📅 ${new Date().toLocaleDateString('es-MX')}</span>
            <span>✍️ Por: ${escapeHtml(article.autor || 'Redacción')}</span>
            <span>🏷️ Categoría: ${escapeHtml(article.categoria)}</span>
        </div>
        <img src="${article.imagen || 'https://via.placeholder.co/1200x600?text=Imagen+Principal'}" alt="${safeTitle}" class="article-image">
        <p class="article-summary">${escapeHtml(article.resumen)}</p>
        
        <section class="article-body">
            <h3>Contenido completo</h3>
            <p>Este es el cuerpo del artículo. En un sistema real, aquí iría el texto completo y detallado de la noticia que cargaste con el ID <strong>${id}</strong>. </p>
            <p>Para esta demostración, el contenido completo es el mismo que el resumen, pero en un entorno real cargarías un campo adicional (ej. "contenido_completo") de tu JSON.</p>
        </section>

        <button class="share-btn large" onclick="shareArticle('${safeTitle}')">Compartir Artículo</button>
    `;
    
    // Cargar noticias relacionadas
    const relatedNews = noticias
        .filter(n => n.categoria === article.categoria && n.id !== article.id)
        .slice(0, 3);
        
    renderNews(relatedNews, 'related-news-container');
}


// --- Carrusel Control ---
function moveCarousel(direction) {
    const items = document.querySelectorAll('.carousel-item');
    if (items.length <= 1) return;
    
    if (items[currentIndex]) { items[currentIndex].classList.remove('active'); }

    currentIndex = (currentIndex + direction + items.length) % items.length;
    
    const carouselInner = document.getElementById('carousel-inner');
    if (carouselInner) {
        carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    
    if (items[currentIndex]) { items[currentIndex].classList.add('active'); }
}
window.moveCarousel = moveCarousel;

// --- Búsqueda ---
async function searchNews() {
    const searchInput = document.getElementById('search');
    if (!searchInput) return;
    
    const query = (searchInput.value || '').toLowerCase();
    const noticias = await getNewsData();
    
    const filteredNews = noticias
        .filter(n => (n.titulo || '').toLowerCase().includes(query) || (n.resumen || '').toLowerCase().includes(query));
    
    renderNews(filteredNews.slice(0, 6), 'news-container');
    alertMessage(`Resultados de búsqueda cargados para: ${escapeHtml(query)}`);
}
window.searchNews = searchNews;

// --- Compartir ---
function shareArticle(title) {
    const url = window.location.href;
    const text = `¡Mira esta noticia en México Se Enteré Qué!: ${title}`;
    if (navigator.share) {
        navigator.share({ title, text, url }).catch(() => {});
    } else {
        alertMessage(`Copia este enlace para compartir: ${url}`);
    }
}
window.shareArticle = shareArticle;

// --- Menú / Búsqueda (UI) ---
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
window.toggleMenu = toggleMenu;

function toggleSearch() {
    const searchInputContainer = document.getElementById('search-input');
    const navMenu = document.getElementById('nav-menu');

    if (searchInputContainer) {
        searchInputContainer.classList.toggle('active');
        if (navMenu) { navMenu.classList.remove('active'); }
        
        const searchInput = document.getElementById('search');
        if (searchInputContainer.classList.contains('active') && searchInput) {
            searchInput.focus();
        }
    }
}
window.toggleSearch = toggleSearch;

// --- Cookies y App Modal ---

function openCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner && localStorage.getItem('cookies-consent') === null) {
        banner.style.display = 'block';
    }
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

    // Solo muestra el banner si no está instalada la PWA
    if (isPWAInstalled()) {
        appModal.style.display = 'none';
    } else {
        appModal.style.display = 'flex';
    }
}

function hideAppModal() {
    const appModal = document.getElementById('app-modal');
    if (appModal) {
        appModal.style.display = 'none'; 
    }
}
window.hideAppModal = hideAppModal;

// --- LÓGICA DE INSTALACIÓN PWA (Smart Banner) ---

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

function installPWA(e) {
    e.preventDefault();
    
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                alertMessage('¡Gracias por instalar nuestra App!');
            } else {
                alertMessage('Instalación cancelada.');
            }
            deferredPrompt = null;
            hideAppModal(); 
        });
    } else {
        alertMessage('Tu navegador no soporta la instalación directa. Prueba usando el menú del navegador (ej. "Añadir a pantalla de inicio").');
    }
}
window.installPWA = installPWA; 

// --- Evento Principal (Unificado y Final) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Detección de la página actual
    const path = window.location.pathname;
    
    if (path.includes('noticia.html')) {
        // **LÓGICA PARA PÁGINA DE NOTICIA INDIVIDUAL**
        const articleId = getUrlParameter('id');
        if (articleId) {
            loadSingleArticle(articleId);
        } else {
            document.getElementById('news-article-container').innerHTML = '<h2>ID de noticia no proporcionado.</h2>';
        }
        
    } else {
        // **LÓGICA PARA PÁGINAS DE LISTADO (Index, Atizapán, etc.)**
        let categoryToFilter = null;
        
        // Mapea la URL a la categoría de noticias (usa minúsculas)
        if (path.includes('atizapan.html')) {
            categoryToFilter = 'atizapan';
        } else if (path.includes('tlalnepantla.html')) {
            categoryToFilter = 'tlalnepantla';
        } else if (path.includes('cuatitlan-izcalli.html')) {
            categoryToFilter = 'izcalli'; 
        } else if (path.includes('nicolas-romero.html')) {
            categoryToFilter = 'nicolas-romero'; 
        } else if (path.includes('naucalpan.html')) {
            categoryToFilter = 'naucalpan';
        }
        // Si es index.html, categoryToFilter es null y carga las destacadas.

        loadFilteredNews(categoryToFilter, 'news-container');
        loadFilteredCarousel(categoryToFilter);
    }
    
    // 2. Lógica de PWA, Cookies, Búsqueda (Se ejecuta en todas las páginas)
    checkAppModalVisibility();

    const consent = localStorage.getItem('cookies-consent');
    const acceptBtn = document.getElementById('accept-cookies');
    const rejectBtn = document.getElementById('reject-cookies');

    if (!consent) {
        setTimeout(openCookieBanner, 1000); 
    }
    
    // Manejadores de eventos de cookies y búsqueda
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookies-consent', 'accepted');
            hideCookieBanner();
            // Ya que aceptó, el banner de la app no debería salir hasta que borre el caché
            hideAppModal(); 
            alertMessage('Cookies aceptadas.');
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            localStorage.setItem('cookies-consent', 'rejected');
            hideCookieBanner();
            alertMessage('Cookies rechazadas.');
        });
    }
    
    const searchButton = document.getElementById('search-button'); 
    if (searchButton) {
        searchButton.addEventListener('click', searchNews);
    }
});
