/**
 * Una noticia por municipio — edita noticias.json
 * Cada página tiene data-ciudad="..." y muestra su única noticia.
 */
function getCiudad() {
    return document.body.dataset.ciudad || '';
}

function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

function placeholderImg() {
    return 'https://via.placeholder.com/1200x600/0c0e1a/7dd3fc?text=Noticias';
}

function buildFeatured(news, ciudad) {
    const titulo = escapeHtml(news.titulo || 'Sin título');
    const resumen = escapeHtml(news.resumen || '');
    const autor = escapeHtml(news.autor || 'Redacción');
    const categoria = escapeHtml((news.categoria || 'general').toUpperCase());
    const fecha = formatDate(news.fecha);
    const img = news.imagen || placeholderImg();

    return `
        <article class="featured-article">
            <div class="featured-image">
                <img src="${img}" alt="${titulo}" loading="eager">
                <div class="featured-image-overlay"></div>
                <span class="news-badge featured-badge">${categoria}</span>
            </div>
            <div class="featured-body">
                <div class="featured-meta-top">
                    <span class="pill">Última noticia</span>
                    <span class="featured-location">${escapeHtml(ciudad)}</span>
                </div>
                <h2 class="featured-title">${titulo}</h2>
                <p class="featured-resumen">${resumen}</p>
                <div class="featured-meta">
                    ${fecha ? `<time>${fecha}</time>` : ''}
                    <span>Por ${autor}</span>
                </div>
                <button class="share-btn featured-share" data-title="${titulo}">Compartir noticia</button>
            </div>
        </article>`;
}

async function loadFeaturedNews() {
    const container = document.getElementById('featured-news');
    if (!container) return;

    const ciudad = getCiudad();
    try {
        const todas = await fetchNoticias('noticias.json');
        const noticia = todas.find(n => n.ciudad === ciudad);

        if (!noticia) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No hay noticia para <strong>${escapeHtml(ciudad)}</strong> aún.</p>
                    <p>Agrégala en <a href="admin.html">admin.html</a> o en noticias.json</p>
                </div>`;
            return;
        }

        container.innerHTML = buildFeatured(noticia, ciudad);

        const btn = container.querySelector('.featured-share');
        if (btn) {
            btn.addEventListener('click', () => shareArticle(btn.dataset.title));
        }
    } catch (e) {
        container.innerHTML = '<p class="empty-state">Error al cargar la noticia. Abre el sitio con un servidor local.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (getCiudad()) loadFeaturedNews();
});
