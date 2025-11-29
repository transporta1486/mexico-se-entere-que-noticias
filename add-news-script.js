// =================================================================
// 1. CONFIGURACIÓN DE FIREBASE E INICIALIZACIÓN
// =================================================================

// Credenciales copiadas de la Consola de Firebase
// DEBEN COINCIDIR EXACTAMENTE CON LAS DE TU SCRIPT.JS Y FIREBASE CONSOLE
const firebaseConfig = {
    apiKey: "AIzaSyBPbCmeaCd6sYJoO_9JqEWzWievDw_fFwc", 
    authDomain: "noticiaspwa-58270.firebaseapp.com",
    projectId: "noticiaspwa-58270",
    storageBucket: "noticiaspwa-58270.appspot.com", // ¡Asegúrate de que este sea tu bucket correcto!
    messagingSenderId: "758477934480",
    appId: "1:758477934480:web:10f781e64eff91b21a2d15",
};

// Inicializa Firebase (solo si no está ya inicializado)
// Usamos try-catch para evitar errores si el script se carga varias veces o en entornos con hot-reload
try {
    firebase.initializeApp(firebaseConfig);
} catch (e) {
    console.warn("Firebase ya inicializado o la librería no está cargada:", e);
}

// Obtén referencias a Firestore y Storage
const db = firebase.firestore();
const storage = firebase.storage(); // <-- Inicialización de Storage

// =================================================================
// 2. LÓGICA DEL FORMULARIO PARA AÑADIR NOTICIAS
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const addNewsForm = document.getElementById('add-news-form');
    const newsTitleInput = document.getElementById('news-title');
    const newsAuthorInput = document.getElementById('news-author');
    const newsCityInput = document.getElementById('news-city');
    const newsCategorySelect = document.getElementById('news-category');
    const newsSummaryInput = document.getElementById('news-summary');
    const newsContentInput = document.getElementById('news-content');
    const newsImageInput = document.getElementById('news-image');
    const newsFeaturedCheckbox = document.getElementById('news-featured');
    const previewImage = document.getElementById('preview-image');
    const loadingSpinner = document.getElementById('loading-spinner');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');

    let selectedFile = null; // Variable para guardar el archivo de imagen seleccionado

    // Evento para previsualizar la imagen cuando el usuario la selecciona
    newsImageInput.addEventListener('change', (event) => {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
            };
            reader.readAsDataURL(selectedFile);
        } else {
            previewImage.src = '';
            previewImage.style.display = 'none';
        }
    });

    // Evento para manejar el envío del formulario
    addNewsForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita el envío por defecto del formulario

        // Ocultar mensajes previos
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
        loadingSpinner.style.display = 'block'; // Mostrar spinner de carga

        const title = newsTitleInput.value;
        const author = newsAuthorInput.value;
        const city = newsCityInput.value;
        const category = newsCategorySelect.value;
        const summary = newsSummaryInput.value;
        const content = newsContentInput.value;
        const featured = newsFeaturedCheckbox.checked;

        if (!title || !author || !city || !category || !summary || !content) {
            showMessage(errorMessage, 'Por favor, rellena todos los campos obligatorios.', 'error');
            loadingSpinner.style.display = 'none';
            return;
        }

        try {
            let imageUrl = ''; // Variable para almacenar la URL de la imagen

            // 1. Si hay una imagen seleccionada, subirla a Cloud Storage
            if (selectedFile) {
                // Crear una referencia única en Storage usando un timestamp o un UUID
                const storageRef = storage.ref(`news_images/${Date.now()}_${selectedFile.name}`);
                const snapshot = await storageRef.put(selectedFile); // Subir el archivo
                imageUrl = await snapshot.ref.getDownloadURL(); // Obtener la URL de descarga
                console.log("Imagen subida. URL:", imageUrl);
            }

            // 2. Guardar la información de la noticia (incluida la URL de la imagen) en Firestore
            await db.collection('noticias').add({
                titulo: title,
                autor: author,
                ciudad: city,
                categoria: category,
                resumen: summary,
                contenido: content,
                fecha: firebase.firestore.FieldValue.serverTimestamp(), // Usa el timestamp del servidor
                imagen: imageUrl, // Guarda la URL de la imagen
                destacada: featured
            });

            showMessage(successMessage, '¡Noticia publicada con éxito!', 'success');
            addNewsForm.reset(); // Limpiar el formulario
            previewImage.src = ''; // Limpiar previsualización
            previewImage.style.display = 'none';
            selectedFile = null;

        } catch (error) {
            console.error("Error al publicar la noticia:", error);
            showMessage(errorMessage, `Error al publicar la noticia: ${error.message}`, 'error');
        } finally {
            loadingSpinner.style.display = 'none'; // Ocultar spinner
        }
    });

    function showMessage(element, message, type) {
        element.textContent = message;
        element.style.display = 'block';
        // Puedes añadir un temporizador para ocultar el mensaje automáticamente
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000); // 5 segundos
    }
});

