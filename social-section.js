const SOCIAL_ICONS = {
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>'
};

function buildSocialBtn(link) {
    const icon = SOCIAL_ICONS[link.type] || '';
    const pending = link.pending || !link.url;

    if (pending) {
        return `
            <span class="social-hub-btn social-hub-btn--${link.type} social-hub-btn--pending" title="Enlace próximamente">
                <span class="social-hub-btn-icon">${icon}</span>
                <span class="social-hub-btn-text">
                    <strong>${link.label}</strong>
                    <small>${link.handle || 'Próximamente'}</small>
                </span>
            </span>`;
    }

    return `
        <a href="${link.url}" class="social-hub-btn social-hub-btn--${link.type}" target="_blank" rel="noopener noreferrer">
            <span class="social-hub-btn-icon">${icon}</span>
            <span class="social-hub-btn-text">
                <strong>${link.label}</strong>
                <small>${link.handle || 'Seguir'}</small>
            </span>
            <span class="social-hub-btn-arrow" aria-hidden="true">↗</span>
        </a>`;
}

function renderSocialSection(container, config, ciudadLabel) {
    if (!container || !config) return;

    const linksHtml = (config.links || []).map(buildSocialBtn).join('');
    const cityLine = ciudadLabel
        ? `<p class="social-hub-city">Cobertura en <strong>${ciudadLabel}</strong></p>`
        : '';

    container.innerHTML = `
        <div class="social-hub-inner">
            <div class="social-hub-glow" aria-hidden="true"></div>
            <div class="social-hub-content">
                <div class="social-hub-head">
                    <span class="social-hub-live"><span class="live-dot"></span> En vivo en redes</span>
                    <h2 class="social-hub-title">${config.title || 'Síguenos'}</h2>
                    <p class="social-hub-subtitle">${config.subtitle || 'Recibe noticias locales al momento'}</p>
                    ${cityLine}
                </div>
                <div class="social-hub-buttons">
                    ${linksHtml}
                </div>
                <p class="social-hub-note">¿Tienes más enlaces? Envíanoslos y los agregamos aquí.</p>
            </div>
        </div>`;
}

function initSocialSection() {
    const container = document.getElementById('social-section');
    if (!container || !window.SOCIAL_CONFIG) return;

    const ciudad = document.body.dataset.ciudad;
    if (ciudad && SOCIAL_CONFIG.municipios[ciudad]) {
        const muni = SOCIAL_CONFIG.municipios[ciudad];
        renderSocialSection(container, {
            title: `Síguenos en ${ciudad}`,
            subtitle: 'Noticias, reportes y alertas de tu municipio en tiempo real',
            links: muni.links
        }, ciudad);
        return;
    }

    renderSocialSection(container, SOCIAL_CONFIG.main);
}

document.addEventListener('DOMContentLoaded', initSocialSection);
