// Variables globales
let videoStream = null;
let capturedImageData = null;

// Elementos del DOM
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const startCameraBtn = document.getElementById('startCamera');
const capturePhotoBtn = document.getElementById('capturePhoto');
const retakePhotoBtn = document.getElementById('retakePhoto');
const submitBtn = document.getElementById('submitBtn');
const photoPreview = document.getElementById('photoPreview');
const capturedImage = document.getElementById('capturedImage');
const registroForm = document.getElementById('registroForm');
const messageDiv = document.getElementById('message');

// Event listeners
startCameraBtn.addEventListener('click', startCamera);
capturePhotoBtn.addEventListener('click', capturePhoto);
retakePhotoBtn.addEventListener('click', retakePhoto);
registroForm.addEventListener('submit', submitForm);

// Función para iniciar la cámara
async function startCamera() {
    try {
        // Solicitar acceso a la cámara trasera si está disponible
        const constraints = {
            video: {
                facingMode: 'environment', // Cámara trasera
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };

        // Si no hay cámara trasera, usar la delantera
        videoStream = await navigator.mediaDevices.getUserMedia(constraints)
            .catch(async () => {
                return await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                });
            });

        video.srcObject = videoStream;
        video.style.display = 'block';
        startCameraBtn.style.display = 'none';
        capturePhotoBtn.style.display = 'inline-block';

        // Ocultar mensaje de error si existe
        hideMessage();

    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        showMessage('Error al acceder a la cámara. Asegúrate de que tienes permisos y una cámara disponible.', 'error');
    }
}

// Función para capturar la foto
function capturePhoto() {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar el frame actual del video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir a data URL
    capturedImageData = canvas.toDataURL('image/jpeg', 0.8);

    // Mostrar la imagen capturada
    capturedImage.src = capturedImageData;
    photoPreview.style.display = 'block';

    // Ocultar video y mostrar controles de retomar
    video.style.display = 'none';
    capturePhotoBtn.style.display = 'none';
    retakePhotoBtn.style.display = 'inline-block';

    // Habilitar el botón de envío
    submitBtn.disabled = false;

    // Detener el stream de video
    stopVideoStream();
}

// Función para volver a tomar la foto
function retakePhoto() {
    // Ocultar preview de foto
    photoPreview.style.display = 'none';
    capturedImageData = null;

    // Mostrar video nuevamente
    video.style.display = 'block';
    retakePhotoBtn.style.display = 'none';
    capturePhotoBtn.style.display = 'inline-block';

    // Deshabilitar botón de envío
    submitBtn.disabled = true;

    // Reiniciar la cámara
    startCamera();
}

// Función para detener el stream de video
function stopVideoStream() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
}

// Función para obtener la fecha y hora actual en Bogotá
function getBogotaTime() {
    const now = new Date();

    // Obtener fecha y hora en zona horaria de Bogotá
    const bogotaTime = new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(now);

    // Crear fecha legible para mostrar al usuario
    const fechaLegible = new Intl.DateTimeFormat('es-ES', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(now);

    // Crear timestamp en formato ISO pero con la hora de Bogotá
    const [datePart, timePart] = bogotaTime.split(', ');
    const [day, month, year] = datePart.split('/');
    const [hour, minute, second] = timePart.split(':');
    const bogotaDate = new Date(year, month - 1, day, hour, minute, second);

    return {
        timestampUTC: now.toISOString(),
        timestampBogota: bogotaDate.toISOString(),
        fechaLegible: fechaLegible,
        zonaHoraria: 'America/Bogota'
    };
}

// Función para enviar el formulario
async function submitForm(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();

    if (!nombre) {
        showMessage('Por favor, ingresa tu nombre.', 'error');
        return;
    }

    if (!capturedImageData) {
        showMessage('Por favor, toma una foto antes de enviar.', 'error');
        return;
    }

    // Obtener timestamp actual en hora de Bogotá
    const tiempoBogota = getBogotaTime();

    // Crear objeto con los datos
    const registroData = {
        nombre: nombre,
        foto: capturedImageData,
        timestampUTC: tiempoBogota.timestampUTC,
        timestampBogota: tiempoBogota.timestampBogota,
        fechaLegible: tiempoBogota.fechaLegible,
        zonaHoraria: tiempoBogota.zonaHoraria
    };

    try {
        // Aquí puedes enviar los datos a un servidor
        // Por ahora, solo mostraremos los datos en consola y un mensaje de éxito
        console.log('Datos del registro:', registroData);

        // Simular envío (aquí iría tu código para enviar a un backend)
        // const response = await fetch('/api/registro', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(registroData)
        // });

        // Mostrar mensaje de éxito
        showMessage(`¡Registro exitoso! Bienvenido ${nombre}. Hora de llegada: ${registroData.fechaLegible}`, 'success');

        // Limpiar formulario
        registroForm.reset();
        photoPreview.style.display = 'none';
        capturedImageData = null;
        submitBtn.disabled = true;
        startCameraBtn.style.display = 'inline-block';
        capturePhotoBtn.style.display = 'none';
        retakePhotoBtn.style.display = 'none';
        video.style.display = 'none';

        // Detener cualquier stream activo
        stopVideoStream();

    } catch (error) {
        console.error('Error al enviar el registro:', error);
        showMessage('Error al enviar el registro. Inténtalo de nuevo.', 'error');
    }
}

// Función para mostrar mensajes
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    // Ocultar automáticamente después de 5 segundos para mensajes de éxito
    if (type === 'success') {
        setTimeout(() => {
            hideMessage();
        }, 5000);
    }
}

// Función para ocultar mensajes
function hideMessage() {
    messageDiv.style.display = 'none';
}

// Función para manejar errores de la cámara
function handleCameraError(error) {
    console.error('Error de cámara:', error);
    let message = 'Error al acceder a la cámara. ';

    switch (error.name) {
        case 'NotAllowedError':
            message += 'Debes permitir el acceso a la cámara.';
            break;
        case 'NotFoundError':
            message += 'No se encontró ninguna cámara.';
            break;
        case 'NotSupportedError':
            message += 'Tu navegador no soporta acceso a la cámara.';
            break;
        default:
            message += 'Verifica que tienes permisos y una cámara disponible.';
    }

    showMessage(message, 'error');
}

// Verificar soporte de la API de MediaDevices
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showMessage('Tu navegador no soporta acceso a la cámara. Actualiza tu navegador.', 'error');
    startCameraBtn.disabled = true;
}

// Cleanup al cerrar la página
window.addEventListener('beforeunload', () => {
    stopVideoStream();
});

