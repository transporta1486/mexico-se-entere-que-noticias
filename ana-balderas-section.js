function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));
}

function buildFigures(imagenes) {
    if (!imagenes || !imagenes.length) return '';
    return imagenes.map(fig => `
        <figure class="diputada-figure">
            <img src="${escapeHtml(fig.src || '')}" alt="${escapeHtml(fig.alt || '')}" class="diputada-figure-img" loading="lazy">
            ${fig.caption ? `<figcaption>${escapeHtml(fig.caption)}</figcaption>` : ''}
        </figure>`).join('');
}

function buildBlockquote(cita) {
    if (!cita) return '';
    return `<blockquote class="diputada-blockquote"><p>${escapeHtml(cita)}</p></blockquote>`;
}

function buildContacto(contacto) {
    if (!contacto) return '';
    const items = (contacto.items || []).map(item => `<li>${escapeHtml(item)}</li>`).join('');
    return `
        <div class="diputada-contacto">
            <h4>${escapeHtml(contacto.titulo || 'Contacto')}</h4>
            ${contacto.intro ? `<p>${escapeHtml(contacto.intro)}</p>` : ''}
            ${items ? `<ul>${items}</ul>` : ''}
            ${contacto.redes ? `<p>${escapeHtml(contacto.redes)}</p>` : ''}
        </div>`;
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

const SHARE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 11.2 15.6 6.4M8.2 12.8l7.4 4.8"/></svg>`;

const SHARE_OPTIONS = [
    {
        id: 'whatsapp',
        label: 'WhatsApp',
        hint: 'Enviar al instante',
        className: 'diputada-share-opt--wa',
        icon: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>`
    },
    {
        id: 'facebook',
        label: 'Facebook',
        hint: 'Publicar enlace',
        className: 'diputada-share-opt--fb',
        icon: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`
    },
    {
        id: 'x',
        label: 'X',
        hint: 'Compartir post',
        className: 'diputada-share-opt--x',
        icon: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
    },
    {
        id: 'copy',
        label: 'Copiar',
        hint: 'Enlace al portapapeles',
        className: 'diputada-share-opt--copy',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`
    },
    {
        id: 'native',
        label: 'Más opciones',
        hint: 'Menú del dispositivo',
        className: 'diputada-share-opt--native',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/></svg>`
    }
];

function buildShareZone() {
    const quick = SHARE_OPTIONS.filter(o => o.id !== 'native').map(opt => `
        <button type="button" class="diputada-share-quick ${opt.className}" data-share="${opt.id}" aria-label="Compartir en ${opt.label}">
            <span class="diputada-share-quick-icon">${opt.icon}</span>
            <span class="diputada-share-quick-label">${opt.label}</span>
        </button>`).join('');

    return `
        <div class="diputada-share-zone">
            <div class="diputada-share-beam" aria-hidden="true"></div>
            <p class="diputada-share-tagline">
                <span class="diputada-share-dot" aria-hidden="true"></span>
                Ayuda a difundir esta historia
            </p>
            <button type="button" class="diputada-share-orb" aria-expanded="false" aria-controls="diputada-share-panel">
                <span class="diputada-share-orb-halo" aria-hidden="true"></span>
                <span class="diputada-share-orb-body">
                    <span class="diputada-share-orb-icon">${SHARE_ICON}</span>
                    <span class="diputada-share-orb-text">
                        <strong>Compartir ahora</strong>
                        <small>Lleva la solidaridad de Atizapán más lejos</small>
                    </span>
                    <span class="diputada-share-orb-arrow" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                    </span>
                </span>
            </button>
            <div class="diputada-share-quick-row" role="group" aria-label="Compartir rápido">
                ${quick}
            </div>
            <div id="diputada-share-panel" class="diputada-share-panel" hidden>
                <p class="diputada-share-panel-label">Elige dónde compartir</p>
                <button type="button" class="diputada-share-opt diputada-share-opt--native" data-share="native">
                    <span class="diputada-share-opt-icon">${SHARE_OPTIONS.find(o => o.id === 'native').icon}</span>
                    <span class="diputada-share-opt-text">
                        <strong>Más opciones</strong>
                        <small>Menú de tu dispositivo</small>
                    </span>
                </button>
            </div>
        </div>`;
}

function getDiputadaSharePayload(cfg) {
    const title = cfg.titulo || 'Solidaridad Atizapán — Dip. Ana Balderas';
    const text = `${title}. ${cfg.resumen || ''}`.trim();
    const base = window.location.href.split('#')[0];
    const url = `${base}#diputada-section`;
    return { title, text, url };
}

function showDiputadaToast(message) {
    let toast = document.getElementById('diputada-share-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'diputada-share-toast';
        toast.className = 'toast-message diputada-share-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.remove('visible'), 2800);
}

function openShareWindow(shareUrl) {
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=640,height=520');
}

async function handleDiputadaShare(action, cfg) {
    const { title, text, url } = getDiputadaSharePayload(cfg);
    const fullText = `${text} ${url}`;

    switch (action) {
        case 'whatsapp':
            openShareWindow(`https://wa.me/?text=${encodeURIComponent(fullText)}`);
            break;
        case 'facebook':
            openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
            break;
        case 'x':
            openShareWindow(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
            break;
        case 'copy':
            try {
                await navigator.clipboard.writeText(fullText);
                showDiputadaToast('Enlace copiado al portapapeles');
            } catch (_) {
                showDiputadaToast(fullText);
            }
            break;
        case 'native':
            if (navigator.share) {
                navigator.share({ title, text, url }).catch(() => {});
            } else {
                try {
                    await navigator.clipboard.writeText(fullText);
                    showDiputadaToast('Enlace copiado — pégalo donde quieras compartir');
                } catch (_) {
                    showDiputadaToast('Usa WhatsApp o copia el enlace');
                }
            }
            break;
        default:
            break;
    }
}

function bindDiputadaShare(container, cfg) {
    const trigger = container.querySelector('.diputada-share-orb');
    const panel = container.querySelector('.diputada-share-panel');
    const zone = container.querySelector('.diputada-share-zone');
    if (!zone) return;

    const setOpen = (open) => {
        if (trigger) {
            trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
            trigger.classList.toggle('is-open', open);
        }
        if (panel) {
            panel.hidden = !open;
            panel.classList.toggle('is-visible', open);
        }
    };

    if (trigger && panel) {
        trigger.addEventListener('click', () => setOpen(panel.hidden));
    }

    zone.querySelectorAll('[data-share]').forEach(btn => {
        btn.addEventListener('click', () => {
            handleDiputadaShare(btn.dataset.share, cfg);
            if (btn.dataset.share !== 'native') setOpen(false);
        });
    });

    document.addEventListener('click', (e) => {
        if (panel && !panel.hidden && !zone.contains(e.target)) setOpen(false);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel && !panel.hidden) setOpen(false);
    });
}

function renderDiputadaSection(container, cfg) {
    if (!container || !cfg) return;

    const parrafos = (cfg.cuerpo || []).map(p => `<p>${escapeHtml(p)}</p>`).join('');
    const videoHtml = buildVideoBlock(cfg);
    const figurasHtml = buildFigures(cfg.imagenes);
    const citaHtml = buildBlockquote(cfg.cita);
    const contactoHtml = buildContacto(cfg.contacto);
    const cierreHtml = cfg.cierre ? `<p class="diputada-cierre">${escapeHtml(cfg.cierre)}</p>` : '';
    const foto = escapeHtml(cfg.foto || cfg.imagen || '');
    const altNombre = escapeHtml(cfg.nombre || 'Diputada Ana Balderas');
    const mediaHtml = videoHtml || (!figurasHtml ? `<img src="${escapeHtml(cfg.imagen || '')}" alt="${escapeHtml(cfg.titulo || 'Noticia')}" class="diputada-image" loading="lazy">` : '');

    container.innerHTML = `
        <div class="diputada-inner glass-panel">
            <div class="diputada-glow" aria-hidden="true"></div>
            <div class="diputada-content">
                <div class="diputada-head">
                    <div class="diputada-profile">
                        <div class="diputada-portrait-wrap">
                            <img src="${foto}" alt="${altNombre}" class="diputada-portrait" loading="eager">
                            <span class="diputada-portrait-ring" aria-hidden="true"></span>
                            <span class="diputada-portrait-badge">Diputada</span>
                        </div>
                        <div class="diputada-profile-text">
                            <span class="pill diputada-pill">En la región</span>
                            <p class="diputada-cargo">${escapeHtml(cfg.cargo || '')}</p>
                            <h2 class="diputada-title">${altNombre}</h2>
                        </div>
                    </div>
                    <h3 class="diputada-subtitle">${escapeHtml(cfg.titulo || '')}</h3>
                    ${cfg.fecha ? `<time class="diputada-date">${escapeHtml(cfg.fecha)}</time>` : ''}
                </div>
                <div class="diputada-body">
                    <div class="diputada-media">
                        ${mediaHtml}
                    </div>
                    <div class="diputada-text">
                        <p class="diputada-lead">${escapeHtml(cfg.resumen || '')}</p>
                        ${parrafos}
                        ${citaHtml}
                        ${figurasHtml}
                        ${contactoHtml}
                        ${cierreHtml}
                        ${buildShareZone()}
                    </div>
                </div>
            </div>
        </div>`;

    bindDiputadaShare(container, cfg);
}

function initDiputadaSection() {
    const container = document.getElementById('diputada-section');
    if (!container || !window.DIPUTADA_CONFIG) return;
    renderDiputadaSection(container, DIPUTADA_CONFIG);
}

document.addEventListener('DOMContentLoaded', initDiputadaSection);
