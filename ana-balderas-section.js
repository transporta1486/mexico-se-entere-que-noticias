function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));
}

function buildVideoBlock(cfg) {
    if (!cfg.video) return '';

    const src = escapeHtml(cfg.video);
    const poster = cfg.videoPoster ? ` poster="${escapeHtml(cfg.videoPoster)}"` : '';

    return `
        <div class="diputada-video-wrap">
            <video class="diputada-video" controls playsinline preload="metadata"${poster}>
                <source src="${src}" type="video/mp4">
                Tu navegador no reproduce video. <a href="${src}">Descargar video</a>
            </video>
        </div>`;
}

function renderDiputadaSection(container, cfg) {
    if (!container || !cfg) return;

    const parrafos = (cfg.cuerpo || []).map(p => `<p>${escapeHtml(p)}</p>`).join('');
    const videoHtml = buildVideoBlock(cfg);

    container.innerHTML = `
        <div class="diputada-inner glass-panel">
            <div class="diputada-glow" aria-hidden="true"></div>
            <div class="diputada-content">
                <div class="diputada-head">
                    <span class="pill diputada-pill">En la región</span>
                    <p class="diputada-cargo">${escapeHtml(cfg.cargo || '')}</p>
                    <h2 class="diputada-title">${escapeHtml(cfg.nombre || 'Diputada Ana Balderas')}</h2>
                    <h3 class="diputada-subtitle">${escapeHtml(cfg.titulo || '')}</h3>
                    ${cfg.fecha ? `<time class="diputada-date">${escapeHtml(cfg.fecha)}</time>` : ''}
                </div>
                <div class="diputada-body">
                    <div class="diputada-media">
                        ${videoHtml || `<img src="${escapeHtml(cfg.imagen || '')}" alt="${escapeHtml(cfg.titulo || 'Noticia')}" class="diputada-image" loading="lazy">`}
                    </div>
                    <div class="diputada-text">
                        <p class="diputada-lead">${escapeHtml(cfg.resumen || '')}</p>
                        ${parrafos}
                    </div>
                </div>
            </div>
        </div>`;
}

function initDiputadaSection() {
    const container = document.getElementById('diputada-section');
    if (!container || !window.DIPUTADA_CONFIG) return;
    renderDiputadaSection(container, DIPUTADA_CONFIG);
}

document.addEventListener('DOMContentLoaded', initDiputadaSection);
