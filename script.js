
// Inicializar mapa
const map = L.map('map').setView([-34.6037, -58.3816], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Marcadores de ejemplo (Estos se eliminarán y se cargarán desde Firestore)
const markers = [
    {lat: -34.6037, lng: -58.3816, title: "Bancos con apoyabrazos", category: "Hostilidad Urbana"},
    {lat: -34.6100, lng: -58.4000, title: "Vendedores ambulantes", category: "Trabajo Informal"},
    {lat: -34.5900, lng: -58.3700, title: "Publicidad sexista", category: "Discriminación de Género"},
    {lat: -34.5950, lng: -58.3900, title: "Personas en situación de calle", category: "Exclusión Social"},
    {lat: -34.6000, lng: -58.4200, title: "Basura en espacio público", category: "Problemas Ambientales"}
];

const categoryColors = {
    "Hostilidad Urbana": "#e74c3c",
    "Trabajo Informal": "#3498db",
    "Discriminación de Género": "#9b59b6",
    "Exclusión Social": "#f39c12",
    "Vivienda Precaria": "#1abc9c",
    "Problemas Ambientales": "#2ecc71",
    "Accesibilidad Limitada": "#c0392b",
    "Participación Comunitaria": "#8e44ad",
    "Intervenciones Artísticas": "#f1c40f",
    "Espacios de Ocio": "#2980b9"
};

// =====================================
// Inicialización de Chart.js para el gráfico de categorías
// =====================================
const ctx = document.getElementById('categoryChart').getContext('2d');
const categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: Object.keys(categoryColors),
        datasets: [{
            data: Object.values(categoryColors).map(() => 0), // Inicialmente todo a 0
            backgroundColor: Object.values(categoryColors),
            borderColor: '#fff',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: 'var(--text-on-light)'
                }
            },
            title: {
                display: false,
                text: 'Observaciones por Categoría'
            }
        }
    }
});


// =====================================
// Inicialización de Firebase (ya está en index.html, pero se referencia aquí para el contexto)
// =====================================
// const firebaseConfig = { ... }; // Esto ya está en index.html
// firebase.initializeApp(firebaseConfig); // Esto ya está en index.html

// Referencia a Firestore (Asegúrate de que firebase.firestore() esté disponible)
const db = firebase.firestore();

// =====================================
// Mejoras en JavaScript (Validación de Formulario y Envío a Firestore)
// =====================================

const reportForm = document.getElementById('reportForm');

reportForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Detener el envío del formulario por defecto
    let isValid = true; // Variable para controlar si todo el formulario es válido

    // Función para mostrar/ocultar mensaje de error
    function showError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group');
        formGroup.classList.add('error');
        const errorMessageElement = formGroup.querySelector('.error-message');
        if (errorMessageElement) {
            errorMessageElement.textContent = message;
            errorMessageElement.style.display = 'block';
        }
        isValid = false; // El formulario no es válido
    }

    function hideError(inputElement) {
        const formGroup = inputElement.closest('.form-group');
        formGroup.classList.remove('error');
        const errorMessageElement = formGroup.querySelector('.error-message');
        if (errorMessageElement) {
            errorMessageElement.style.display = 'none';
            errorMessageElement.textContent = ''; // Limpiar mensaje
        }
    }

    // Limpiar errores previos al validar de nuevo
    document.querySelectorAll('.form-group.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.error-message').forEach(el => { el.textContent = ''; el.style.display = 'none'; });

    // Validar Título
    const obsTitle = document.getElementById('obs-title');
    if (obsTitle.value.trim() === '') {
        showError(obsTitle, 'El título es obligatorio.');
    } else {
        hideError(obsTitle);
    }

    // Validar Categoría
    const obsCategory = document.getElementById('obs-category');
    if (obsCategory.value === '') {
        showError(obsCategory, 'Selecciona una categoría.');
    } else {
        hideError(obsCategory);
    }

    // Validar Descripción
    const obsDescription = document.getElementById('obs-description');
    if (obsDescription.value.trim() === '') {
        showError(obsDescription, 'La descripción es obligatoria.');
    } else {
        hideError(obsDescription);
    }

    // Validar Impacto
    const obsImpact = document.getElementById('obs-impact');
    if (obsImpact.value === '') {
        showError(obsImpact, 'Selecciona un impacto.');
    } else {
        hideError(obsImpact);
    }

    // Validar Ubicación
    const obsLocationText = document.getElementById('obs-location-text');
    if (obsLocationText.value.trim() === '') {
        showError(obsLocationText, 'La ubicación es obligatoria.');
    } else {
        hideError(obsLocationText);
    }

    // Validar cantidad de archivos (si se seleccionaron)
    const obsMedia = document.getElementById('obs-media');
    if (obsMedia.files.length > 3) {
        showError(obsMedia, 'Solo se permiten un máximo de 3 archivos.');
    } else {
        hideError(obsMedia);
    }
    
    if (isValid) {
        // === Lógica para enviar datos a Firestore ===
        const observationData = {
            title: obsTitle.value.trim(),
            category: obsCategory.value,
            description: obsDescription.value.trim(),
            tags: document.getElementById('obs-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
            impact: obsImpact.value,
            locationText: obsLocationText.value.trim(),
            anonymous: document.getElementById('obs-anonymous').checked,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(), // Marca de tiempo del servidor
            // Coordenadas si se obtienen, o vacías si no
            latitude: null,
            longitude: null
        };

        // Si se obtuvo la ubicación por geolocalización, añadirla a los datos
        const currentLocValue = document.getElementById('obs-location-text').value;
        const latMatch = currentLocValue.match(/Lat: (-?\d+\.\d+)/);
        const lngMatch = currentLocValue.match(/Lng: (-?\d+\.\d+)/);
        if (latMatch && lngMatch) {
            observationData.latitude = parseFloat(latMatch[1]);
            observationData.longitude = parseFloat(lngMatch[1]);
        }
        
        // **IMPORTANTE:** Para subir archivos, necesitarías Firebase Storage.
        // Esto añade más complejidad y código (manejo de promises, progreso de subida).
        // Por ahora, solo guardaremos los metadatos de la observación.
        // Puedes añadir un placeholder para la imagen si quieres que se vea algo.
        observationData.imageUrl = 'https://via.placeholder.com/800x400?text=Imagen+No+Disponible';

        db.collection("observaciones").add(observationData)
            .then((docRef) => {
                alert('¡Observación publicada con éxito! ID: ' + docRef.id);
                reportForm.reset(); // Limpiar el formulario
                // Ocultar mensajes de error si el formulario se limpió y era válido
                document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
                document.querySelectorAll('.form-group.error').forEach(el => el.classList.remove('error'));
                
                // Recargar las observaciones para mostrar la nueva
                fetchAndDisplayObservations(); 
            })
            .catch((error) => {
                console.error("Error al añadir documento: ", error);
                alert("Error al publicar la observación. Por favor, inténtalo de nuevo.");
            });

    } else {
        alert('Por favor, completa todos los campos obligatorios.');
    }
});

// Funcionalidad para "Usar ubicación actual"
const getLocationBtn = document.getElementById('getLocationBtn');
getLocationBtn.addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            // Aquí podrías usar un servicio de geocodificación inversa para obtener la dirección
            // Por simplicidad, solo mostraremos las coordenadas.
            document.getElementById('obs-location-text').value = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
            hideError(document.getElementById('obs-location-text')); // Ocultar error si se obtuvo la ubicación
            alert(`Ubicación actual obtenida: Latitud ${lat.toFixed(4)}, Longitud ${lng.toFixed(4)}`);
        }, function(error) {
            let errorMessage = 'No se pudo obtener tu ubicación actual.';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += ' Por favor, permite el acceso a la ubicación en tu navegador.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += ' Información de ubicación no disponible.';
                    break;
                case error.TIMEOUT:
                    errorMessage += ' La solicitud para obtener la ubicación ha caducado.';
                    break;
                    case error.UNKNOWN_ERROR:
                    errorMessage += ' Ha ocurrido un error desconocido.';
                    break;
            }
            showError(document.getElementById('obs-location-text'), errorMessage);
            alert(errorMessage);
        });
    } else {
        showError(document.getElementById('obs-location-text'), 'Tu navegador no soporta geolocalización.');
        alert('Tu navegador no soporta la API de geolocalización.');
    }
});

// Funcionalidad para "Seleccionar en mapa" (simplificada)
const selectOnMapBtn = document.getElementById('selectOnMapBtn');
selectOnMapBtn.addEventListener('click', function() {
    alert('Haz clic en el mapa para seleccionar una ubicación. (Esta función requeriría un mapa interactivo para seleccionar un punto específico, lo cual es más complejo sin backend)');
});

// Manejo visual de la carga de archivos
const mediaUploadDiv = document.querySelector('.media-upload');
const mediaUploadInput = document.getElementById('obs-media');

mediaUploadInput.addEventListener('change', function() {
    const fileCount = this.files.length;
    const messageElement = mediaUploadDiv.querySelector('p');
    if (fileCount > 0) {
        messageElement.textContent = `${fileCount} archivo(s) seleccionado(s).`;
        hideError(mediaUploadInput); // Ocultar error si ya se corrigió
    } else {
        messageElement.textContent = 'Arrastra y suelta archivos aquí o haz clic para seleccionar';
    }
});


// =====================================
// NUEVO: Funciones para cargar observaciones desde Firestore y mostrarlas
// =====================================

async function fetchAndDisplayObservations() {
    // Vaciar los marcadores actuales del mapa (si los hubiera)
    map.eachLayer(function(layer) {
        // No eliminar el tile layer base de OpenStreetMap
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });

    const observationsCollection = db.collection("observaciones");
    const observationGrid = document.querySelector('.observation-grid');
    observationGrid.innerHTML = '<p style="text-align: center; color: #777;">Cargando observaciones...</p>'; // Mensaje de carga

    const categoryCounts = {}; // Para el gráfico de categorías

    try {
        const snapshot = await observationsCollection.orderBy("timestamp", "desc").get();
        observationGrid.innerHTML = ''; // Limpiar el mensaje de carga
        
        if (snapshot.empty) {
            observationGrid.innerHTML = '<p style="text-align: center; color: #777;">No hay observaciones publicadas aún.</p>';
            // Resetear el gráfico si no hay datos
            categoryChart.data.labels = Object.keys(categoryColors);
            categoryChart.data.datasets[0].data = Object.values(categoryColors).map(() => 0);
            categoryChart.update();
            return; // Salir de la función si no hay observaciones
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            
            // Añadir al mapa
            if (data.latitude !== null && data.longitude !== null) {
                const color = categoryColors[data.category] || '#7f8c8d'; // Gris por defecto
                
                L.circleMarker([data.latitude, data.longitude], {
                    radius: 8, // Un poco más pequeño para el marcador de calor
                    fillColor: color,
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                })
                .bindPopup(`<b>${data.title}</b><br>${data.category}<br>${data.description}<br><small>(${data.locationText})</small>`)
                .addTo(map);

                 // Opcional: También podrías añadir un marcador de icono si lo prefieres
                 // L.marker([data.latitude, data.longitude]).addTo(map).bindPopup(`<b>${data.title}</b>`);
            }

            // Añadir a la cuadrícula de observaciones
            const observationCard = document.createElement('div');
            observationCard.classList.add('observation-card');
            
            const impactClass = data.impact ? `impact-${data.impact}` : ''; // high, medium, low
            const impactIcon = data.impact === 'alto' ? '<i class="fas fa-exclamation-triangle" aria-hidden="true" style="color: #e74c3c;"></i> Alto impacto' :
                               data.impact === 'medio' ? '<i class="fas fa-exclamation-circle" aria-hidden="true" style="color: #f39c12;"></i> Medio impacto' :
                               data.impact === 'bajo' ? '<i class="fas fa-check-circle" aria-hidden="true" style="color: #27ae60;"></i> Bajo impacto' : '';

            // Fecha formateada (manejar el caso de que timestamp sea nulo o indefinido)
            const date = data.timestamp && data.timestamp.seconds ? new Date(data.timestamp.seconds * 1000).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Fecha desconocida';

            observationCard.innerHTML = `
                <div class="observation-image" style="background-image: url('${data.imageUrl || 'https://via.placeholder.com/800x400?text=Imagen+No+Disponible'}');" alt="Imagen de la observación."></div>
                <div class="observation-content">
                    <span class="observation-category" style="background-color: ${categoryColors[data.category] || '#7f8c8d'};">${data.category}</span>
                    <h3 class="observation-title">${data.title}</h3>
                    <p>${data.description}</p>
                    <div class="observation-meta">
                        <span><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${data.locationText}</span>
                        <span class="${impactClass}">${impactIcon}</span>
                    </div>
                     <small style="color: #999; display: block; margin-top: 10px;">Publicado: ${date} ${data.anonymous ? '(Anónimo)' : ''}</small>
                </div>
            `;
            observationGrid.appendChild(observationCard);

            // Actualizar conteo para el gráfico
            categoryCounts[data.category] = (categoryCounts[data.category] || 0) + 1;
        });

        // Actualizar el gráfico de categorías con los datos reales
        const chartLabels = Object.keys(categoryColors); 
        const chartData = chartLabels.map(label => categoryCounts[label] || 0);

        categoryChart.data.labels = chartLabels;
        categoryChart.data.datasets[0].data = chartData;
        categoryChart.update(); // Actualizar el gráfico

    } catch (error) {
        console.error("Error al obtener observaciones: ", error);
        observationGrid.innerHTML = '<p style="text-align: center; color: #e74c3c;">Error al cargar las observaciones. Por favor, inténtalo de nuevo.</p>';
        alert("Error al cargar las observaciones existentes.");
    }
}

// Llama a la función al cargar la página para mostrar las observaciones existentes
document.addEventListener('DOMContentLoaded', function() {
    fetchAndDisplayObservations();
    // También configurar la hamburguesa del menú
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
        // Toggle Nav
        nav.classList.toggle('nav-active');

        // Animate Links
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });
        // Burger Animation
        burger.classList.toggle('toggle');
    });

    // Cerrar menú al hacer clic en un enlace (para móviles)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav-active');
            burger.classList.remove('toggle');
            navLinks.forEach((l) => { l.style.animation = ''; }); // Reset animation
        });
    });
});
