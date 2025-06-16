const db = firebase.firestore();

const reportForm = document.getElementById('reportForm');

reportForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  const obsTitle = document.getElementById('obs-title').value.trim();
  const obsCategory = document.getElementById('obs-category').value;
  const obsDescription = document.getElementById('obs-description').value.trim();
  const obsImpact = document.getElementById('obs-impact').value;
  const obsLocationText = document.getElementById('obs-location-text').value.trim();
  const obsAnonymous = document.getElementById('obs-anonymous').checked;

  if (!obsTitle || !obsCategory || !obsDescription || !obsImpact || !obsLocationText) {
    alert("Por favor, completá todos los campos obligatorios.");
    return;
  }

  try {
    await db.collection("observaciones").add({
      titulo: obsTitle,
      categoria: obsCategory,
      descripcion: obsDescription,
      impacto: obsImpact,
      ubicacion: obsLocationText,
      anonimo: obsAnonymous,
      fecha: new Date().toISOString()
    });

    alert("¡Observación publicada!");
    reportForm.reset();
  } catch (error) {
    console.error("Error al guardar en Firestore:", error);
    alert("Error al guardar. Ver la consola.");
  }
});
