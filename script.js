// Inicializar mapa
const map = L.map('map').setView([-34.6037, -58.3816], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Añadir marcadores de ejemplo
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
    "Exclusión Social": "#2ecc71",
    "Problemas Ambientales": "#f39c12"
};

markers.forEach(marker => {
    L.marker([marker.lat, marker.lng], {
        title: marker.title
    })
    .bindPopup(`<b>${marker.title}</b><br>${marker.category}`)
    .addTo(map);
    
    // Añadir marcadores de calor (puntos circulares para visualización)
    L.circleMarker([marker.lat, marker.lng], {
        radius: 12,
        fillColor: categoryColors[marker.category],
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(map);
});

// Configurar gráficos
const categoryCtx = document.getElementById('categoryChart').getContext('2d');
const categoryChart = new Chart(categoryCtx, {
    type: 'bar',
    data: {
        labels: ['Exclusión Social', 'Discriminación Género', 'Trabajo Informal', 'Vivienda Precaria', 'Hostilidad Urbana'],
        datasets: [{
            label: 'Número de Observaciones',
            data: [45, 32, 28, 19, 37],
            backgroundColor: [
                '#2ecc71',
                '#9b59b6',
                '#3498db',
                '#e67e22',
                '#e74c3c'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Cantidad de Observaciones'
                }
            }
        }
    }
});

const trendCtx = document.getElementById('trendChart').getContext('2d');
const trendChart = new Chart(trendCtx, {
    type: 'line',
    data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Hostilidad Urbana',
                data: [12, 19, 15, 17, 22, 25],
                borderColor: '#e74c3c',
                backgroundColor: '#e74c3c',
                tension: 0.3,
                fill: false,
                pointBackgroundColor: '#e74c3c',
                pointBorderColor: '#fff',
                pointBorderWidth: 1
            },
            {
                label: 'Trabajo Informal',
                data: [8, 12, 10, 14, 18, 20],
                borderColor: '#3498db',
                backgroundColor: '#3498db',
                tension: 0.3,
                fill: false,
                pointBackgroundColor: '#3498db',
                pointBorderColor: '#fff',
                pointBorderWidth: 1
            },
            {
                label: 'Exclusión Social',
                data: [15, 18, 22, 20, 25, 30],
                borderColor: '#2ecc71',
                backgroundColor: '#2ecc71',
                tension: 0.3,
                fill: false,
                pointBackgroundColor: '#2ecc71',
                pointBorderColor: '#fff',
                pointBorderWidth: 1
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Cantidad de Observaciones'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Mes'
                }
            }
        }
    }
});

// Evento para botón de reporte
document.querySelector('.hero .btn-accent').addEventListener('click', function() {
    document.querySelector('.report-section').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('obs-title').focus(); // Pone el foco en el primer campo del formulario
});

// =====================================
// Mejoras en JavaScript (Validación de Formulario - sin Backend)
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
        // Si todo es válido, aquí iría la lógica para "enviar" los datos.
        // Como no hay backend, simulamos un envío exitoso.
        alert('¡Observación publicada con éxito! (Esto es una simulación)');
        reportForm.reset(); // Limpiar el formulario
        // Ocultar mensajes de error si el formulario se limpió y era válido
        document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.form-group.error').forEach(el => el.classList.remove('error'));

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