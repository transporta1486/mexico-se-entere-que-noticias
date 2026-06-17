/**
 * Hasta 3 noticias por municipio — edita noticias.json
 */
const NEWS_PER_CITY = 3;

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
                    <span class="pill">Noticia destacada</span>
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

function buildNewsCard(news) {
    const titulo = escapeHtml(news.titulo || 'Sin título');
    const resumen = escapeHtml(news.resumen || '');
    const autor = escapeHtml(news.autor || 'Redacción');
    const categoria = escapeHtml((news.categoria || 'general').toUpperCase());
    const fecha = formatDate(news.fecha);
    const img = news.imagen || placeholderImg();

    return `
        <div class="news-card">
            <article>
                <div class="news-card-image">
                    <img src="${img}" alt="${titulo}" loading="lazy">
                    <span class="news-badge">${categoria}</span>
                </div>
                <div class="news-card-body">
                    ${fecha ? `<time class="news-date">${fecha}</time>` : ''}
                    <h4>${titulo}</h4>
                    <p>${resumen}</p>
                    <div class="news-meta">
                        <span class="author-info">Por: ${autor}</span>
                    </div>
                    <button class="share-btn" data-title="${titulo}">Compartir ↗</button>
                </div>
            </article>
        </div>`;
}

function bindShareButtons(root) {
    if (!root) return;
    root.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', () => shareArticle(btn.dataset.title));
    });
}

async function loadCityNews() {
    const featuredEl = document.getElementById('featured-news');
    const moreSection = document.getElementById('city-more-news');
    const gridEl = document.getElementById('city-news-grid');
    const ciudad = getCiudad();

    if (!featuredEl || !ciudad) return;

    try {
        const todas = await fetchNoticias('noticias.json');
        const delMunicipio = todas
            .filter(n => n.ciudad === ciudad)
            .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
            .slice(0, NEWS_PER_CITY);

        if (!delMunicipio.length) {
            featuredEl.innerHTML = `
                <div class="empty-state">
                    <p>No hay noticias para <strong>${escapeHtml(ciudad)}</strong> aún.</p>
                    <p>Agrégalas en <a href="admin.html">admin.html</a> o en noticias.json</p>
                </div>`;
            if (moreSection) moreSection.hidden = true;
            return;
        }

        const [destacada, ...resto] = delMunicipio;
        featuredEl.innerHTML = buildFeatured(destacada, ciudad);
        bindShareButtons(featuredEl);

        if (moreSection && gridEl && resto.length) {
            moreSection.hidden = false;
            const nameEl = document.getElementById('city-name-more');
            if (nameEl) nameEl.textContent = ciudad;
            gridEl.innerHTML = resto.map(buildNewsCard).join('');
            bindShareButtons(gridEl);
        } else if (moreSection) {
            moreSection.hidden = true;
        }
    } catch (e) {
        featuredEl.innerHTML = '<p class="empty-state">Error al cargar las noticias.</p>';
        if (moreSection) moreSection.hidden = true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (getCiudad()) loadCityNews();
});
