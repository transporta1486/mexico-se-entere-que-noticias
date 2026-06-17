let noticiasActuales = [];

function showStatus(message, type) {
    const el = document.getElementById('admin-status');
    el.textContent = message;
    el.className = 'admin-status ' + type;
}

function getJsonOutput() {
    return JSON.stringify({ noticias: noticiasActuales }, null, 2);
}

function updatePreview() {
    const preview = document.getElementById('admin-preview');
    preview.textContent = getJsonOutput();
    preview.classList.add('visible');
}

async function loadExistingNews() {
    try {
        noticiasActuales = await fetchNoticias('noticias.json');
    } catch {
        noticiasActuales = [];
    }
}

document.getElementById('fecha').valueAsDate = new Date();

document.getElementById('news-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const noticia = {
        id: 'noticia' + Date.now(),
        titulo: document.getElementById('titulo').value.trim(),
        resumen: document.getElementById('resumen').value.trim(),
        imagen: document.getElementById('imagen').value.trim(),
        categoria: document.getElementById('categoria').value,
        ciudad: document.getElementById('ciudad').value,
        fecha: document.getElementById('fecha').value,
        autor: document.getElementById('autor').value.trim() || 'Redacción',
        destacada: document.getElementById('destacada').checked
    };

    await loadExistingNews();
    noticiasActuales.unshift(noticia);
    updatePreview();
    showStatus('Noticia agregada. Descarga el JSON y súbelo a GitHub, o usa el Panel CMS.', 'success');
    document.getElementById('news-form').reset();
    document.getElementById('fecha').valueAsDate = new Date();
    document.getElementById('autor').value = 'Javier Huerta Martinez';
});

function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

document.getElementById('btn-download').addEventListener('click', async () => {
    await loadExistingNews();
    downloadFile('noticias.json', getJsonOutput(), 'application/json');
    if (typeof buildNoticiasDataJs === 'function') {
        downloadFile('noticias-data.js', buildNoticiasDataJs(noticiasActuales), 'text/javascript');
    }
    showStatus('Descargados noticias.json y noticias-data.js. Súbelos ambos al repo.', 'success');
});

document.getElementById('btn-copy').addEventListener('click', async () => {
    await loadExistingNews();
    try {
        await navigator.clipboard.writeText(getJsonOutput());
        showStatus('JSON copiado al portapapeles.', 'success');
    } catch {
        updatePreview();
        showStatus('No se pudo copiar. Usa el botón Descargar.', 'error');
    }
});

loadExistingNews();
