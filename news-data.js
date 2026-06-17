function normalizeNoticias(data) {
    return Array.isArray(data) ? data : (data.noticias || []);
}

function getEmbeddedNoticias() {
    if (!window.__NOTICIAS_CACHE__) return null;
    return normalizeNoticias(window.__NOTICIAS_CACHE__);
}

async function fetchNoticias(url) {
    const path = url || 'noticias.json';

    if (window.location.protocol !== 'file:') {
        try {
            const response = await fetch(path);
            if (response.ok) {
                const data = await response.json();
                return normalizeNoticias(data);
            }
        } catch (_) {}
    }

    const embedded = getEmbeddedNoticias();
    if (embedded) return embedded;

    throw new Error('No se pudieron cargar las noticias');
}

function buildNoticiasDataJs(noticias) {
    const json = JSON.stringify(noticias, null, 2);
    return '/** Copia este archivo como noticias-data.js junto a noticias.json */\nwindow.__NOTICIAS_CACHE__ = ' + json + ';\n';
}

window.fetchNoticias = fetchNoticias;
window.buildNoticiasDataJs = buildNoticiasDataJs;
