// ... (código existente de mapa y gráficos) ...

// =====================================
// Inicialización de Firebase (ya está en index.html, pero se referencia aquí para el contexto)
// =====================================
// const firebaseConfig = { ... }; // Esto ya está en index.html
// firebase.initializeApp(firebaseConfig); // Esto ya está en index.html

// Referencia a Firestore
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
            tags: obsTags.value.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
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

        db.collection("observaciones").add(observationData)
            .then((docRef) => {
                alert('¡Observación publicada con éxito! ID: ' + docRef.id);
                reportForm.reset(); // Limpiar el formulario
                // Ocultar mensajes de error si el formulario se limpió y era válido
                document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
                document.querySelectorAll('.form-group.error').forEach(el => el.classList.remove('error'));
                
                // Opcional: recargar los datos en el mapa o la lista de observaciones
                // fetchAndDisplayObservations(); // Necesitarías una función para esto
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

// Puedes llamar a esta función al cargar la página para mostrar las observaciones existentes
// Opcional: modificar los gráficos con datos reales
async function fetchAndDisplayObservations() {
    // Vaciar los marcadores actuales del mapa (si los hubiera)
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });
    // Volver a añadir el tile layer si se eliminó por error
    if (!map.hasLayer(L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'))) {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }


    const observationsCollection = db.collection("observaciones");
    const observationGrid = document.querySelector('.observation-grid');
    observationGrid.innerHTML = ''; // Limpiar las observaciones existentes en el HTML

    const newMarkers = [];
    const categoryCounts = {}; // Para el gráfico de categorías

    try {
        const snapshot = await observationsCollection.orderBy("timestamp", "desc").get();
        snapshot.forEach(doc => {
            const data = doc.data();
            
            // Añadir al mapa
            if (data.latitude && data.longitude) {
                L.marker([data.latitude, data.longitude], {
                    title: data.title
                })
                .bindPopup(`<b>${data.title}</b><br>${data.category}<br>${data.description}`)
                .addTo(map);

                 // Marcador de calor para el mapa (usando los colores predefinidos o uno por defecto)
                const color = categoryColors[data.category] || '#7f8c8d'; // Gris por defecto
                L.circleMarker([data.latitude, data.longitude], {
                    radius: 12,
                    fillColor: color,
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map);

                newMarkers.push({lat: data.latitude, lng: data.longitude, title: data.title, category: data.category});
            }

            // Añadir a la cuadrícula de observaciones
            const observationCard = document.createElement('div');
            observationCard.classList.add('observation-card');
            
            const impactClass = data.impact ? `impact-${data.impact}` : ''; // high, medium, low
            const impactIcon = data.impact === 'alto' ? '<i class="fas fa-fire" aria-hidden="true"></i> Alto impacto' :
                               data.impact === 'medio' ? '<i class="fas fa-fire" aria-hidden="true"></i> Medio impacto' :
                               data.impact === 'bajo' ? '<i class="fas fa-fire" aria-hidden="true"></i> Bajo impacto' : '';

            // Fecha formateada
            const date = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString('es-ES') : 'Fecha desconocida';

            observationCard.innerHTML = `
                <div class="observation-image" style="background-image: url('https://via.placeholder.com/800x400?text=Imagen+No+Disponible');" alt="Imagen de la observación."></div>
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
        const chartLabels = Object.keys(categoryColors); // Usar las claves de categoryColors para los labels
        const chartData = chartLabels.map(label => categoryCounts[label] || 0);

        categoryChart.data.labels = chartLabels;
        categoryChart.data.datasets[0].data = chartData;
        categoryChart.update(); // Actualizar el gráfico

    } catch (error) {
        console.error("Error al obtener observaciones: ", error);
        alert("Error al cargar las observaciones existentes.");
    }
}

// Llama a la función al cargar la página para mostrar las observaciones existentes
document.addEventListener('DOMContentLoaded', fetchAndDisplayObservations);
