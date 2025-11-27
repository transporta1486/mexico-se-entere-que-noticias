// =================================================================
// 1. CONFIGURACIÓN DE FIREBASE E INICIALIZACIÓN
// =================================================================

// Credenciales copiadas de la Consola de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBPbCmeaCd6sYJoO_9JqEWzWievDw_fFwc", // <--- Tu API Key
    authDomain: "noticiaspwa-58270.firebaseapp.com",
    projectId: "noticiaspwa-58270",
    storageBucket: "noticiaspwa-58270.firebasestorage.app",
    messagingSenderId: "758477934480",
    appId: "1:758477934480:web:10f781e64eff91b21a2d15",
};

// Inicializa Firebase y crea la instancia de Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// =================================================================
// 2. FUNCIÓN PARA CARGAR Y MOSTRAR NOTICIAS DESDE FIRESTORE
// =================================================================
async function loadFilteredNewsFromFirestore(filter = 'todos') {
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = '<h2>Cargando noticias...</h2>'; 

    try {
        let query = db.collection('noticias')
                      .orderBy('fecha', 'desc'); // Ordena por fecha descendente

        // Aplica el filtro de categoría si no es 'todos'
        if (filter !== 'todos') {
            query = query.where('categoria', '==', filter);
        }

        const snapshot = await query.get();
        // Mapea los documentos para extraer solo los datos
        const news = snapshot.docs.map(doc => doc.data());

        // Limpia y renderiza
        newsContainer.innerHTML = ''; 
        
        if (news.length === 0) {
            newsContainer.innerHTML = '<h2>No hay noticias disponibles en esta categoría.</h2>';
            return;
        }

        // Itera sobre las noticias y las renderiza en el HTML
        news.forEach(article => {
            const articleElement = document.createElement('article');
            
            // CONVERSIÓN DE FECHA: La fecha en Firestore es un objeto Timestamp
            const readableDate = article.fecha ? article.fecha.toDate().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Fecha no disponible';

            articleElement.innerHTML = `
                <h3>${article.titulo}</h3>
                <p class="resumen">${article.resumen}</p>
                <div class="meta-data">
                    <span class="categoria">${article.categoria.toUpperCase()}</span>
                    <span class="fecha">${readableDate}</span>
                </div>
            `;
            articleElement.classList.add('news-article'); 
            newsContainer.appendChild(articleElement);
        });

    } catch (error) {
        console.error("Error al cargar las noticias desde Firestore: ", error);
        newsContainer.innerHTML = '<h2>Error al conectar con la base de datos. Asegúrate de que los datos estén en Firestore.</h2>';
    }
}

// =================================================================
// 3. FUNCIÓN DE FILTRADO (Asume que los botones tienen la clase 'filter-btn')
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Llamada inicial para cargar todas las noticias al iniciar
    loadFilteredNewsFromFirestore('todos'); 

    // 2. Configura los listeners para los botones de filtro
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Remueve la clase 'active' de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Añade la clase 'active' al botón clickeado
            event.target.classList.add('active');

            // Obtiene la categoría del atributo data-category
            const category = event.target.getAttribute('data-category');
            
            // Carga las noticias con el nuevo filtro
            loadFilteredNewsFromFirestore(category); 
        });
    });
});